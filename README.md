# Xeno App – Customer & Order Management

A full-stack Shopify embedded app built with Node.js, Express, MySQL (as per your DB choice), React frontend, and Shopify Admin APIs.
This app handles OAuth authentication, listens to Shopify webhooks, stores customers/orders into the database, and provides a dashboard UI for analysing the data.

🚀 Setup Instructions

# Prerequisites

1. Node.js >= 18
2. npm or yarn
3. MySQL
4. A Shopify Partner Account
5. A Shopify development store

# Environment Variables
Create a .env file in the frontend directory:
1. VITE_BACKEND_URL=Your_Backend_URL

Create a .env file in the Backend directory:
1. PORT=Desired_Port
2. DB_HOST=Your_DB_Link
3. DB_PORT=DB_Port
4. DB_USER=DB_UserName
5. DB_PASSWORD=DB_Password
6. DB_NAME=DB_name
7. HOST=Your_Backend_URL
8. JWT_SECRET=JWT_Secret_key
9. JWT_EXPIRES_IN=JWT_Expire_time
10. JWT_COOKIE_EXPIRES_IN=JWT_Cookie_expiry_time
11. FRONTEND=Your_frontend_URL
12. EMAIL_USER=Your_Gmail
13. EMAIL_PASS=APPLICATION_PASSWORD_OF_GMAIL

# Installation
Install dependencies  
npm install  

Run locally frontend
npm run dev  

Run locally backend
nodemon server.js / node server.js  

Deploy to Vercel (with vercel.json configured)  
vercel --prod  


# 🏗️ Architecture

                      ┌──────────────────────────┐
                      │      Shopify Store       │
                      │ (Webhooks + API Access)  │
                      └───────────────┬──────────┘
                                      │
                     OAuth + Webhooks + API Sync
                                      │
            ┌─────────────────────────▼─────────────────────────┐
            │                   Backend (Node.js)               │
            │  - Handles OAuth flow                             │
            │  - Webhooks (/customers/create, /orders, etc.)    │
            │  - On-demand sync (customers, products, orders)   │
            │    during summary extraction for accuracy         │
            │  - Provides REST API routes for frontend          │
            └───────────────┬───────────────────────────────────┘
                            │
                  Database (MongoDB/MySQL)
        Stores customers, products, and orders for reporting
                            │
            ┌───────────────▼────────────────────┐
            │          Frontend (React.js)       │
            │  - Dashboard (charts, KPIs)        │
            │  - Customer, Product & Order views │
            │  - Summary extraction reports      │
            └────────────────────────────────────┘

# 📡 API Endpoints
Webhooks
1. POST /webhooks/orders/create => Triggered when a new order is created in shopify
2. POST /webhooks/products/create => Triggered when a new product is created in shopify
3. POST /webhooks/products/update => Triggered when a product is updated in shopify
4. POST /webhooks/products/delete => Triggered when a product is deleted in shopify
5. POST /webhooks/customers/create => Triggered when a new customers is created in shopify
6. POST /webhooks/customers/update => Triggered when a customer is updated in shopify
7. POST /webhooks/customers/delete => Triggered when a customer is deleted in shopify

Auth
1. POST /api/auth/login => Triggered when trying to login to an existing account
2. POST /api/auth/signup => Triggered when trying to create a new  account
3. POST /api/auth/getSummary => Triggered when trying to get data of account's stores from shopify

Data Retreval
1. api/customer/getCustomers => Triggered when trying to get all the customers of the current user
2. api/customer/getTop5CustomersByMoneySpent => Triggered when trying to get top 5 customers via money spent
3. api/orders/getOrders => Triggered when trying to get all orders of the current user
4. api/products/getProducts => Triggered when trying to get all the products of current user
5. /sendMail    => Triggered when trying to send OTP at the time of signup to users gmail.
6. api/orders/getByDate => Triggered when trying to get orders between 2 dates


# 🗄️ Database Schema
1. Tenants Table
| Field         | Type         | Notes                                   |
| ------------- | ------------ | --------------------------------------- |
| id            | INT (PK)     | Auto-increment tenant ID                |
| shop\_domain  | VARCHAR(255) | Shopify shop domain (unique)            |
| access\_token | TEXT         | OAuth token for API requests (nullable) |
| oauth\_state  | VARCHAR(255) | Used for CSRF protection during OAuth   |
| created\_at   | TIMESTAMP    | Auto timestamp                          |

