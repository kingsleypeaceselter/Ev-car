import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================
// DOM ELEMENTS (HTML Layout Selectors)
// ======================
const productsContainer = document.getElementById("products");
const cartContainer = document.getElementById("cart");
const favoritesContainer = document.getElementById("favorites");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("priceSelect");

// Lightbox Pop-up Sliders
const galleryModal = document.getElementById("galleryModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");
const prevImage = document.getElementById("prevImage");
const nextImage = document.getElementById("nextImage");

// ======================
// GLOBAL STATE APP VARIABLES
// ======================
let products = [];          // Master list holding all raw cars fetched from Firebase
let filteredProducts = [];  // Copy array used for active sorting and search inputs
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Active Modal Slider indexes
let currentImages = [];
let currentImageIndex = 0;

// ==========================================================================
// HUMAN HINT: Fetches data collections from Firestore and saves them locally.
// ==========================================================================
async function loadProducts(){
  const snapshot = await getDocs(collection(db, "products"));
  products = [];

  snapshot.forEach(doc => {
    products.push({
      id: doc.id,
      ...doc.data()
    });
  });

  // Make a clean duplicate copy so search filter changes don't lose your data
  filteredProducts = [...products];
  displayProducts();
}

// ==========================================================================
// HUMAN HINT: Loops over products to generate and append the HTML interface.
// ==========================================================================
function displayProducts(){
  let html = "";

  // FIXED: Now loops directly through ALL filtered cars instead of a sliced layout array
  filteredProducts.forEach(item => {
    const images = item.images || [];

    html += `
    <div class="card">
      <a href="product.html?id=${item.id}">
        <img
          src="${images[0] || 'https://via.placeholder.com/200'}"
          class="productImage autoSlider"
          data-images='${JSON.stringify(images)}'
          data-index="0"
        >
      </a>

      ${item.rating >= 4.5 ? "<span class='badge'>Top Rated</span>" : ""}

      <h3>${item.name}</h3>
      <p>🏷 ${item.brand}</p>
      <p>📦 ${item.stock} In Stock</p>
      <p class="${item.status}">${item.status}</p>
      <p>💰 Price: $${item.price}</p>
      <p>🔋 Battery: ${item.batterySize}</p>
      <p>🚀 Top Speed: ${item.topSpeed}</p>
      <p>⭐ Rating: ${item.rating}</p>
      <p>📅 Year: ${item.year}</p>
      <p>🛣 Mileage: ${item.mileage}</p>
      <p>🎨 Color: ${item.color}</p>
      <p>🪑 Seats: ${item.seats}</p>
      <p>⚡ Charging Time: ${item.chargingTime}</p>
      <p>📝 Description: ${item.description}</p>

      <input type="number" class="qtyInput" value="1" min="1">

      <button
        class="addBtn"
        data-id="${item.id}"
        ${item.status === "outofstock" || item.status === "comingsoon" ? "disabled" : ""}
      >
        ${item.status === "outofstock" ? "Out Of Stock" : item.status === "comingsoon" ? "Coming Soon" : "Add To Cart"}
      </button>

      <button class="favBtn" data-id="${item.id}">❤️ Favorite</button>
    </div>
    `;
  });

  if(html === ""){
    productsContainer.innerHTML = "<h2>No product yet</h2>";
  } else {
    productsContainer.innerHTML = html;
  }

  startAutoSlider();
}

// ==========================================================================
// HUMAN HINT: Controls background slide cycling for cards with multiple images.
// ==========================================================================
function startAutoSlider(){
  const sliders = document.querySelectorAll(".autoSlider");

  sliders.forEach(slider => {
    const images = JSON.parse(slider.dataset.images);
    if(images.length <= 1) return;

    let index = 0;
    setInterval(() => {
      index++;
      if(index >= images.length){
        index = 0;
      }
      slider.src = images[index];
    }, 2000);
  });
}

// ==========================================================================
// HUMAN HINT: Real-time search processing on name/brand match string values.
// ==========================================================================
searchInput.addEventListener("input", function(){
  const value = searchInput.value.toLowerCase();

  filteredProducts = products.filter(item =>
    item.name.toLowerCase().includes(value) ||
    item.brand.toLowerCase().includes(value)
  );

  displayProducts();
  startAutoSlider();
});

// ==========================================================================
// HUMAN HINT: Re-orders the current listings high-to-low or low-to-high.
// ==========================================================================
sortSelect.addEventListener("change", function(){
  if(sortSelect.value === "low"){
    filteredProducts.sort((a,b) => a.price - b.price);
  }
  if(sortSelect.value === "high"){
    filteredProducts.sort((a,b) => b.price - a.price);
  }
  displayProducts();
});

