'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAuditLog(req, res, next) {
  try {
    const { userId, action, from, to, page: pageStr } = req.query;
    const page = Math.max(1, parseInt(pageStr) || 1);
    const pageSize = 50;

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { email: true, businessName: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAuditLog };
