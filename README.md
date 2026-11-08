<p align="center">
  <img src="assets/elrics-logo.png" alt="Elrics Logo" width="130" />
</p>

<h1 align="center">Elrics E-Commerce Billing &amp; Coupon Engine</h1>

<p align="center">
  <strong>Technical Assessment — Full-Stack E-Commerce Shopping Workflow</strong><br/>
  Browse products → Cart → Coupons → Discounts → GST → Shipping → Order
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-in%20progress-yellow" alt="Status" />
  <img src="https://img.shields.io/badge/stack-React%20%7C%20Node%20%7C%20Express%20%7C%20MongoDB-blue" alt="Stack" />
  <img src="https://img.shields.io/badge/license-private-lightgrey" alt="License" />
</p>

---

## 📖 Overview

This repository contains the solution for the **Elrics E-Commerce Billing &amp; Coupon Engine** technical assessment.

The application simulates a real-world e-commerce shopping workflow where users can browse products, manage a shopping cart, apply coupon codes, and place an order — with a fully rule-based billing engine that computes **discounts, GST, and shipping charges** in a strictly defined order.

The goal is to demonstrate clean architecture, modular code, robust business logic, graceful error handling, and a professional user interface.

---

## ✨ Features

- **Product Listing** — responsive product grid with image, name, category, price, stock and description
- **Shopping Cart** — add / update quantity / remove / clear, with live subtotal and item count
- **Coupon Engine** — validate and apply coupon codes (one active coupon at a time)
- **Billing Engine** — dynamic computation of discount → GST → shipping → final payable amount
- **Shipping Rules** — standard charge with free shipping above a configurable threshold
- **Order Placement** — cart validation, coupon re-validation, Order ID generation, confirmation screen
- **Validation** — explicit handling of all required edge cases (empty cart, invalid/expired coupons, stock limits, negative quantity, etc.)

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React (Vite)                      |
| Backend   | Node.js + Express                 |
| Database  | MongoDB + Mongoose                |
| Styling   | Modern responsive CSS             |
| Testing   | Jest (billing/coupon engine)      |

> Any stack is permitted by the assessment — this is the chosen one.

---

## 📁 Project Structure

```text
Elrics-Billing-Engine/
│
├── frontend/            # React application
│   └── package.json
│
├── backend/             # Express REST API + billing engine
│   ├── package.json
│   └── .env.example
│
├── assets/              # Brand assets (logo)
│
├── README.md            # This file — setup, rules, assumptions
└── .gitignore
```

The internal structure of `frontend/` and `backend/` will follow modular, feature-based organization as the implementation progresses.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** (or yarn / pnpm)
- **MongoDB** — local instance or a free MongoDB Atlas cluster

### 1. Clone the repository

```bash
git clone https://github.com/Elrics-dev/Elrics-Billing-Engine.git
cd Elrics-Billing-Engine
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then edit values if needed
npm run dev               # starts API on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev               # starts UI on http://localhost:5173
```

### Environment variables (`backend/.env`)

| Variable       | Description                    | Example                                        |
|----------------|--------------------------------|------------------------------------------------|
| `PORT`         | API port                       | `5000`                                         |
| `MONGO_URI`    | MongoDB connection string      | `mongodb://localhost:27017/elrics-billing`     |
| `GST_RATE`     | GST percentage                 | `18`                                           |
| `SHIPPING_FEE` | Standard shipping charge (₹)   | `49`                                           |
| `FREE_SHIP_ABOVE` | Free shipping threshold (₹) | `999`                                          |

---

## 🎟️ Coupon Rules

| Code          | Type             | Condition             | Benefit                          |
|---------------|------------------|-----------------------|----------------------------------|
| `WELCOME10`   | Percentage       | Min. purchase ₹1,000  | 10% off, capped at ₹500         |
| `FLAT500`     | Flat amount      | Min. purchase ₹5,000  | ₹500 off                         |
| `FESTIVAL20`  | Percentage       | Min. purchase ₹10,000 | 20% off, capped at ₹2,000        |
| `FREESHIP`    | Shipping         | —                     | Shipping charges become free     |
| `BUY2GET1`    | Buy 2 Get 1      | 3 eligible accessories| Cheapest eligible accessory free |

- Only **one coupon** can be active at a time.
- Invalid / expired / below-minimum coupons must show a clear validation message.
- Removing products after a coupon is applied **re-validates** the coupon.

---

## 🧮 Billing Calculation Order

The billing engine computes values in this **exact order**:

```text
Subtotal
   ↓
Coupon Discount
   ↓
GST / Tax
   ↓
Shipping Charges
   ↓
Final Payable Amount
```

The summary recomputes automatically whenever the cart, quantity, or coupon changes.

---

## ✅ Validation Requirements

The application must handle:

- [ ] Empty shopping cart
- [ ] Invalid coupon code
- [ ] Expired coupon
- [ ] Applying multiple coupons (only one allowed)
- [ ] Quantity exceeding available stock
- [ ] Negative quantity
- [ ] Duplicate products in the cart
- [ ] Removing products after coupon application
- [ ] Placing an order with an empty cart

---

## 🗄️ Database Schema (planned entities)

| Entity    | Key fields                                                          |
|-----------|---------------------------------------------------------------------|
| `Product` | name, category, price, stock, image, description, isAccessory       |
| `Cart`    | items[] (product, quantity), updatedAt                              |
| `Coupon`  | code, type, value, minPurchase, maxDiscount, expiresAt, active      |
| `Order`   | orderId, items[], subtotal, discount, gst, shipping, total, coupon  |

---

## 📝 Assumptions

All assumptions made where the assessment left decisions open (to be updated as implementation proceeds):

1. **GST rate** — 18%, applied on `(Subtotal − Coupon Discount)`; shipping is not taxed.
2. **Shipping** — ₹49 standard fee; free above ₹999 order value (both configurable via `.env`).
3. **Coupon expiry** — every coupon record carries an `expiresAt` date; expired coupons are rejected with a message.
4. **BUY2GET1 eligibility** — products in the *Accessories* category are eligible; the cheapest of the three units is free (discount applied before GST).
5. **Duplicate cart entries** — adding an existing product increments its quantity instead of creating a duplicate line (standard cart behaviour).
6. **Stock** — placing an order decrements stock; quantity can never exceed available stock.
7. **Rounding** — all currency values are rounded to 2 decimal places at the final step.

---

## 🗺️ Roadmap

- [x] **Phase 0** — Repository, README, project skeleton
- [ ] **Phase 1** — Backend: models, migrations/seed, REST API
- [ ] **Phase 2** — Billing & coupon engine with unit tests
- [ ] **Phase 3** — Frontend: product grid, cart, coupon section, billing summary, order confirmation
- [ ] **Phase 4** — Validation polish, error states, responsive UI pass
- [ ] **Phase 5** — Final QA, README updates, submission

---

## 📌 Assessment Guidelines

- Official documentation, search engines, AI coding assistants and personal notes **may be used**.
- Every implementation detail and technical decision must be **explainable during the technical discussion**.
- Payment gateway integration is **not required** — orders are dummy orders.

---

<p align="center">
  <img src="assets/elrics-logo.png" alt="Elrics" width="70" /><br/><br/>
  <sub>Guided by Wisdom — Elrics Technical Assessment</sub>
</p>
