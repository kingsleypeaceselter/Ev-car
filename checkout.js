import { db }
from "./firebase.js";

import {

collection,
addDoc

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const checkoutItems =
document.getElementById(
"checkoutItems"
);

const checkoutTotal =
document.getElementById(
"checkoutTotal"
);

const customerName =
document.getElementById(
"customerName"
);

const customerEmail =
document.getElementById(
"customerEmail"
);

const customerPhone =
document.getElementById(
"customerPhone"
);

const customerAddress =
document.getElementById(
"customerAddress"
);

const placeOrderBtn =
document.getElementById(
"placeOrderBtn"
);

let cart =
JSON.parse(
localStorage.getItem("cart")
) || [];

// ======================
//cart products checkout display
// ======================
function displayCheckout(){

let html = "";

let total = 0;

cart.forEach(item => {

total +=
item.price *
item.quantity;

html += `

<div class="card">

<img
src="${item.images?.[0] || 'https://via.placeholder.com/150'}"
width="150"
>

<h3>${item.name}</h3>

<p>
Price: $${item.price}
</p>

<p>
Quantity: ${item.quantity}
</p>

</div>

`;

});

checkoutItems.innerHTML =
html;

checkoutTotal.innerHTML =

`Total: $${total}`;

}

// ======================
//save order to firebase
// ======================

placeOrderBtn.addEventListener(
"click",

async function(){

if(cart.length === 0){

alert("Cart Empty");

return;

}

if(

customerName.value === "" ||
customerEmail.value === "" ||
customerPhone.value === "" ||
customerAddress.value === ""

){

alert("Fill all fields");

return;

}

const total =
cart.reduce(

(total,item)=>

total +
(item.price * item.quantity),

0

);

await addDoc(

collection(db,"orders"),

{

customerName:
customerName.value,

customerEmail:
customerEmail.value,

status:
"Pending",

customerPhone:
customerPhone.value,

customerAddress:
customerAddress.value,

items: cart,

total: total,

createdAt:
new Date()

}

);

alert("Order Placed Successfully");

localStorage.removeItem(
"cart"
);

cart = [];

window.location.href =
"index.html";

}
);

displayCheckout();