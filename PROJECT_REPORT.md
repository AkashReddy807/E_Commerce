# Lumen Store - Full-Stack E-Commerce Project Report

## 1. Executive Overview
**Lumen Store** is a production-ready, full-stack e-commerce web platform designed with high-contrast Clean Minimalism. It pairs a **React 19 + TypeScript + Vite** client-side application with a **Spring Boot 3.3.x / Express RESTful backend architecture**, backed by **PostgreSQL** data persistence and a resilient high-speed memory fallback sync engine.

---

## 2. Technical Architecture & Stack

### **Frontend Tier**
- **Framework & Runtime**: React 19, TypeScript 5, Vite
- **Styling**: Tailwind CSS with a Clean Minimalist monochrome design system (`#111111`, `#ffffff`, `#fafafa`, `#f0f0f0`)
- **Iconography**: `lucide-react` (uniform `stroke-[1.5]` / `stroke-[1.75]`)
- **Media Assets**: High-resolution curated photography via Unsplash with strict `referrerPolicy="no-referrer"`
- **Client State**: Reactive React state management with local persistence for Cart and Wishlist items

### **Backend & API Layer**
- **Architecture Pattern**: Layered Controller-Service-Repository architecture modeled after enterprise Spring Boot 3.3.x standards
- **API Standard**: RESTful endpoints with consistent JSON envelope responses (`/api/v1/*`)
- **Resilience Engine**: Dual-mode data access layer with sub-millisecond in-memory cache and live PostgreSQL database connectivity

### **Database & Schema Design**
- **Engine**: PostgreSQL 15+ (Supabase cloud pooler connection)
- **Relational Tables**:
  - `products`: Catalog items, inventory stock, multi-image arrays, feature lists, pricing, and category foreign keys
  - `categories`: Taxonomies, slug routing, and metadata
  - `orders`: Order headers, shipment status, delivery addresses, calculation breakdowns
  - `order_items`: Line items referencing products, historical pricing snapshots, quantities
  - `reviews`: Product reviews, 5-star ratings, user feedback
  - `coupons`: Active promotion codes with percentage/fixed discounts and threshold rules

---

## 3. Core Functional Modules

### **1. Product Catalog & Discovery**
- **Real-Time Search & Filtering**: Instant search across titles, descriptions, and brands. Category selection and multi-criteria sorting (Price Low to High, Price High to Low, Rating, Featured).
- **Product Card & Quick View Modal**: Minimalist product cards with hover actions, rating badge overlays, stock indicators, and a detail modal featuring multi-image switching, feature lists, and customer reviews.

### **2. Cart, Promo & Wishlist Management**
- **Slide-Over Cart Drawer**: Dynamic item quantity controls, promo code engine (e.g., `LUMEN15`, `WELCOME10`, `FREESHIP`), free shipping calculation threshold bar, and subtotal/tax calculation.
- **Saved Wishlist**: Persistent wishlist drawer enabling one-click transfer of saved items to the active shopping bag.

### **3. Multi-Step Checkout Workflow**
- **Step 1 — Shipping**: Recipient contact, street address, city, postal code, and shipping tier selection.
- **Step 2 — Payment**: Credit/Debit Card, Apple Pay, Google Pay, or Cash on Delivery simulation with auto-formatters.
- **Step 3 — Review & Confirmation**: Order summary review, live transaction submission, and receipt generation with unique tracking ID (e.g., `ORD-XXXXXX`).

### **4. Real-Time Order & Logistics Tracker**
- **Live Tracking System**: Query orders by tracking ID with milestone timeline indicators (*Order Confirmed*, *Processing*, *Shipped*, *Out for Delivery*, *Delivered*).
- **Recent Orders Log**: Quick switcher displaying recent orders stored in the database.

### **5. Admin Inventory & Database Management**
- **Stock & Catalog Management**: Live inventory table with search, category filtering, low-stock indicators, inline stock adjustment, and product deletion.
- **Add Product Modal**: Form to publish new products with image URLs, tags, and category associations.
- **PostgreSQL Database Dashboard**: Live connection health monitor, table row counters, and database sync tooling.

### **6. Spring Boot Architecture Explorer & REST Sandbox**
- **Layer Separation Explorer**: Visual interactive diagram of Client → RestController → Service Layer → Repository → PostgreSQL.
- **Source Code Viewer**: Tabbed inspection of Java Spring Boot source files (`ProductController.java`, `ProductService.java`, `ProductRepository.java`, `Product.java`, `Order.java`, `schema.sql`).
- **Live REST Sandbox**: Query runner to execute live HTTP queries directly against backend endpoints with formatted JSON response payloads.

---

## 4. REST API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/products` | Retrieve catalog with optional search, category, and sort filters |
| `GET` | `/api/v1/products/:id` | Fetch detailed product data including reviews |
| `POST` | `/api/v1/products` | Create or update a product item (Admin) |
| `DELETE` | `/api/v1/products/:id` | Remove a product from the catalog (Admin) |
| `PATCH` | `/api/v1/products/:id/stock` | Adjust inventory stock levels |
| `GET` | `/api/v1/categories` | List all available product categories |
| `POST` | `/api/v1/orders` | Place and persist a new customer order |
| `GET` | `/api/v1/orders` | Fetch recent orders |
| `GET` | `/api/v1/orders/:id` | Query order tracking status by reference ID |
| `POST` | `/api/v1/coupons/validate` | Validate promo discount codes |
| `GET` | `/api/v1/system/status` | Database connection diagnostic & table counts |
| `GET` | `/api/v1/system/docs` | Architecture blueprints and Spring Boot source files |

---

## 5. Build & Deployment
- **Compile Verification**: Pass (`npm run build`)
- **Lint Verification**: Pass (`npm run lint` / `tsc --noEmit`)
- **Container Server**: Node.js Express server binding on `0.0.0.0:3000` with Vite middleware
