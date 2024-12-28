import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { barqueService } from '../services/barqueService';

const router: Router = Router();

const getBarques: RequestHandler = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(50, parseInt(String(req.query.limit)) || 10);
    const search = req.query.search ? String(req.query.search) : undefined;
    
    const result = await barqueService.getBarques(page, limit, search);
    res.json(result);
  } catch (err) {
    console.error('Error in getBarques route:', err);
    next(err);
  }
};

const createBarque: RequestHandler = async (req, res, next) => {
  try {
    const newBarque = await barqueService.createBarque(req.body);
    res.status(201).json(newBarque);
  } catch (err) {
    next(err);
  }
};

const bulkImport: RequestHandler = async (req, res, next) => {
  try {
    // First ensure default gerant exists
    await barqueService.getDefaultGerant();
    
    const newBarques = req.body;
    if (!Array.isArray(newBarques)) {
      res.status(400).json({ error: 'Invalid data format. Expected an array of barques.' });
      return;
    }

    if (newBarques.length === 0) {
      res.status(400).json({ error: 'Empty array provided.' });
      return;
    }

    const result = await barqueService.bulkImport(newBarques);
    res.json(result);
  } catch (error: any) {
    console.error('Bulk import error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred during bulk import',
      details: error.stack
    });
  }
};

const updateBarque: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updatedBarque = await barqueService.updateBarque(id, req.body);
    res.json(updatedBarque);
  } catch (err) {
    next(err);
  }
};

const deleteBarque: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await barqueService.deleteBarque(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Initialize default gerant handler
const initDefaultGerant: RequestHandler = async (req, res, next) => {
  try {
    const defaultGerant = await barqueService.initializeDefaultGerant();
    res.json({ success: true, gerant: defaultGerant });
  } catch (error) {
    console.error('Error initializing default gerant:', error);
    res.status(500).json({ success: false, error: 'Failed to initialize default gerant' });
  }
};

// Mount route handlers
router.get('/', getBarques);
router.post('/', createBarque);
router.post('/bulk', bulkImport);
router.post('/init-default-gerant', initDefaultGerant);
router.put('/:id', updateBarque);
router.delete('/:id', deleteBarque);

export default router;