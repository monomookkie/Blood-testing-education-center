import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, async (req, res) => {
  const list = await prisma.announcement.findMany({ orderBy: { date: 'desc' } });
  res.json(list);
});

router.post('/', requireAdmin, async (req, res) => {
  const { title, content, type, fileName, fileData } = req.body;
  const item = await prisma.announcement.create({ data: { title, content, type: type || 'info', fileName, fileData } });
  res.status(201).json(item);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { title, content, type, fileName, fileData } = req.body;
  const item = await prisma.announcement.update({ where: { id: req.params.id }, data: { title, content, type, fileName, fileData } });
  res.json(item);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

export default router;
