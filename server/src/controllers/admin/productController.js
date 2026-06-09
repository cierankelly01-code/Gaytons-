'use strict';

const { PrismaClient } = require('@prisma/client');
const { auditLog, getClientIp } = require('../../utils/auditLogger');
const prisma = new PrismaClient();

async function getAllProducts(req, res, next) {
  try {
    const { category, search, available } = req.query;
    const where = {};
    if (category) where.category = category;
    if (available === 'true') where.isAvailable = true;
    if (available === 'false') where.isAvailable = false;
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ category: 'asc' }, { productCode: 'asc' }],
    });

    res.json({ products: products.map((p) => ({ ...p, price: Number(p.price) })) });
  } catch (err) {
    next(err);
  }
}

async function updateAvailability(req, res, next) {
  try {
    const { isAvailable } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { isAvailable },
    });
    await auditLog(req.user.id, 'PRODUCT_AVAILABILITY_UPDATED', getClientIp(req), {
      productId: req.params.id,
      productCode: product.productCode,
      isAvailable,
    });
    res.json({ product: { id: product.id, isAvailable: product.isAvailable } });
  } catch (err) {
    next(err);
  }
}

async function updatePrice(req, res, next) {
  try {
    const { price } = req.body;
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { price },
    });

    await auditLog(req.user.id, 'PRODUCT_PRICE_UPDATED', getClientIp(req), {
      productId: req.params.id,
      productCode: existing.productCode,
      oldPrice: Number(existing.price),
      newPrice: Number(price),
    });

    res.json({ product: { id: product.id, price: Number(product.price) } });
  } catch (err) {
    next(err);
  }
}

async function bulkPriceUpdate(req, res, next) {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const results = { updated: 0, notFound: [], changes: [] };

    for (const update of updates) {
      const product = await prisma.product.findUnique({ where: { productCode: String(update.productCode) } });
      if (!product) {
        results.notFound.push(update.productCode);
        continue;
      }
      const oldPrice = Number(product.price);
      const newPrice = Number(update.price);
      if (oldPrice !== newPrice) {
        await prisma.product.update({ where: { id: product.id }, data: { price: newPrice } });
        results.updated++;
        results.changes.push({
          productCode: update.productCode,
          productName: product.productName,
          oldPrice,
          newPrice,
        });
      }
    }

    await auditLog(req.user.id, 'BULK_PRICE_UPDATE', getClientIp(req), {
      updatedCount: results.updated,
      notFoundCount: results.notFound.length,
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllProducts, updateAvailability, updatePrice, bulkPriceUpdate };
