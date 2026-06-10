'use strict';
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin@Gaytons1', 12);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@gaytonsbakery.co.uk' },
    update: { passwordHash: hash, isActive: true, isLocked: false, lockedUntil: null, failedLoginAttempts: 0 },
    create: { email: 'admin@gaytonsbakery.co.uk', passwordHash: hash, role: 'ADMIN', businessName: 'Gaytons Bakery', contactName: 'Admin', phone: '01234 567890', isActive: true },
  });
  console.log('Done. Admin ID:', admin.id);
}

main()
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
