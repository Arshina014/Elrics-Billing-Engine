
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GST_RATE = 0.18;
const SHIPPING_FEE = 49;
const FREE_SHIPPING_LIMIT = 999;

// Sample products
const products = [
  { id: "P101", name: "Wireless Headphones", category: "Electronics", price: 1999, stock: 20 },
  { id: "P102", name: "Smart Watch", category: "Electronics", price: 2999, stock: 15 },
  { id: "P103", name: "USB Cable", category: "Accessories", price: 299, stock: 30 },
  { id: "P104", name: "Phone Case", category: "Accessories", price: 399, stock: 25 },
  { id: "P105", name: "Power Bank", category: "Accessories", price: 899, stock: 10 },
  { id: "P106", name: "Bluetooth Speaker", category: "Electronics", price: 1499, stock: 12 }
];

const orders = [];

const coupons = {
  WELCOME10: { type: "percentage", value: 10, min: 1000, max: 500 },
  FLAT500: { type: "flat", value: 500, min: 5000 },
  FESTIVAL20: { type: "percentage", value: 20, min: 10000, max: 2000 },
  FREESHIP: { type: "shipping" },
  BUY2GET1: { type: "buy2get1" }
};

// Calculate bill
function calculateBill(items, couponCode = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart cannot be empty");
  }

  let subtotal = 0;
  const cart = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    const quantity = Number(item.quantity);

    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid product quantity");
    }
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} units available for ${product.name}`);
    }

    cart.push({ product, quantity });
    subtotal += product.price * quantity;
  }

  let discount = 0;
  let freeShipping = false;
  let appliedCoupon = null;

  if (couponCode) {
    const code = String(couponCode).trim().toUpperCase();
    const coupon = coupons[code];

    if (!coupon) throw new Error("Invalid coupon code");

    if (coupon.min && subtotal < coupon.min) {
      throw new Error(`Minimum purchase of ₹${coupon.min} required`);
    }

    switch (coupon.type) {
      case "percentage":
        discount = Math.min(subtotal * coupon.value / 100, coupon.max);
        break;

      case "flat":
        discount = coupon.value;
        break;

      case "shipping":
        freeShipping = true;
        break;

      case "buy2get1": {
        const eligibleItems = cart
          .filter(item => item.product.category === "Accessories")
          .flatMap(item => Array(item.quantity).fill(item.product.price))
          .sort((a, b) => a - b);

        if (eligibleItems.length < 3) {
          throw new Error("BUY2GET1 requires at least 3 accessories");
        }

        discount = eligibleItems[0];
        break;
      }
    }

    appliedCoupon = code;
  }

  discount = Math.min(discount, subtotal);

  const discountedSubtotal = subtotal - discount;
  const gst = discountedSubtotal * GST_RATE;

  const shipping = freeShipping || subtotal > FREE_SHIPPING_LIMIT
    ? 0
    : SHIPPING_FEE;

  const total = discountedSubtotal + gst + shipping;

  return {
    items: cart.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity
    })),
    subtotal: Number(subtotal.toFixed(2)),
    couponCode: appliedCoupon,
    discount: Number(discount.toFixed(2)),
    gstRate: GST_RATE,
    gst: Number(gst.toFixed(2)),
    shipping,
    total: Number(total.toFixed(2))
  };
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Billing Engine API is running" });
});

// Get products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Get available coupons
app.get("/api/coupons", (req, res) => {
  res.json(Object.keys(coupons));
});

// Calculate bill / validate coupon
app.post("/api/billing/quote", (req, res) => {
  try {
    const { items, couponCode } = req.body;
    const bill = calculateBill(items, couponCode);
    res.json({ success: true, bill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Place order
app.post("/api/orders", (req, res) => {
  try {
    const { items, couponCode } = req.body;
    const bill = calculateBill(items, couponCode);

    // Reduce inventory only after successful validation
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      product.stock -= Number(item.quantity);
    }

    const order = {
      id: `ORD-${Date.now()}`,
      ...bill,
      status: "CONFIRMED",
      createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.listen(PORT, () => {
  console.log(`Billing Engine running at http://localhost:${PORT}`);
});
