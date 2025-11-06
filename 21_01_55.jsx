# 21.01.55.3004_HAFIZ EGA RADITYA - Fullstack Marketplace App

This document contains a complete plan, database schema (>= 10 tables), backend setup instructions using **php-crud-api**, and a React frontend skeleton. Put everything into a GitHub repository named **21.01.55.3004_HAFIZ_EGA_RADITYA-marketplace** (or similar). Include a `/screenshots` folder with images of the running app.

---

## Repo structure (what to commit)

```
21.01.55.3004_HAFIZ_EGA_RADITYA-marketplace/
├─ backend/
│  ├─ README.md
│  ├─ db.sql
│  ├─ php-crud-api/  (clone mevdschee/php-crud-api here)
│  ├─ config.php    (database config for php-crud-api)
│  ├─ .htaccess
│  └─ screenshots/  (optional runtime screenshots from server)
├─ frontend/
│  ├─ README.md
│  ├─ package.json
│  ├─ public/
│  │  └─ index.html
│  └─ src/
│     ├─ index.jsx
│     ├─ App.jsx
│     ├─ api.js
│     ├─ components/
│     │  ├─ ProductList.jsx
│     │  ├─ ProductDetail.jsx
│     │  └─ OrderList.jsx
│     └─ styles.css
└─ screenshots/
   ├─ home.png
   ├─ product-list.png
   └─ admin-orders.png
```

---

## Concept: Online Multi-Vendor Marketplace (real, used by many)

Use-case: Small-to-medium sellers want a marketplace to list products, manage stock, receive orders, and track payments & shipping. Admins manage vendors, categories, and site settings.

Core domain objects -> >10 tables (below).

---

## Database schema (file: backend/db.sql)

```sql
-- Database: marketplace

DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS shipments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS coupons;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission VARCHAR(100) NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT DEFAULT 3, -- 1 Admin,2 Vendor,3 Customer
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(40),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  store_name VARCHAR(150) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  description TEXT,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  category_id INT,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  alt_text VARCHAR(150),
  pos INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  stock INT DEFAULT 0,
  reserved INT DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vendor_id INT DEFAULT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  method VARCHAR(50),
  amount DECIMAL(12,2) NOT NULL,
  paid_at DATETIME,
  transaction_id VARCHAR(200),
  status VARCHAR(50) DEFAULT 'unpaid',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  courier VARCHAR(100),
  tracking_number VARCHAR(150),
  shipped_at DATETIME,
  status VARCHAR(50) DEFAULT 'not_shipped',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount DECIMAL(5,2) NOT NULL,
  expires_at DATETIME,
  active TINYINT(1) DEFAULT 1
);

-- Seed: roles and a sample admin + vendor + customer + product
INSERT INTO roles (name, description) VALUES
('admin','Full administrator'),('vendor','Seller vendor'),('customer','Regular customer');

INSERT INTO users (role_id,name,email,password,phone) VALUES
(1,'Admin User','admin@example.com',SHA2('admin123',256),'08123456789'),
(2,'Vendor User','vendor@example.com',SHA2('vendor123',256),'08112223344'),
(3,'Customer User','customer@example.com',SHA2('cust123',256),'08199887766');

INSERT INTO vendors (user_id,store_name,description) VALUES
(2,'Toko Vendor','Toko contoh vendor');

INSERT INTO categories (name,slug,description) VALUES
('Elektronik','elektronik','Perangkat elektronik'),
('Handphone','handphone','Smartphone dan aksesoris');

INSERT INTO products (vendor_id,category_id,name,sku,description,price) VALUES
(1,1,'Contoh Powerbank','PB-0001','Powerbank 10000mAh',150000.00);

INSERT INTO product_images (product_id,url,alt_text,pos) VALUES
(1,'/assets/images/powerbank.jpg','Powerbank 10000mAh',0);

INSERT INTO inventory (product_id,stock,reserved) VALUES
(1,50,0);

```

---

## Backend: php-crud-api setup (backend/README.md)

1. Upload the `backend/` folder to your PHP-capable hosting (XAMPP, LAMP, or shared hosting such as InfinityFree). 
2. Put `php-crud-api` code in `backend/php-crud-api/` (clone https://github.com/mevdschee/php-crud-api). 
3. Create database using `db.sql` (via phpMyAdmin).
4. Create `backend/config.php` with DB credentials and initialization for php-crud-api.

**Example backend/config.php**

```php
<?php
// config.php - example to initialize php-crud-api
require 'php-crud-api/api.php';

// If api.php requires a PDO connection, you can create connection here and pass config.
// But easiest: edit vendor configuration per project. Example for basic usage:
$db = new \PDO('mysql:host=localhost;dbname=marketplace;charset=utf8','db_user','db_pass');
// Then configure the API
$api = new PHP_CRUD_API(array('db'=>$db, 'base'=>'/backend/php-crud-api/'));
$api->execute();
```

> Note: exact bootstrap depends on the php-crud-api version. See their README. Alternatively you can extract `api.php` and edit the connection section with your credentials.

**.htaccess** (optional, to route to api.php):

```
RewriteEngine On
RewriteRule ^api/?$ api.php [L,QSA]
```

**Useful endpoints once php-crud-api is running**

- GET /products
- GET /products/1
- POST /orders
- GET /orders?filter=user_id,eq,3
- etc. php-crud-api exposes standard REST endpoints for each table.

---

## Frontend (React) - quick skeleton

Put this in `/frontend`.

**package.json**

```json
{
  "name": "hafiz-marketplace-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "axios": "1.4.0"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build"
  }
}
```

**public/index.html**

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marketplace - HAFIZ EGA RADITYA</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>
```

**src/index.jsx**

```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)
```

**src/api.js**

```js
import axios from 'axios'
// Change baseURL to your backend (where php-crud-api is exposed)
export default axios.create({ baseURL: 'https://your-domain.com/backend/php-crud-api/' })
```

**src/App.jsx**

```jsx
import React from 'react'
import ProductList from './components/ProductList'

