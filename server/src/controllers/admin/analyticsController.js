'use strict';

const { PrismaClient } = require('@prisma/client');
const { startOfWeek, endOfWeek, subWeeks, startOfMonth } = require('date-fns');
const prisma = new PrismaClient();

async function getOverview(req, res, next) {
  try {
    const now = new Date();
    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const result = await prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' }, submittedAt: { gte: weekStart, lte: weekEnd } },
        _sum: { totalValue: true },
        _count: { id: true },
      });
      weeks.push({ weekStart, weekEnd, total: Number(result._sum.totalValue || 0), orders: result._count.id });
    }

    const dayCounts = await prisma.$queryRaw`
      SELECT EXTRACT(DOW FROM "submittedAt") as dow, COUNT(*) as count, SUM("totalValue") as revenue
      FROM "Order"
      WHERE status != 'CANCELLED'
      GROUP BY dow
      ORDER BY dow
    `;

    res.json({ weeklyRevenue: weeks, dayOfWeekStats: dayCounts });
  } catch (err) {
    next(err);
  }
}

async function getSpendLeaderboard(req, res, next) {
  try {
    const { period = 'all' } = req.query;
    let dateFilter = {};
    const now = new Date();
    if (period === 'week') {
      dateFilter = {
        gte: startOfWeek(now, { weekStartsOn: 1 }),
        lte: endOfWeek(now, { weekStartsOn: 1 }),
      };
    } else if (period === 'month') {
      dateFilter = { gte: startOfMonth(now) };
    }

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER', isActive: true },
      select: { id: true, businessName: true, contactName: true },
    });

    const leaderboard = await Promise.all(
      customers.map(async (c) => {
        const where = { customerId: c.id, status: { not: 'CANCELLED' } };
        if (dateFilter.gte) where.submittedAt = dateFilter;

        const [agg, count, lastOrder] = await Promise.all([
          prisma.order.aggregate({ where, _sum: { totalValue: true }, _count: { id: true } }),
          prisma.order.count({ where }),
          prisma.order.findFirst({ where: { customerId: c.id }, orderBy: { submittedAt: 'desc' }, select: { submittedAt: true } }),
        ]);

        return {
          customerId: c.id,
          businessName: c.businessName,
          contactName: c.contactName,
          totalSpend: Number(agg._sum.totalValue || 0),
          orderCount: agg._count.id,
          avgOrderValue: agg._count.id > 0 ? Number(agg._sum.totalValue || 0) / agg._count.id : 0,
          lastOrderDate: lastOrder?.submittedAt || null,
        };
      })
    );

    leaderboard.sort((a, b) => b.totalSpend - a.totalSpend);
    const ranked = leaderboard.map((item, i) => ({ ...item, rank: i + 1 }));

    res.json({ leaderboard: ranked });
  } catch (err) {
    next(err);
  }
}

async function getTopProducts(req, res, next) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byQuantity = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { status: { not: 'CANCELLED' }, submittedAt: { gte: thirtyDaysAgo } } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productIds = byQuantity.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, productName: true, productCode: true },
    });
    const pm = Object.fromEntries(products.map((p) => [p.id, p]));

    const topByQuantity = byQuantity.map((i) => ({
      product: pm[i.productId],
      totalQuantity: i._sum.quantity,
      totalRevenue: Number(i._sum.lineTotal || 0),
    }));

    const byRevenue = [...byQuantity].sort((a, b) => Number(b._sum.lineTotal) - Number(a._sum.lineTotal));
    const topByRevenue = byRevenue.map((i) => ({
      product: pm[i.productId],
      totalQuantity: i._sum.quantity,
      totalRevenue: Number(i._sum.lineTotal || 0),
    }));

    res.json({ topByQuantity, topByRevenue });
  } catch (err) {
    next(err);
  }
}

async function getWeeklyRevenue(req, res, next) {
  try {
    const now = new Date();
    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const result = await prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' }, submittedAt: { gte: weekStart, lte: weekEnd } },
        _sum: { totalValue: true },
        _count: { id: true },
      });
      weeks.push({ weekStart, weekEnd, total: Number(result._sum.totalValue || 0), orders: result._count.id });
    }
    res.json({ weeks });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOverview, getSpendLeaderboard, getTopProducts, getWeeklyRevenue };
