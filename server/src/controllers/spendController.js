'use strict';

const { PrismaClient } = require('@prisma/client');
const { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth } = require('date-fns');
const prisma = new PrismaClient();

async function getSpendSummary(req, res, next) {
  try {
    const now = new Date();
    const weeks = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });

      const result = await prisma.order.aggregate({
        where: {
          customerId: req.user.id,
          status: { not: 'CANCELLED' },
          submittedAt: { gte: weekStart, lte: weekEnd },
        },
        _sum: { totalValue: true },
        _count: { id: true },
      });

      weeks.push({
        weekStart,
        weekEnd,
        total: Number(result._sum.totalValue || 0),
        orderCount: result._count.id,
      });
    }

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthResult = await prisma.order.aggregate({
      where: {
        customerId: req.user.id,
        status: { not: 'CANCELLED' },
        submittedAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalValue: true },
    });

    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const thisWeekResult = await prisma.order.aggregate({
      where: {
        customerId: req.user.id,
        status: { not: 'CANCELLED' },
        submittedAt: { gte: thisWeekStart, lte: thisWeekEnd },
      },
      _sum: { totalValue: true },
    });

    const completedWeeks = weeks.filter((w) => w.total > 0);
    const avgWeekly = completedWeeks.length
      ? completedWeeks.reduce((s, w) => s + w.total, 0) / completedWeeks.length
      : 0;

    res.json({
      weeks,
      monthTotal: Number(monthResult._sum.totalValue || 0),
      thisWeekTotal: Number(thisWeekResult._sum.totalValue || 0),
      avgWeekly: Math.round(avgWeekly * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
}

async function getTopProducts(req, res, next) {
  try {
    const monthStart = startOfMonth(new Date());

    const items = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          customerId: req.user.id,
          status: { not: 'CANCELLED' },
          submittedAt: { gte: monthStart },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, productName: true, productCode: true, price: true },
    });

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const topProducts = items.map((item) => ({
      product: productMap[item.productId],
      totalQuantity: item._sum.quantity,
    }));

    res.json({ topProducts });
  } catch (err) {
    next(err);
  }
}

async function getFavourites(req, res, next) {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const items = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          customerId: req.user.id,
          status: { not: 'CANCELLED' },
          submittedAt: { gte: threeMonthsAgo },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 8,
    });

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
      select: { id: true, productName: true, productCode: true, price: true, category: true },
    });

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const favourites = items
      .filter((i) => productMap[i.productId])
      .map((item) => ({
        ...productMap[item.productId],
        price: Number(productMap[item.productId].price),
        timesOrdered: item._sum.quantity,
      }));

    res.json({ favourites });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSpendSummary, getTopProducts, getFavourites };
