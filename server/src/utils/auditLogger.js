'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditLog(userId, action, ipAddress, metadata = null) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        ipAddress: ipAddress || 'unknown',
        metadata: metadata ? metadata : undefined,
      },
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

module.exports = { auditLog, getClientIp };
