import { ProductRepository } from '../repositories/productRepository.js';
import { CategoryRepository } from '../repositories/categoryRepository.js';
import { ReviewRepository } from '../repositories/reviewRepository.js';
import { Product, Review } from '../../src/types.js';

export class ProductService {
  static async getAllProducts(filters?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<Product[]> {
    return await ProductRepository.findAll(filters);
  }

  static async getProductById(id: string): Promise<{ product: Product; reviews: Review[] } | null> {
    const product = await ProductRepository.findById(id);
    if (!product) return null;
    const reviews = await ReviewRepository.findByProductId(id);
    return { product, reviews };
  }

  static async createOrUpdateProduct(productData: Partial<Product>): Promise<Product> {
    return await ProductRepository.save(productData);
  }

  static async deleteProduct(id: string): Promise<boolean> {
    return await ProductRepository.deleteById(id);
  }

  static async addReview(productId: string, userName: string, rating: number, comment: string): Promise<Review> {
    return await ReviewRepository.create(productId, userName, rating, comment);
  }
}
