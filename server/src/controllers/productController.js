'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORY_LABELS = {
  BREADS_WHITE: 'White Breads',
  BREADS_BROWN: 'Brown Breads',
  BREADS_MALTED: 'Malted Breads',
  BREADS_SOURDOUGH: 'Sourdough',
  ROLLS_BATCHES: 'Rolls & Batches',
  ROLLS_BURGERS: 'Burgers',
  ROLLS_SUBS: 'Subs & French',
  CAKES_INDIVIDUAL: 'Individual Cakes',
  CAKES_TRAYBAKE: 'Traybakes',
  CAKES_CATERER: 'Caterer Cakes',
  PASTRIES_SWEET: 'Pastries & Slices',
  PASTRIES_SAVOURY: 'Savouries',
  PIES: 'Pies',
  SCONES_TEACAKES: 'Scones & Teacakes',
};

async function getProducts(req, res, next) {
  try {
    const { category, search } = req.query;
    const where = { isAvailable: true };
    if (category && category !== 'ALL') where.category = category;
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ category: 'asc' }, { productCode: 'asc' }],
      select: {
        id: true,
        productCode: true,
        productName: true,
        price: true,
        category: true,
        isAvailable: true,
      },
    });

    res.json({ products: products.map((p) => ({ ...p, price: Number(p.price) })) });
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const counts = await prisma.product.groupBy({
      by: ['category'],
      where: { isAvailable: true },
      _count: { id: true },
      orderBy: { category: 'asc' },
    });

    const total = await prisma.product.count({ where: { isAvailable: true } });

    const categories = [
      { value: 'ALL', label: 'All Products', count: total },
      ...counts.map((c) => ({
        value: c.category,
        label: CATEGORY_LABELS[c.category] || c.category,
        count: c._count.id,
      })),
    ];

    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getCategories };
