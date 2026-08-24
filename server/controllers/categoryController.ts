import { Router, Request, Response } from 'express';
import { CategoryRepository } from '../repositories/categoryRepository.js';

export const categoryRouter = Router();

// GET /api/v1/categories - Get all categories
categoryRouter.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await CategoryRepository.findAll();
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
