'use strict';

/**
 * Run once to create/reset the admin user in the production database:
 *   DATABASE_URL="<your-supabase-url>" node create-admin.js
 *
 * Or set DATABASE_URL in .env first, then just: node create-admin.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ADMIN_EMAIL    = 'admin@gaytonsbakery.co.uk';
const ADMIN_PASSWORD = 'Admin@Gaytons1';

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where:  { email: ADMIN_EMAIL },
    update: {
      passwordHash: hash,
      isActive:     true,
      isLocked:     false,
      lockedUntil:  null,
      failedLoginAttempts: 0,
    },
    create: {
      email:        ADMIN_EMAIL,
      passwordHash: hash,
      role:         'ADMIN',
      businessName: 'Gaytons Bakery',
      contactName:  'Admin',
      phone:        '01234 567890',
      isActive:     true,
    },
  });

  console.log('✓ Admin user ready');
  console.log('  Email:   ', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('  ID:      ', admin.id);
}

main()
  .catch((e) => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
