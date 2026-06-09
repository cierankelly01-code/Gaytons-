'use strict';

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { auditLog, getClientIp } = require('../../utils/auditLogger');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../../services/emailService');
const prisma = new PrismaClient();

function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '!@#$%';
  let pwd = '';
  for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  pwd += specials[Math.floor(Math.random() * specials.length)];
  pwd += Math.floor(Math.random() * 10);
  return pwd;
}

async function getCustomers(req, res, next) {
  try {
    const { active, search, sort = 'businessName', order = 'asc' } = req.query;
    const where = { role: 'CUSTOMER' };
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validSorts = ['businessName', 'contactName', 'email', 'createdAt'];
    const orderBy = validSorts.includes(sort) ? { [sort]: order === 'desc' ? 'desc' : 'asc' } : { businessName: 'asc' };

    const customers = await prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        businessName: true,
        contactName: true,
        phone: true,
        isActive: true,
        isLocked: true,
        lockedUntil: true,
        createdAt: true,
        orders: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: { submittedAt: true, totalValue: true },
        },
        _count: { select: { orders: true } },
      },
    });

    const withTotals = await Promise.all(
      customers.map(async (c) => {
        const spend = await prisma.order.aggregate({
          where: { customerId: c.id, status: { not: 'CANCELLED' } },
          _sum: { totalValue: true },
        });
        return {
          id: c.id,
          email: c.email,
          businessName: c.businessName,
          contactName: c.contactName,
          phone: c.phone,
          isActive: c.isActive,
          isLocked: c.isLocked,
          lockedUntil: c.lockedUntil,
          createdAt: c.createdAt,
          lastOrderDate: c.orders[0]?.submittedAt || null,
          totalOrders: c._count.orders,
          totalSpend: Number(spend._sum.totalValue || 0),
        };
      })
    );

    res.json({ customers: withTotals });
  } catch (err) {
    next(err);
  }
}

async function createCustomer(req, res, next) {
  try {
    const { businessName, contactName, email, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'CUSTOMER',
        businessName,
        contactName,
        phone,
        mustChangePassword: true,
      },
    });

    await auditLog(req.user.id, 'CUSTOMER_CREATED', getClientIp(req), {
      customerId: user.id,
      email: user.email,
      businessName,
    });

    try {
      await sendWelcomeEmail(user.email, {
        contactName,
        businessName,
        email: user.email,
        tempPassword,
        appUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
    }

    res.status(201).json({
      customer: {
        id: user.id,
        email: user.email,
        businessName: user.businessName,
        contactName: user.contactName,
        phone: user.phone,
        isActive: user.isActive,
      },
      tempPassword,
    });
  } catch (err) {
    next(err);
  }
}

async function getCustomer(req, res, next) {
  try {
    const customer = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        businessName: true,
        contactName: true,
        phone: true,
        isActive: true,
        isLocked: true,
        lockedUntil: true,
        failedLoginAttempts: true,
        createdAt: true,
        orders: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalValue: true,
            submittedAt: true,
            deliveryDate: true,
          },
        },
      },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({
      customer: {
        ...customer,
        orders: customer.orders.map((o) => ({ ...o, totalValue: Number(o.totalValue) })),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { businessName, contactName, phone } = req.body;
    const customer = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { businessName, contactName, phone },
      select: { id: true, email: true, businessName: true, contactName: true, phone: true, isActive: true },
    });

    await auditLog(req.user.id, 'CUSTOMER_UPDATED', getClientIp(req), { customerId: req.params.id });
    res.json({ customer: updated });
  } catch (err) {
    next(err);
  }
}

async function unlockCustomer(req, res, next) {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isLocked: false, lockedUntil: null, failedLoginAttempts: 0 },
    });
    await auditLog(req.user.id, 'CUSTOMER_UNLOCKED', getClientIp(req), { customerId: req.params.id });
    res.json({ message: 'Account unlocked' });
  } catch (err) {
    next(err);
  }
}

async function deactivateCustomer(req, res, next) {
  try {
    const { isActive } = req.body;
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !!isActive },
    });
    await auditLog(req.user.id, isActive ? 'CUSTOMER_ACTIVATED' : 'CUSTOMER_DEACTIVATED', getClientIp(req), {
      customerId: req.params.id,
    });
    res.json({ message: isActive ? 'Account activated' : 'Account deactivated' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const customer = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash, mustChangePassword: true, failedLoginAttempts: 0, isLocked: false, lockedUntil: null },
    });

    await auditLog(req.user.id, 'PASSWORD_RESET_BY_ADMIN', getClientIp(req), { customerId: req.params.id });

    try {
      await sendPasswordResetEmail(customer.email, {
        contactName: customer.contactName,
        tempPassword,
        appUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      });
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr.message);
    }

    res.json({ message: 'Password reset and email sent', tempPassword });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCustomers, createCustomer, getCustomer, updateCustomer, unlockCustomer, deactivateCustomer, resetPassword };
