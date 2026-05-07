// Jahid - Added React Router navigation for professional page routing
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import foods from "./data";
import Navbar from "./components/Navbar/Navbar";
import SearchFilter from "./components/SearchFilter/SearchFilter";
import Pagination from "./components/Pagination/Pagination";
import DietCount from "./components/DietCount/DietCount";
import "./App.css";

const PER_PAGE = 20;
const CART_KEY = "curiouseats.cart.v1";

// Jahid - Created reusable homepage with search, filter and pagination
function HomePage({ foods, cart, onAdd }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [diet, setDiet] = useState("all");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, category, diet, sort]);

  const q = search.trim().toLowerCase();

  let list = foods.filter((f) => {
    if (category !== "All" && f.category !== category) return false;

    if (diet === "veg" && !f.veg) return false;

    if (diet === "nonveg" && f.veg) return false;

    if (q) {
      const text = (
        f.name + " " + f.description + " " + f.category
      ).toLowerCase();

      if (!text.includes(q)) return false;
    }

    return true;
  });

  // Jahid - Added sorting interactions
  if (sort === "price-asc") {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    list = [...list].sort((a, b) => b.price - a.price);
  } else if (sort === "rating-desc") {
    list = [...list].sort((a, b) => b.rating - a.rating);
  }

  const totalPages = Math.ceil(list.length / PER_PAGE);

  const startIdx = (page - 1) * PER_PAGE;

  const visible = list.slice(startIdx, startIdx + PER_PAGE);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Our Menu</h1>
        <p>Browse delicious dishes from around the world.</p>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        dietFilter={diet}
        onDietChange={setDiet}
        sortBy={sort}
        onSortChange={setSort}
      />

      <DietCount items={list} />

      <div className="card-grid">
        {visible.map((item) => (
          <div className="food-card" key={item.id}>
            
            {/* Jahid - Added clickable item detail navigation */}
            <Link to={`/item/${item.id}`}>
              <img src={item.image} alt={item.name} />
            </Link>

            <div className="card-content">
              <h3>{item.name}</h3>

              <p>{item.description}</p>

              <div className="card-meta">
                <span>⭐ {item.rating}</span>
                <span>${item.price}</span>
              </div>

              <div className="diet-tags">
                {item.veg ? (
                  <span className="veg">Vegetarian</span>
                ) : (
                  <span className="nonveg">Non-Veg</span>
                )}

                {item.halal && (
                  <span className="halal">Halal</span>
                )}
              </div>

              <button
                className="add-btn"
                onClick={() => onAdd(item)}
              >
                Add to Cart
              </button>

              <Link
                to={`/item/${item.id}`}
                className="details-btn"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

// Jahid - Added detailed item pages with dietary information and calories
function ItemDetails({ foods, onAdd }) {
  const { id } = useParams();

  const item = foods.find((f) => f.id === Number(id));

  if (!item) {
    return <h2>Item not found</h2>;
  }

  return (
    <div className="details-page">
      <Link to="/" className="back-btn">
        ← Back to Menu
      </Link>

      <div className="details-card">
        <img
          src={item.image}
          alt={item.name}
          className="details-image"
        />

        <div className="details-content">
          <h1>{item.name}</h1>

          <p className="details-description">
            {item.description}
          </p>

          <div className="details-meta">
            <span>⭐ {item.rating}</span>
            <span>${item.price}</span>
            <span>{item.calories} kcal</span>
          </div>

          <div className="diet-section">
            <p>
              <strong>Vegetarian:</strong>{" "}
              {item.veg ? "Yes" : "No"}
            </p>

            <p>
              <strong>Halal:</strong>{" "}
              {item.halal ? "Yes" : "No"}
            </p>

            <p>
              <strong>Gluten Free:</strong>{" "}
              {item.glutenFree ? "Yes" : "No"}
            </p>
          </div>

          <div className="ingredients">
            <h3>Ingredients</h3>

            <ul>
              {item.ingredients.map((ing, index) => (
                <li key={index}>{ing}</li>
              ))}
            </ul>
          </div>

          <button
            className="add-btn"
            onClick={() => onAdd(item)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// Jahid - Improved checkout flow with order summary and success message
function CartPage({
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}) {
  const [success, setSuccess] = useState(false);

  const items = Object.values(cart);

  let subtotal = 0;

  items.forEach((row) => {
    subtotal += row.item.price * row.quantity;
  });

  const delivery = subtotal > 500 ? 0 : 15;

  const total = subtotal + delivery;

  function handleCheckout() {
    setSuccess(true);
    onCheckout();
  }

  if (success) {
    return (
      <div className="checkout-success">
        <h1>Thank You!</h1>
        <p>Your order has been placed successfully.</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Browse the menu and add delicious dishes.</p>
        </div>
      ) : (
        <>
          {items.map((row) => (
            <div className="cart-row" key={row.item.id}>
              <img
                src={row.item.image}
                alt={row.item.name}
              />

              <div className="cart-info">
                <h3>{row.item.name}</h3>
                <p>${row.item.price}</p>
              </div>

              <div className="qty-controls">
                <button
                  onClick={() =>
                    onDecrement(row.item.id)
                  }
                >
                  -
                </button>

                <span>{row.quantity}</span>

                <button
                  onClick={() =>
                    onIncrement(row.item.id)
                  }
                >
                  +
                </button>
              </div>

              <button
                onClick={() => onRemove(row.item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="bill-summary">
            <h2>Order Summary</h2>

            <p>
              Subtotal: ${subtotal.toFixed(2)}
            </p>

            <p>
              Delivery: ${delivery.toFixed(2)}
            </p>

            <h3>Total: ${total.toFixed(2)}</h3>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Confirm Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  // Jahid - Added persistent localStorage cart system
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(CART_KEY);

    if (!saved) return {};

    try {
      return JSON.parse(saved) || {};
    } catch {
      return {};
    }
  });

  // Jahid - Save cart automatically
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Jahid - Add item to cart
  function addToCart(item) {
    setCart((prev) => {
      const next = { ...prev };

      if (next[item.id]) {
        next[item.id] = {
          ...next[item.id],
          quantity: next[item.id].quantity + 1,
        };
      } else {
        next[item.id] = {
          item,
          quantity: 1,
        };
      }

      return next;
    });
  }

  // Jahid - Increase quantity
  function incQty(id) {
    setCart((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: prev[id].quantity + 1,
      },
    }));
  }

  // Jahid - Decrease quantity
  function decQty(id) {
    setCart((prev) => {
      const next = { ...prev };

      if (!next[id]) return prev;

      const newQty = next[id].quantity - 1;

      if (newQty <= 0) {
        delete next[id];
      } else {
        next[id] = {
          ...next[id],
          quantity: newQty,
        };
      }

      return next;
    });
  }

  // Jahid - Remove item from cart
  function removeItem(id) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  // Jahid - Clear cart after checkout
  function clearCart() {
    setCart({});
  }

  let cartCount = 0;

  for (const id in cart) {
    cartCount += cart[id].quantity;
  }

  return (
    <BrowserRouter>
      <Navbar cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              foods={foods}
              cart={cart}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              onIncrement={incQty}
              onDecrement={decQty}
              onRemove={removeItem}
              onCheckout={clearCart}
            />
          }
        />

        <Route
          path="/item/:id"
          element={
            <ItemDetails
              foods={foods}
              onAdd={addToCart}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
