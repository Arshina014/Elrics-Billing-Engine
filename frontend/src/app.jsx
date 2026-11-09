
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [activeCoupon, setActiveCoupon] = useState("");
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(setProducts)
      .catch(() => setError("Cannot connect to backend. Is port 5000 running?"));
  }, []);

  useEffect(() => {
    if (!cart.length) {
      setBill(null);
      return;
    }

    fetch(`${API}/billing/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map(p => ({
          productId: p.id,
          quantity: p.quantity
        })),
        couponCode: activeCoupon || null
      })
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message);
        return data.bill;
      })
      .then(b => {
        setBill(b);
        setError("");
      })
      .catch(e => {
        setBill(null);
        setError(e.message);
      });
  }, [cart, activeCoupon]);

  const money = n => `₹${Number(n || 0).toFixed(2)}`;

  function addProduct(product) {
    setMessage("");
    setError("");
    setCart(old => {
      const found = old.find(p => p.id === product.id);
      if (found) {
        if (found.quantity >= product.stock) {
          setError("Maximum stock reached");
          return old;
        }
        return old.map(p => p.id === product.id
          ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...old, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setCart(old => old
      .map(p => p.id === id
        ? { ...p, quantity: p.quantity + amount } : p)
      .filter(p => p.quantity > 0)
    );
  }

  function applyCoupon() {
    setActiveCoupon(coupon.trim().toUpperCase());
    setError("");
    setMessage("");
  }

  async function checkout() {
    if (!cart.length || !bill) return;

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(p => ({
            productId: p.id,
            quantity: p.quantity
          })),
          couponCode: activeCoupon || null
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage(`Order confirmed! Order ID: ${data.order.id}`);
      setCart([]);
      setCoupon("");
      setActiveCoupon("");

      const updated = await fetch(`${API}/products`);
      setProducts(await updated.json());
    } catch (e) {
      setError(e.message);
    }
  }

  const icons = ["🎧", "⌚", "🔌", "📱", "🔋", "🔊"];

  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="logo">E</span>
          <div>
            <h1>ELRICS</h1>
            <small>SMART BILLING ENGINE</small>
          </div>
        </div>
        <div className="cart-count">
          🛒 {cart.reduce((s, p) => s + p.quantity, 0)} items
        </div>
      </header>

      <section className="hero">
        <p>SMART SHOPPING EXPERIENCE</p>
        <h2>Everything you need.<br />One simple checkout.</h2>
        <span>Discover products and enjoy exclusive savings.</span>
      </section>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <main>
        <section>
          <div className="heading">
            <div>
              <small>OUR COLLECTION</small>
              <h2>Explore Products</h2>
            </div>
            <span>{products.length} products</span>
          </div>

          <div className="products">
            {products.map((p, i) => (
              <article className="product" key={p.id}>
                <div className="product-icon">{icons[i % 6]}</div>
                <small className="category">{p.category}</small>
                <h3>{p.name}</h3>
                <div className="product-bottom">
                  <div>
                    <strong>{money(p.price)}</strong>
                    <small>{p.stock} in stock</small>
                  </div>
                  <button disabled={!p.stock} onClick={() => addProduct(p)}>
                    + Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="cart">
          <small>YOUR PURCHASE</small>
          <h2>Shopping Cart</h2>

          {!cart.length ? (
            <div className="empty">
              <span>🛍️</span>
              <p>Your cart is empty</p>
              <small>Add products to start shopping.</small>
            </div>
          ) : (
            <>
              {cart.map(p => (
                <div className="cart-item" key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{money(p.price)} each</small>
                    <div className="quantity">
                      <button onClick={() => changeQuantity(p.id, -1)}>−</button>
                      <span>{p.quantity}</span>
                      <button
                        disabled={p.quantity >= p.stock}
                        onClick={() => changeQuantity(p.id, 1)}
                      >+</button>
                    </div>
                  </div>
                  <strong>{money(p.price * p.quantity)}</strong>
                </div>
              ))}

              <div className="coupon">
                <label>Coupon code</label>
                <div>
                  <input
                    placeholder="Enter coupon"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                  />
                  <button onClick={applyCoupon}>Apply</button>
                </div>
                {activeCoupon && <small>Selected: {activeCoupon}</small>}
              </div>

              {bill && (
                <div className="bill">
                  <p><span>Subtotal</span><b>{money(bill.subtotal)}</b></p>
                  <p><span>Discount</span><b className="saving">−{money(bill.discount)}</b></p>
                  <p><span>GST (18%)</span><b>{money(bill.gst)}</b></p>
                  <p><span>Shipping</span><b>{money(bill.shipping)}</b></p>
                  <div className="total">
                    <strong>Total</strong>
                    <strong>{money(bill.total)}</strong>
                  </div>
                  <button className="checkout" onClick={checkout}>
                    Place Order →
                  </button>
                </div>
              )}
            </>
          )}

          <div className="offers">
            <strong>Available Offers</strong>
            <p>WELCOME10 · FLAT500</p>
            <p>FESTIVAL20 · FREESHIP</p>
            <p>BUY2GET1</p>
          </div>
        </aside>
      </main>

      <footer>ELRICS © 2026 · Smart Billing & Coupon Engine</footer>
    </div>
  );
}