// ==========================================================================
// HUMAN HINT: Card Event Delegation. Manages Cart addition, Favorites, and Lightbox open clicks.
// ==========================================================================
productsContainer.addEventListener("click", function(e){
  const fav = e.target.closest(".favBtn");
  if(fav){
    const id = fav.dataset.id;
    const product = products.find(item => item.id === id);

    if(product.status === "outofstock"){
      alert("Product Out Of Stock");
      return;
    }

    const exists = favorites.find(item => item.id === id);
    if(exists){
      alert("Already Favorite");
    } else {
      favorites.push(product);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      alert("Added To Favorites");
    }
  }

  // Lightbox Image Target Trigger Click Check
  const image = e.target.closest(".productImage");
  if(image){
    currentImages = JSON.parse(image.dataset.images);
    if(currentImages.length === 0){
      alert("No Images");
      return;
    }
    currentImageIndex = 0;
    modalImage.src = currentImages[currentImageIndex];
    galleryModal.style.display = "flex";
  }

  // Add-To-Cart Target Trigger Click Check
  const btn = e.target.closest(".addBtn");
  if(!btn) return;

  const id = btn.dataset.id;
  const product = products.find(item => item.id === id);
  const existing = cart.find(item => item.id === id);
  const qtyInput = btn.parentElement.querySelector(".qtyInput");
  const quantity = Number(qtyInput.value);

  if(quantity > product.stock){
    alert("Not enough stock");
    return;
  }

  if(existing){
    if(existing.quantity + quantity > product.stock){
      alert("Stock limit reached");
      return;
    }
    existing.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity: quantity
    });
  }

  displayCart();
});

// ==========================================================================
// HUMAN HINT: Close and button layout sliders inside full screen Modal View.
// ==========================================================================
closeModal.addEventListener("click", function(){
  galleryModal.style.display = "none";
});

nextImage.addEventListener("click", function(){
  if(currentImageIndex < currentImages.length - 1){
    currentImageIndex++;
    modalImage.src = currentImages[currentImageIndex];
  }
});

prevImage.addEventListener("click", function(){
  if(currentImageIndex > 0){
    currentImageIndex--;
    modalImage.src = currentImages[currentImageIndex];
  }
});

// ==========================================================================
// HUMAN HINT: Renders favorited item cards into the saved side menu panel.
// ==========================================================================
function displayFavorites(){
  let html = "";
  favorites.forEach(item => {
    html += `
    <div class="card">
      <img src="${item.images?.[0]}" width="120">
      <h4>${item.name}</h4>
      <p>$${item.price}</p>
      <p>📦 ${item.stock} In Stock</p>
      <button class="removeFav" data-id="${item.id}">Remove</button>
    </div>
    `;
  });

  if(favorites.length === 0){
    favoritesContainer.innerHTML = "<h3>No Favorites Yet</h3>";
    return;
  }
  favoritesContainer.innerHTML = html;
}

// ==========================================================================
// HUMAN HINT: Renders added cart lines, tallies totals, and caches states.
// ==========================================================================
function displayCart(){
  let html = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    html += `
    <div>
      ${item.name}
      <button class="dec" data-id="${item.id}">➖</button>
      ${item.quantity}
      <button class="inc" data-id="${item.id}">➕</button>
      <button class="remove" data-id="${item.id}">❌</button>
    </div>
    `;
  });

  html += `
  <h3>Total: $${total}</h3>
  <button id="clearCart">Clear Cart</button>
  <a href="checkout.html"><button>Proceed To Checkout</button></a>
  `;

  cartContainer.innerHTML = html;
  localStorage.setItem("cart", JSON.stringify(cart));

  if(cart.length === 0){
    cartContainer.innerHTML = "<h3>Cart is Empty</h3>";
    return;
  }
}

// ==========================================================================
// HUMAN HINT: Listens for arithmetic adjustments (plus/minus/remove) inside cart menus.
// ==========================================================================
cartContainer.addEventListener("click", function(e){
  const inc = e.target.closest(".inc");
  const dec = e.target.closest(".dec");
  const del = e.target.closest(".remove");

  if(inc){
    const item = cart.find(i => i.id === inc.dataset.id);
    if(item) item.quantity++;
  }

  if(dec){
    const item = cart.find(i => i.id === dec.dataset.id);
    if(item){
      item.quantity--;
      if(item.quantity <= 0){
        cart = cart.filter(i => i.id !== dec.dataset.id);
      }
    }
  }

  if(del){
    cart = cart.filter(i => i.id !== del.dataset.id);
  }

  const clear = e.target.closest("#clearCart");
  if(clear){
    cart = [];
  }

  displayCart();
});

// ==========================================================================
// HUMAN HINT: Listens for item deletions inside your bookmark favorites panel.
// ==========================================================================
favoritesContainer.addEventListener("click", function(e){
  const remove = e.target.closest(".removeFav");
  if(!remove) return;

  favorites = favorites.filter(item => item.id !== remove.dataset.id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
});

// ======================
// RUN APP AT STARTUP
// ======================
loadProducts();
displayCart();
displayFavorites();