2. Users Table
| Field       | Type         | Notes                                        |
| ----------- | ------------ | -------------------------------------------- |
| id          | INT (PK)     | Auto-increment user ID                       |
| tenant\_id  | INT (FK)     | References tenants(id)                       |
| email       | VARCHAR(255) | Unique user email                            |
| password    | VARCHAR(255) | Password (hashed in production)              |
| created\_at | DATETIME     | Defaults to NOW()                            |
| updated\_at | DATETIME     | Updates automatically on record modification |

3. Customers Table
| Field           | Type          | Notes                          |
| --------------- | ------------- | ------------------------------ |
| id              | BIGINT (PK)   | Shopify customer ID            |
| tenant\_id      | INT (FK)      | References tenants(id)         |
| email           | VARCHAR(255)  | Customer email                 |
| first\_name     | VARCHAR(255)  |                                |
| last\_name      | VARCHAR(255)  |                                |
| total\_spent    | DECIMAL(10,2) | Total spent by the customer    |
| orders\_count   | INT           | Number of orders placed        |
| last\_order\_id | BIGINT        | Reference to last order ID     |
| phone           | VARCHAR(50)   | Customer phone                 |
| currency        | VARCHAR(10)   | Currency code (e.g., USD, INR) |
| created\_at     | DATETIME      | Shopify timestamp              |
| updated\_at     | DATETIME      | Shopify timestamp              |

4.Products Table
| Field               | Type          | Notes                      |
| ------------------- | ------------- | -------------------------- |
| id                  | BIGINT (PK)   | Shopify product ID         |
| tenant\_id          | INT (FK)      | References tenants(id)     |
| title               | VARCHAR(255)  | Product title              |
| description         | TEXT          | Product description        |
| price               | DECIMAL(10,2) | Product price              |
| compare\_at\_price  | DECIMAL(10,2) | Discounted/original price  |
| taxable             | BOOLEAN       | Whether product is taxable |
| inventory\_item\_id | BIGINT        | Shopify inventory item ID  |
| inventory\_quantity | INT           | Available stock            |
| created\_at         | DATETIME      | Shopify timestamp          |
| updated\_at         | DATETIME      | Shopify timestamp          |

6. Pictures Table
| Field       | Type         | Notes                                  |
| ----------- | ------------ | -------------------------------------- |
| id          | BIGINT (PK)  | Shopify image ID                       |
| product\_id | BIGINT (FK)  | References products(id)                |
| src         | VARCHAR(500) | Image URL                              |
| alt         | VARCHAR(255) | Alt text                               |
| position    | INT          | Image order in Shopify product gallery |
| width       | INT          | Image width                            |
| height      | INT          | Image height                           |
| created\_at | DATETIME     | Shopify timestamp                      |
| updated\_at | DATETIME     | Shopify timestamp                      |

7. Orders Table
| Field           | Type          | Notes                                |
| --------------- | ------------- | ------------------------------------ |
| id              | BIGINT (PK)   | Shopify order ID                     |
| tenant\_id      | INT (FK)      | References tenants(id)               |
| customer\_id    | BIGINT (FK)   | References customers(id)             |
| customer\_email | VARCHAR(255)  | Order’s customer email               |
| name            | VARCHAR(255)  | Shopify order name (e.g., `#1001`)   |
| order\_number   | INT           | Sequential order number from Shopify |
| total\_price    | DECIMAL(10,2) | Total amount paid                    |
| subtotal\_price | DECIMAL(10,2) | Subtotal before tax                  |
| total\_tax      | DECIMAL(10,2) | Tax amount                           |
| currency        | VARCHAR(10)   | Currency code (e.g., USD, INR)       |
| status          | VARCHAR(50)   | Fulfillment/payment status           |
| created\_at     | DATETIME      | Shopify timestamp                    |
| updated\_at     | DATETIME      | Shopify timestamp                    |

# Known Limitations / Assumptions
1. The database schema is simplified (only core fields stored).
2. Only customers and orders are being tracked; products and inventory not yet integrated.