export default function App(){
  return (
    <div className="app">
      <header>
        <h1>Marketplace - HAFIZ EGA RADITYA</h1>
      </header>
      <main>
        <ProductList />
      </main>
    </div>
  )
}
```

**src/components/ProductList.jsx**

```jsx
import React, {useEffect, useState} from 'react'
import api from '../api'

export default function ProductList(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    api.get('products').then(r=>{
      setProducts(r.data.records || r.data)
    }).catch(e=>{
      console.error(e)
      setProducts([])
    }).finally(()=>setLoading(false))
  },[])

  if(loading) return <p>Loading...</p>
  if(!products.length) return <p>No products found.</p>

  return (
    <div className="product-grid">
      {products.map(p => (
        <div key={p.id} className="card">
          <img src={p.image || '/assets/images/powerbank.jpg'} alt={p.name} />
          <h3>{p.name}</h3>
          <p>Rp {Number(p.price).toLocaleString('id-ID')}</p>
        </div>
      ))}
    </div>
  )
}
```

**src/styles.css** (minimal)

```css
body{ font-family: system-ui, sans-serif; padding: 12px; }
.header{ margin-bottom: 16px }
.product-grid{ display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:12px }
.card{ border:1px solid #ddd; padding:8px; border-radius:8px }
.card img{ width:100%; height:180px; object-fit:cover }
```

---

## How to run locally (step-by-step)

### Backend (local XAMPP)
1. Install XAMPP (or use your hosting). Start Apache + MySQL.
2. Create database `marketplace` in phpMyAdmin.
3. Import `backend/db.sql`.
4. Copy `php-crud-api` into `backend/php-crud-api`, edit `api.php` or create `config.php` to connect to DB (see example). Ensure the base URL matches.
5. Visit `http://localhost/backend/php-crud-api/` and test `http://localhost/backend/php-crud-api/products`.

### Frontend
1. In `/frontend` run `npm install` (or `pnpm`/`yarn`).
2. Edit `src/api.js` `baseURL` to where your backend API is available.
3. Run `npm run start` and open `http://localhost:5173` (vite default) to view.

---

## Screenshots (how to capture & include)

- Take screenshots of these pages and save them into `/screenshots` and commit to repo:
  - Front page (product list) — `screenshots/home.png`
  - Product detail or product list with image — `screenshots/product-list.png`
  - Admin order list or orders page — `screenshots/admin-orders.png`

On Windows: use Snipping Tool or Win+Shift+S. On macOS: Cmd+Shift+4.

---

## How to publish to GitHub and make public

1. Create a new repository on GitHub with name: `21.01.55.3004_HAFIZ_EGA_RADITYA-marketplace`.
2. Locally initialize git:

```bash
cd 21.01.55.3004_HAFIZ_EGA_RADITYA-marketplace
git init
git add .
git commit -m "Initial commit - backend + frontend + db schema"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/21.01.55.3004_HAFIZ_EGA_RADITYA-marketplace.git
git push -u origin main
```

3. On GitHub, go to repository Settings -> Pages (if you want static frontend) or host backend on PHP hosting.
4. Set repository to Public so I (and others) can view it.

---

## Recommended README contents (short) — include in repo root README.md

```
# 21.01.55.3004_HAFIZ EGA RADITYA - Marketplace

This repo contains a sample multi-vendor marketplace:
- backend: php-crud-api + DB schema (MySQL)
- frontend: React app (Vite)

Follow backend/README.md and frontend/README.md to run locally.
```

---

## Notes & final steps for you (what I can't do from here)

- I cannot create the GitHub repo or push on your behalf. Please follow the `How to publish to GitHub` section above. Use the exact repository name and include the tag `[21.01.55.3004_HAFIZ EGA RADITYA]` in the repository title or description so it is easy to identify.
- After you push and make the repo public, paste the **GitHub link** back here and I will open it and review, and provide any corrections or improvements.

---

If you want, I can now:
- generate a zip file of the project structure in this canvas (ask and I will create file content you can copy), OR
- create more complete frontend pages (cart, checkout, admin) and ready-to-run docker-compose for the backend.


