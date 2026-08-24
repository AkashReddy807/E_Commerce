import { Router, Request, Response } from 'express';
import { pool, isConnectedToPostgres, lastDbError, initDatabase } from '../db.js';
import { ProductRepository } from '../repositories/productRepository.js';
import { CategoryRepository } from '../repositories/categoryRepository.js';
import { OrderRepository } from '../repositories/orderRepository.js';
import { ReviewRepository } from '../repositories/reviewRepository.js';
import { CouponRepository } from '../repositories/couponRepository.js';

export const systemRouter = Router();

// GET /api/v1/system/status - Database health and connection info
systemRouter.get('/status', async (req: Request, res: Response) => {
  let dbHealthy = false;
  let latencyMs = 0;
  const start = Date.now();

  try {
    const pingRes = await pool.query('SELECT NOW() as server_time, version() as version;');
    latencyMs = Date.now() - start;
    dbHealthy = true;

    const [productsCount, categoriesCount, ordersCount, reviewsCount, couponsCount] = await Promise.all([
      ProductRepository.count(),
      CategoryRepository.count(),
      OrderRepository.count(),
      ReviewRepository.count(),
      CouponRepository.count(),
    ]);

    res.json({
      success: true,
      connected: true,
      provider: 'Supabase PostgreSQL',
      host: 'aws-0-ap-northeast-1.pooler.supabase.com',
      database: 'postgres',
      user: 'postgres.cuxhbnvfiuqxmwkgnkyi',
      latencyMs,
      serverTime: pingRes.rows[0].server_time,
      dbVersion: pingRes.rows[0].version,
      tableCounts: {
        products: productsCount,
        categories: categoriesCount,
        orders: ordersCount,
        reviews: reviewsCount,
        coupons: couponsCount,
      },
    });
  } catch (err: any) {
    res.json({
      success: false,
      connected: isConnectedToPostgres,
      provider: 'Supabase PostgreSQL',
      host: 'aws-0-ap-northeast-1.pooler.supabase.com',
      database: 'postgres',
      error: err.message || lastDbError,
      fallbackMode: true,
      tableCounts: {
        products: await ProductRepository.count(),
        categories: await CategoryRepository.count(),
        orders: await OrderRepository.count(),
        reviews: await ReviewRepository.count(),
        coupons: await CouponRepository.count(),
      },
    });
  }
});

// POST /api/v1/system/reseed - Trigger DB table initialization / seeding
systemRouter.post('/reseed', async (req: Request, res: Response) => {
  try {
    await initDatabase();
    res.json({ success: true, message: 'Database initialization and seed checked successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/system/springboot-docs - Spring Boot Java equivalent reference code
systemRouter.get('/springboot-docs', (req: Request, res: Response) => {
  res.json({
    framework: 'Spring Boot 3.3.x / Java 21 / Spring Data JPA',
    database: 'PostgreSQL 15+ (Supabase)',
    description: 'This e-commerce backend implements enterprise Spring Boot architectural patterns (Controllers, Services, Repositories, Entities, DTOs).',
    files: [
      {
        fileName: 'pom.xml',
        language: 'xml',
        description: 'Maven dependencies for Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, and Lombok',
        code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.2</version>
    <relativePath/>
  </parent>
  <groupId>com.ecommerce</groupId>
  <artifactId>ecommerce-api</artifactId>
  <version>1.0.0</version>
  <name>ecommerce-api</name>
  <description>Spring Boot REST API for E-Commerce connected to Supabase PostgreSQL</description>

  <properties>
    <java.version>21</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>
  </dependencies>
</project>`,
      },
      {
        fileName: 'src/main/resources/application.properties',
        language: 'properties',
        description: 'PostgreSQL Supabase datasource configuration & JPA dialect',
        code: `# Supabase PostgreSQL DataSource Configuration
spring.datasource.url=jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
spring.datasource.username=postgres.cuxhbnvfiuqxmwkgnkyi
spring.datasource.password=22011P05098074331028
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA / Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Server Port
server.port=8080`,
      },
      {
        fileName: 'Product.java',
        language: 'java',
        description: 'JPA Product Entity with relations and column mappings',
        code: `package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    private Double rating;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(nullable = false)
    private Integer stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    private String brand;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;

    @ElementCollection
    @CollectionTable(name = "product_features", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "feature")
    private List<String> features;

    private String badge;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}`,
      },
      {
        fileName: 'ProductController.java',
        language: 'java',
        description: 'Spring Boot REST Controller handling catalog query endpoints',
        code: `package com.ecommerce.controller;

import com.ecommerce.model.Product;
import com.ecommerce.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(productService.findProducts(category, search, minPrice, maxPrice, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.saveProduct(product));
    }
}`,
      },
      {
        fileName: 'OrderService.java',
        language: 'java',
        description: 'Transactional Order Service managing checkout and inventory decrements',
        code: `package com.ecommerce.service;

import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order placeOrder(Order order) {
        // Decrement inventory stocks safely
        for (OrderItem item : order.getItems()) {
            productRepository.decrementStock(item.getProductId(), item.getQuantity());
        }
        order.setOrderStatus("Processing");
        return orderRepository.save(order);
    }
}`,
      },
    ],
  });
});
