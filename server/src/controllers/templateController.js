'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTemplates(req, res, next) {
  try {
    const templates = await prisma.orderTemplate.findMany({
      where: { customerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ templates });
  } catch (err) {
    next(err);
  }
}

async function createTemplate(req, res, next) {
  try {
    const { name, items } = req.body;
    const template = await prisma.orderTemplate.create({
      data: {
        customerId: req.user.id,
        name,
        items,
      },
    });
    res.status(201).json({ template });
  } catch (err) {
    next(err);
  }
}

async function deleteTemplate(req, res, next) {
  try {
    const template = await prisma.orderTemplate.findFirst({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    await prisma.orderTemplate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Template deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTemplates, createTemplate, deleteTemplate };
