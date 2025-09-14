# Xeno App – Customer & Order Analytics Documentation 

A full-stack Shopify embedded app built with Node.js, Express, MySQL (as per your DB choice), React frontend, and Shopify Admin APIs.
This app handles OAuth authentication, listens to Shopify webhooks, stores customers/orders into the database, and provides a dashboard UI for analysing the data.


# Assumptions

1.Data Integrity
Each Shopify store has unique customers identified by customer_id.
Orders have valid customer_id references in the customers table.
Product and order prices are stored in the store’s default currency.
Customers may place multiple orders, but each order has a unique order_number.

2.Application Behavior
Only core Shopify entities (customers, orders, products) are tracked; optional fields like discounts, shipping, or refunds are not included.
OAuth tokens are assumed to have sufficient permissions to access customers, orders, and products.
The app assumes a single tenant per Shopify store. Multi-store management requires multiple tenant records.

3.System Assumptions
Email authentication is required for app access.
Data ingestion via Shopify webhooks is eventually consistent; real-time sync may have minor delays.
Timezone differences between Shopify stores and server are normalized using UTC.


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
            
# Explanation of Flows:
Webhooks: Shopify pushes updates for customers, orders, and products in real-time.
Frontend: React dashboard visualizes metrics such as orders by date, top customers, and revenue trends.


# 📡 APIs and Data Models

1. Webhooks                             
POST /webhooks/orders/create     -> Triggered when a new order is created     
POST /webhooks/products/create   -> Triggered when a new product is created    
POST /webhooks/products/update   -> Triggered when a product is updated        
POST /webhooks/products/delete   -> Triggered when a product is deleted        
POST /webhooks/customers/create  -> Triggered when a new customer is created   
POST /webhooks/customers/update  -> Triggered when a customer is updated      
POST /webhooks/customers/delete  -> Triggered when a customer is deleted      
 

2. Authentication   
POST /api/auth/login       -> Returns JWT token for session
POST /api/auth/signup      -> Creates new user account      
POST /api/auth/getSummary  ->  Returns summary metrics       


4. Data Retreval  
GET /api/customer/getCustomers ->  List of customers Filter by tenant             |  
GET /api/customer/getTop5CustomersByMoneySpent  ->  Top 5 customers Sorted by total spend 
GET /api/orders/getOrders  ->  List of all orders For dashboard visualizations 
POST /api/orders/getByDate  ->  List of orders Filter orders by date
GET  /api/products/getProducts  ->  List of all products For inventory and analysis
POST /sendMail  ->  Sends OTP for signup
  
  
  
# 🗄️ Database Schema   

1. Tenants Table   
id  ->  INT (PK)
shop\_domain  -> VARCHAR(255) 
access\_token  ->  TEXT         
oauth\_state  ->  VARCHAR(255) 
created\_at  ->  TIMESTAMP    
  
2. Users Table   
id  ->  INT (PK)  
tenant\_id  ->  INT (FK)  
email  ->  VARCHAR(255)   
password  ->  VARCHAR(255) 
created\_at  ->  DATETIME
updated\_at  ->  DATETIME  
  
3. Customers Table   
id  ->  BIGINT (PK)  
tenant\_id  ->  INT (FK)
email  ->  VARCHAR(255)
first\_name  ->  VARCHAR(255)
last\_name  ->  VARCHAR(255)
total\_spent  ->  DECIMAL(10,2) 
orders\_count  ->  INT
last\_order\_id  ->  BIGINT  
phone  ->  VARCHAR(50) 
currency  ->  VARCHAR(10)   
created\_at  ->  DATETIME  
updated\_at  ->  DATETIME   
  
4. Products Table
id  ->  BIGINT (PK)
tenant\_id  ->  INT (FK)    
title  ->  VARCHAR(255)  
description  ->  TEXT         
price  ->  DECIMAL(10,2)  
compare\_at\_price  ->  DECIMAL(10,2) 
taxable  ->  BOOLEAN
inventory\_item\_id  ->  BIGINT     
inventory\_quantity  ->  INT         
created\_at  ->  DATETIME      
updated\_at  ->  DATETIME     
  
6. Pictures Table   
id  ->  BIGINT (PK  
product\_id  ->  BIGINT (FK)  
src  ->  VARCHAR(500)  
alt  ->  VARCHAR(255)  
position  ->  INT    
width  ->  INT            
height  ->  INT            
created\_at  ->  DATETIME       
updated\_at  ->  DATETIME       
  
7. Orders Table     
id  ->  BIGINT (PK)  
tenant\_id  ->  INT (FK)  
customer\_id  ->  BIGINT (FK)  
customer\_email  ->  VARCHAR(255)  
name  ->  VARCHAR(255)    
order\_number  ->  INT    
total\_price  ->  DECIMAL(10,2
subtotal\_price  ->  DECIMAL(10,2)  
total\_tax  ->  DECIMAL(10,2)  
currency  ->  VARCHAR(10)  
status  ->  VARCHAR(50)    
created\_at  ->  DATETIME  
updated\_at  ->  DATETIME  
  
# Known Limitations / Assumptions  
1. The database schema is simplified (only core fields stored).  
2. Only customers and orders are being tracked; products and inventory not yet integrated.  

# Next Steps to Productionize  
1. Authentication & Security  
2. Add rate-limiting for API endpoints.  
3. Data Sync & Reliability    
4. Use background jobs (e.g., BullMQ) to process large webhook events asynchronously.  
5. Implement retry logic for failed webhooks.
6. Paginate orders and products API responses for performance.
