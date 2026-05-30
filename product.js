import { db }
from "./firebase.js";

import {

doc,
getDoc,
collection,
getDocs

}

from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const productDetails =
document.getElementById(
"productDetails"
);

const relatedProducts =
document.getElementById(
"relatedProducts"
);

// ======================
// GET PRODUCT ID
// ======================

const params =
new URLSearchParams(
window.location.search
);

const productId =
params.get("id");

// ======================
// LOAD PRODUCT
// ======================

async function loadProduct(){

const productRef =
doc(
db,
"products",
productId
);

const snapshot =
await getDoc(productRef);

if(!snapshot.exists()){

productDetails.innerHTML =
"<h2>Product Not Found</h2>";

return;

}

const item =
snapshot.data();

displayProduct(item);

loadRelatedProducts(
item.brand
);

}

// ======================
// DISPLAY PRODUCT
// ======================

let sliderInterval;

function displayProduct(item){

const images =
item.images || [];

let thumbnails = "";

images.forEach(image => {

thumbnails += `

<img
src="${image}"
class="thumbImage"
width="80"
>

`;

});

productDetails.innerHTML = `

<div class="productPage">

<div class="productGallery">

<img
src="${images[0]}"
id="mainProductImage"
class="mainProductImage"
>

<div class="thumbContainer">

${thumbnails}

</div>

</div>

<div class="productInfo">

<h1>${item.name}</h1>

<p>🏷 Brand: ${item.brand}</p>

<p>💰 Price: $${item.price}</p>

<p>⭐ Rating: ${item.rating}</p>

<p>🔋 Battery: ${item.batterySize}</p>

<p>🚀 Top Speed: ${item.topSpeed}</p>

<p>📅 Year: ${item.year}</p>

<p>🛣 Mileage: ${item.mileage}</p>

<p>🎨 Color: ${item.color}</p>

<p>🪑 Seats: ${item.seats}</p>

<p>⚡ Charging Time: ${item.chargingTime}</p>

<p>📦 Stock: ${item.stock}</p>

<p>Status: ${item.status}</p>

<p class="description">

📝 ${item.description}

</p>

<button id="buyNow">
Place Order
</button>

<button id="favoriteBtn">
❤️ Favorite
</button>

</div>

</div>

`;

activateGallery(images);

startImageSlider(images);

setupBuyNow(item);

}

// ======================
// IMAGE GALLERY
// ======================

function activateGallery(images){

const mainImage =
document.getElementById(
"mainProductImage"
);

const thumbs =
document.querySelectorAll(
".thumbImage"
);

thumbs.forEach((thumb,index)=>{

thumb.addEventListener(
"click",

function(){

clearInterval(
sliderInterval
);

mainImage.src =
images[index];

}

);

});

}

// ======================
// AUTO SLIDER
// ======================

function startImageSlider(images){

if(images.length <= 1)
return;

const mainImage =
document.getElementById(
"mainProductImage"
);

let index = 0;

sliderInterval =
setInterval(()=>{

index++;

if(index >= images.length){

index = 0;

}

mainImage.src =
images[index];

},2000);

}

// ======================
// RELATED PRODUCTS
// ======================

async function loadRelatedProducts(brand){

const snapshot =
await getDocs(
collection(db,"products")
);

let html = "";

snapshot.forEach(docItem => {

const item =
docItem.data();

if(

item.brand === brand

&&

docItem.id !== productId

){

html += `

<div class="card">

<a href="product.html?id=${docItem.id}">

<img
src="${item.images?.[0]}"
width="200"
>

<h3>${item.name}</h3>

<p>
💰 $${item.price}
</p>

<p>
⭐ ${item.rating}
</p>

</a>

</div>

`;

}

});

relatedProducts.innerHTML =
html;

}

// ======================
// INITIAL LOAD
// ======================

loadProduct();

// ======================
// PLACE ORDER
// ======================

function setupBuyNow(item){

const buyBtn =
document.getElementById(
"buyNow"
);

buyBtn.addEventListener(
"click",

function(){

let cart =

JSON.parse(
localStorage.getItem("cart")
) || [];

const existing =
cart.find(product =>

product.name === item.name

);

if(existing){

existing.quantity++;

}else{

cart.push({

...item,
quantity:1

});

}

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

window.location.href =
"checkout.html";

}

);

}