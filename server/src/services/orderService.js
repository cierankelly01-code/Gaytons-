'use strict';

const { PrismaClient } = require('@prisma/client');
const { format } = require('date-fns');
const prisma = new PrismaClient();

async function generateOrderNumber() {
  const result = await prisma.$transaction(async (tx) => {
    const seq = await tx.orderSequence.update({
      where: { id: 1 },
      data: { nextVal: { increment: 1 } },
    });
    return seq.nextVal;
  });
  const year = new Date().getFullYear();
  return `GAY-${year}-${String(result).padStart(5, '0')}`;
}

module.exports = { generateOrderNumber };
