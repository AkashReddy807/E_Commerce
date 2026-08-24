import { Router, Request, Response } from 'express';
import { ProductService } from '../services/productService.js';

export const productRouter = Router();

// GET /api/v1/products - List all products with optional filters
productRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    const filters = {
      categoryId: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
      maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
      sort: sort ? String(sort) : undefined,
    };

    const products = await ProductService.getAllProducts(filters);
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/products/:id - Get product details with reviews
productRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await ProductService.getProductById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: result.product, reviews: result.reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/products - Create new product (Admin)
productRouter.post('/', async (req: Request, res: Response) => {
  try {
    const product = await ProductService.createOrUpdateProduct(req.body);
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/products/:id - Update product
productRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const product = await ProductService.createOrUpdateProduct({ ...req.body, id: req.params.id });
    res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/products/:id - Delete product
productRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/products/:id/reviews - Add customer review
productRouter.post('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { userName, rating, comment } = req.body;
    if (!userName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'User name, rating, and comment are required' });
    }
    const review = await ProductService.addReview(req.params.id, userName, Number(rating), comment);
    res.status(201).json({ success: true, message: 'Review added successfully', data: review });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
