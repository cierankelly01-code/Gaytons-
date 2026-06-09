'use strict';

const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay } = require('date-fns');
const { auditLog, getClientIp } = require('../../utils/auditLogger');
const prisma = new PrismaClient();

async function getAllOrders(req, res, next) {
  try {
    const { status, search, page: pageStr, date } = req.query;
    const page = Math.max(1, parseInt(pageStr) || 1);
    const pageSize = 20;

    const where = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.submittedAt = { gte: startOfDay(d), lte: endOfDay(d) };
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
        { customer: { contactName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          customer: { select: { businessName: true, contactName: true, email: true, phone: true } },
          items: { include: { product: { select: { productName: true, productCode: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders: orders.map(formatOrder),
      total,
      page,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { businessName: true, contactName: true, email: true, phone: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status, adminNotes } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, adminNotes: adminNotes || order.adminNotes },
    });

    await auditLog(req.user.id, 'ORDER_STATUS_UPDATED', getClientIp(req), {
      orderId: order.id,
      orderNumber: order.orderNumber,
      from: order.status,
      to: status,
    });

    res.json({ order: { id: updated.id, status: updated.status } });
  } catch (err) {
    next(err);
  }
}

async function getPickingSheet(req, res, next) {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        deliveryDate: { gte: startOfDay(date), lte: endOfDay(date) },
      },
      include: {
        customer: { select: { businessName: true, contactName: true, phone: true } },
        items: { include: { product: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });

    const consolidated = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId;
        if (!consolidated[key]) {
          consolidated[key] = {
            productId: key,
            productName: item.product.productName,
            productCode: item.product.productCode,
            category: item.product.category,
            totalQuantity: 0,
            customers: [],
          };
        }
        consolidated[key].totalQuantity += item.quantity;
        consolidated[key].customers.push({
          businessName: order.customer.businessName,
          quantity: item.quantity,
          orderNumber: order.orderNumber,
        });
      }
    }

    const byCategory = {};
    for (const item of Object.values(consolidated)) {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    }

    for (const cat of Object.keys(byCategory)) {
      byCategory[cat].sort((a, b) => a.productCode.localeCompare(b.productCode, undefined, { numeric: true }));
    }

    res.json({
      date,
      totalOrders: orders.length,
      byCategory,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.customer,
        status: o.status,
        totalValue: Number(o.totalValue),
        itemCount: o.items.length,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getTodayStats(req, res, next) {
  try {
    const today = new Date();
    const [orderCount, revenue, totalCustomers] = await Promise.all([
      prisma.order.count({
        where: {
          submittedAt: { gte: startOfDay(today), lte: endOfDay(today) },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.order.aggregate({
        where: {
          submittedAt: { gte: startOfDay(today), lte: endOfDay(today) },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalValue: true },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
    ]);

    const orderedTodayCustomers = await prisma.order.findMany({
      where: {
        submittedAt: { gte: startOfDay(today), lte: endOfDay(today) },
        status: { not: 'CANCELLED' },
      },
      select: { customerId: true },
      distinct: ['customerId'],
    });

    const orderedIds = new Set(orderedTodayCustomers.map((o) => o.customerId));

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentCustomers = await prisma.order.findMany({
      where: {
        submittedAt: { gte: twoWeeksAgo },
        status: { not: 'CANCELLED' },
      },
      select: {
        customerId: true,
        customer: { select: { businessName: true, contactName: true, phone: true } },
      },
      distinct: ['customerId'],
    });

    const notOrderedYet = recentCustomers.filter((rc) => !orderedIds.has(rc.customerId));

    res.json({
      ordersToday: orderCount,
      revenueToday: Number(revenue._sum.totalValue || 0),
      activeCustomers: totalCustomers,
      notOrderedToday: notOrderedYet.length,
      notOrderedCustomers: notOrderedYet.map((c) => ({
        customerId: c.customerId,
        businessName: c.customer.businessName,
        contactName: c.customer.contactName,
        phone: c.customer.phone,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getLiveFeed(req, res, next) {
  try {
    const today = new Date();
    const orders = await prisma.order.findMany({
      where: {
        submittedAt: { gte: startOfDay(today), lte: endOfDay(today) },
      },
      orderBy: { submittedAt: 'desc' },
      take: 50,
      include: {
        customer: { select: { businessName: true, contactName: true } },
        items: { select: { id: true } },
      },
    });

    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        businessName: o.customer.businessName,
        contactName: o.customer.contactName,
        submittedAt: o.submittedAt,
        itemCount: o.items.length,
        totalValue: Number(o.totalValue),
        status: o.status,
      })),
    });
  } catch (err) {
    next(err);
  }
}

function formatOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    deliveryDate: order.deliveryDate,
    totalValue: Number(order.totalValue),
    submittedAt: order.submittedAt,
    notes: order.notes,
    adminNotes: order.adminNotes,
    customer: order.customer,
    items: (order.items || []).map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.product.productName,
      productCode: i.product.productCode,
      category: i.product.category,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    })),
  };
}

module.exports = { getAllOrders, getOrderById, updateOrderStatus, getPickingSheet, getTodayStats, getLiveFeed };
