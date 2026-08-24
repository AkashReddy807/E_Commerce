import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Supabase PostgreSQL connection string
const SUPABASE_DB_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.cuxhbnvfiuqxmwkgnkyi:22011P05098074331028@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

export const pool = new Pool({
  connectionString: SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  max: 10,
});

export let isConnectedToPostgres = false;
export let lastDbError: string | null = null;

// Initialize tables and seed initial catalog data
export async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log(' Successfully connected to Supabase PostgreSQL database!');
    isConnectedToPostgres = true;
    lastDbError = null;

    // Create Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        description TEXT,
        image_url TEXT
      );
    `);

    // Create Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        original_price NUMERIC(10, 2),
        rating NUMERIC(3, 2) DEFAULT 4.5,
        reviews_count INT DEFAULT 0,
        stock INT DEFAULT 10,
        category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
        brand VARCHAR(100),
        images TEXT[],
        features TEXT[],
        badge VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(50),
        shipping_address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        postal_code VARCHAR(30) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        discount_amount NUMERIC(10, 2) DEFAULT 0,
        shipping_fee NUMERIC(10, 2) DEFAULT 0,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Paid',
        order_status VARCHAR(50) DEFAULT 'Processing',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Order Items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        quantity INT NOT NULL,
        image_url TEXT
      );
    `);

    // Create Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
        user_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(50) PRIMARY KEY,
        discount_percent INT NOT NULL,
        max_discount NUMERIC(10, 2),
        min_order NUMERIC(10, 2) DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    // Check if initial categories exist
    const catCountRes = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial categories...');
      await client.query(`
        INSERT INTO categories (id, name, slug, icon, description, image_url) VALUES
        ('electronics', 'Electronics & Audio', 'electronics', 'Headphones', 'Premium sound systems, noise-canceling headphones & hi-fi gear', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'),
        ('laptops', 'Laptops & Computing', 'laptops', 'Laptop', 'Ultra-fast ultrabooks, creator laptops and desktop workstations', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'),
        ('smart-home', 'Smart Home & IoT', 'smart-home', 'Home', 'Intelligent lighting, smart displays and automated home essentials', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80'),
        ('wearables', 'Smartwatches & Fitness', 'wearables', 'Watch', 'Precision health trackers, titanium smartwatches and fitness bands', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'),
        ('cameras', 'Cameras & Optics', 'cameras', 'Camera', 'Mirrorless 4K cinematic cameras, prime lenses and studio accessories', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'),
        ('accessories', 'Minimal Accessories', 'accessories', 'Smartphone', 'MagSafe docks, wireless chargers, leather sleeves & travel gear', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&auto=format&fit=crop&q=80')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Check if initial products exist
    const prodCountRes = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(prodCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial products...');
      await client.query(`
        INSERT INTO products (id, title, slug, description, price, original_price, rating, reviews_count, stock, category_id, brand, images, features, badge) VALUES
        ('prod-1', 'Aura Sound Pro Wireless Noise-Cancelling Headphones', 'aura-sound-pro-headphones', 'Engineered with custom 40mm beryllium drivers, active hybrid noise cancellation, 45-hour battery life, and ultra-plush memory foam earcups.', 349.99, 399.99, 4.9, 128, 24, 'electronics', 'Acoustica', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'], ARRAY['Hybrid Active Noise Cancellation (42dB)', '45-Hour Playback with Fast Charge (10m = 5h)', 'Lossless Spatial Audio with Head Tracking', 'Multipoint Bluetooth 5.4 Connectivity'], 'Best Seller'),
        ('prod-2', 'Nova UltraBook Pro 16 - M3 Max Grade Titanium', 'nova-ultrabook-pro-16', 'Liquid Retina XDR display with 120Hz ProMotion, 32GB Unified Memory, 1TB NVMe Gen4 SSD, and whisper-quiet dual fan cooling.', 1899.00, 2099.00, 4.8, 85, 12, 'laptops', 'NovaTech', ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'], ARRAY['16.2-inch 3.4K OLED Display (1600 nits)', '32-Core Neural Engine for AI Acceleration', '22-Hour Battery Endurance', 'Full Array of Thunderbolt 4 Ports'], 'Top Rated'),
        ('prod-3', 'Aero Chrono Titanium Smartwatch Edition', 'aero-chrono-titanium-smartwatch', 'Aerospace-grade titanium casing, sapphire crystal lens, dual-frequency GPS, ECG monitor, and continuous skin temperature sensor.', 429.00, 499.00, 4.7, 94, 30, 'wearables', 'AeroTime', ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'], ARRAY['100m Water Resistance & Titanium Bezel', 'Dual-Frequency Multi-GNSS Realtime Tracking', '14-Day Battery in Smart Mode', 'Comprehensive Health & Sleep Metrics'], 'New Arrival'),
        ('prod-4', 'Lumina Smart Ambient Studio Bar & Light Hub', 'lumina-smart-ambient-bar', 'Full-spectrum RGBIC lighting with dynamic audio sync, Matter & Thread certified, adaptive color temperature, and magnetic desk mounting.', 119.50, 149.00, 4.6, 62, 45, 'smart-home', 'Lumina', ARRAY['https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80'], ARRAY['Matter & HomeKit / Alexa Certified', 'Zero-Latency Screen Mirroring Sync', '16 Million Colors & Tunable White (2000K-6500K)', 'Touch Sensitive Slider Base'], 'Popular'),
        ('prod-5', 'Vortex Mirrorless Cine 4K Studio Camera', 'vortex-mirrorless-cine-camera', 'Full-frame 33MP BSI CMOS sensor, internal 4K 120p 10-bit 4:2:2 recording, 5-axis sensor-shift image stabilization, and dual CFexpress slots.', 1649.00, 1799.00, 4.9, 41, 8, 'cameras', 'Vortex Optics', ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'], ARRAY['33MP Back-Illuminated Full-Frame Sensor', '759 Phase-Detection AF Points with AI Subject Detect', 'Active Sensor Cooling Fan', 'Real-time Eye AF for Humans, Animals & Birds'], 'Featured'),
        ('prod-6', 'Minimalist Aluminum MagSafe 3-in-1 Charging Stand', 'minimalist-aluminum-magsafe-stand', 'CNC machined anodized aluminum charging dock. Fast charges iPhone (15W), Apple Watch, and AirPods simultaneously with a single cable.', 89.00, 110.00, 4.7, 115, 60, 'accessories', 'OrbitDesign', ARRAY['https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&auto=format&fit=crop&q=80'], ARRAY['Solid Weighted Anodized Aluminum Base', 'Official Qi2 15W Certified Fast Magnetic Charging', 'Clean Cable Management System', 'Adjustable 45-Degree Viewing Angle'], 'Staff Pick'),
        ('prod-7', 'SonicBloom Hi-Fi Studio Desktop Speakers (Pair)', 'sonicbloom-desktop-speakers', 'Custom woven Kevlar woofers, silk dome tweeters, built-in 24-bit/192kHz DAC, optical input, and optical isolation isolation pads.', 279.00, 320.00, 4.8, 53, 19, 'electronics', 'Acoustica', ARRAY['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'], ARRAY['120W Peak Total Output Power', 'Built-in Audiophile Burr-Brown DAC', 'Bluetooth 5.3 with LDAC / aptX HD', 'Acoustic Tuning EQ Controls on Rear'], 'Hot Deal'),
        ('prod-8', 'Apex Pro Mechanical Wireless Keyboard - Hot Swap', 'apex-pro-mechanical-keyboard', 'CNC frosted acrylic chassis, lubed linear switches, gasket mounted plate, south-facing RGB, and 4000mAh battery for 200 hours wireless.', 149.00, 179.00, 4.9, 210, 38, 'accessories', 'NovaTech', ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'], ARRAY['75% Compact Layout with CNC Rotary Knob', 'Hot-Swappable 5-Pin Switch Sockets', 'Sound-Dampening Silicone & Poron Foam Layers', 'Tri-Mode Connection (2.4GHz, BT 5.1, Type-C)'], 'Top Seller')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Seed coupons
    const couponCountRes = await client.query('SELECT COUNT(*) FROM coupons');
    if (parseInt(couponCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO coupons (code, discount_percent, max_discount, min_order, is_active) VALUES
        ('WELCOME10', 10, 50.00, 50.00, TRUE),
        ('SAVE20', 20, 150.00, 100.00, TRUE),
        ('SUPABASE50', 50, 300.00, 200.00, TRUE)
        ON CONFLICT (code) DO NOTHING;
      `);
    }

    // Seed some initial reviews
    const reviewsCountRes = await client.query('SELECT COUNT(*) FROM reviews');
    if (parseInt(reviewsCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, rating, comment) VALUES
        ('prod-1', 'Sarah Jenkins', 5, 'The sound isolation on these Aura Pro headphones is phenomenal. Deep, tight bass without any muddy distortion.'),
        ('prod-1', 'Alex Rivera', 5, 'Best purchase I have made this year! Battery easily lasts my entire work week without needing a recharge.'),
        ('prod-2', 'David Kim', 5, 'Blazingly fast compiling speeds and the OLED display is breathtaking. Handles 4K video rendering effortlessly.'),
        ('prod-3', 'Marcus Aurel', 4, 'Great build quality and very accurate heart rate tracker during morning marathons.')
      `);
    }

    client.release();
    console.log(' Database initialized and seeded successfully.');
  } catch (err: any) {
    console.error('Database connection / initialization error:', err.message);
    lastDbError = err.message;
    isConnectedToPostgres = false;
  }
}
