'use strict';

const { PrismaClient } = require('@prisma/client');
const { isPastCutoff, getDeliveryDate } = require('../utils/cutoffUtils');
const { generateOrderNumber } = require('../services/orderService');
const { auditLog, getClientIp } = require('../utils/auditLogger');
const { sendOrderConfirmationEmail } = require('../services/emailService');

const prisma = new PrismaClient();

async function submitOrder(req, res, next) {
  try {
    if (isPastCutoff()) {
      return res.status(403).json({
        error: 'Daily order cutoff has passed. Orders reopen at midnight.',
        code: 'CUTOFF_PASSED',
      });
    }

    const { items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products are unavailable' });
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    let totalValue = 0;
    const orderItems = items.map((item) => {
      const product = productMap[item.productId];
      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;
      totalValue += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const submittedAt = new Date();
    const deliveryDate = getDeliveryDate(submittedAt);
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: req.user.id,
        status: 'PENDING',
        deliveryDate,
        totalValue,
        submittedAt,
        notes: notes || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: { include: { product: true } },
        customer: { select: { contactName: true, businessName: true, email: true } },
      },
    });

    await auditLog(req.user.id, 'ORDER_SUBMITTED', getClientIp(req), {
      orderNumber,
      totalValue,
      itemCount: items.length,
    });

    try {
      await sendOrderConfirmationEmail(order.customer.email, {
        contactName: order.customer.contactName,
        order,
        items: order.items,
        deliveryDate,
      });
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr.message);
    }

    res.status(201).json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryDate: order.deliveryDate,
        totalValue: Number(order.totalValue),
        submittedAt: order.submittedAt,
        items: order.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.product.productName,
          productCode: i.product.productCode,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          lineTotal: Number(i.lineTotal),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 20;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: req.user.id },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: { include: { product: { select: { productName: true, productCode: true } } } } },
      }),
      prisma.order.count({ where: { customerId: req.user.id } }),
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
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, customerId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: formatOrder(order) });
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
    items: (order.items || []).map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.product.productName,
      productCode: i.product.productCode,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    })),
  };
}

module.exports = { submitOrder, getOrders, getOrderById };
