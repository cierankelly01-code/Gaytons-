'use strict';
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Test@1234', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: { passwordHash: hash, isActive: true, isLocked: false, failedLoginAttempts: 0, mustChangePassword: false },
    create: {
      email: 'customer@test.com',
      passwordHash: hash,
      role: 'CUSTOMER',
      businessName: "Kelly's Deli",
      contactName: 'Jack Test',
      phone: '07700 000000',
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log('Done. Customer ID:', customer.id);
}

main()
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
