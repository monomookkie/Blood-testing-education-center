import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/enrollments  (admin: all, user: own)
router.get('/', requireAuth, async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
  const enrollments = await prisma.enrollment.findMany({
    where,
    include: { course: { include: { materials: true } }, user: { select: { id: true, name: true, avatar: true, dept: true } }, certificate: true }
  });
  res.json(enrollments);
});

// POST /api/enrollments  (user enrolls in a course)
router.post('/', requireAuth, async (req, res) => {
  const { courseId } = req.body;
  const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId } } });
  if (existing) return res.status(400).json({ error: 'Already enrolled' });
  const enrollment = await prisma.enrollment.create({
    data: { userId: req.user.id, courseId },
    include: { course: true }
  });
  res.status(201).json(enrollment);
});

// PUT /api/enrollments/:id  (update progress / score)
router.put('/:id', requireAuth, async (req, res) => {
  const { progress, score, completed } = req.body;
  const enrollment = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
  if (!enrollment) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'ADMIN' && enrollment.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const data = {};
  if (progress !== undefined) data.progress = Number(progress);
  if (score !== undefined) data.score = Number(score);
  if (completed !== undefined) {
    data.completed = completed;
    if (completed && !enrollment.completedAt) data.completedAt = new Date();
  }

  const updated = await prisma.enrollment.update({ where: { id: req.params.id }, data, include: { course: true, certificate: true } });

  // Auto-issue certificate if completed and score meets passScore
  if (updated.completed && updated.score != null && !updated.certificate) {
    const course = await prisma.course.findUnique({ where: { id: updated.courseId } });
    if (updated.score >= course.passScore) {
      const date = new Date();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const count = await prisma.certificate.count();
      const certNumber = `HML-${date.getFullYear()}-${mm}${dd}-${String(count + 1).padStart(3, '0')}`;
      await prisma.certificate.create({
        data: { enrollmentId: updated.id, userId: updated.userId, courseId: updated.courseId, certNumber, score: updated.score }
      });
    }
  }

  res.json(updated);
});

// Admin: enroll a user into a course
router.post('/admin', requireAdmin, async (req, res) => {
  const { userId, courseId } = req.body;
  const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) return res.status(400).json({ error: 'Already enrolled' });
  const enrollment = await prisma.enrollment.create({ data: { userId, courseId }, include: { course: true, user: { select: { id: true, name: true } } } });
  res.status(201).json(enrollment);
});

export default router;
