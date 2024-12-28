import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/gerants
router.get('/', async (req, res) => {
  try {
    const gerants = await prisma.gerant.findMany();
    res.json(gerants);
  } catch (error) {
    console.error('Erreur lors de la récupération des gérants:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des gérants' });
  }
});

// POST /api/gerants
router.post('/', async (req, res) => {
  try {
    const newGerant = await prisma.gerant.create({
      data: {
        ...req.body,
      },
    });
    res.status(201).json(newGerant);
  } catch (error) {
    console.error('Erreur lors de la création du gérant:', error);
    res.status(500).json({ message: 'Erreur lors de la création du gérant' });
  }
});

// PUT /api/gerants/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedGerant = await prisma.gerant.update({
      where: { id },
      data: req.body,
    });
    res.json(updatedGerant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du gérant:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du gérant' });
  }
});

// DELETE /api/gerants/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.gerant.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du gérant:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du gérant' });
  }
});

export default router;
