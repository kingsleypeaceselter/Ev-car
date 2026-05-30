import { db }
from "./firebase.js";

import {
collection,
getDocs
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ordersContainer =
document.getElementById(
"ordersContainer"
);

async function loadOrders(){

const snapshot =
await getDocs(
collection(db,"orders")
);

let html = "";

snapshot.forEach(docItem=>{

const order =
docItem.data();

html += `

<div class="card">

<h3>
${order.customerName}
</h3>

<p>
${order.customerEmail}
</p>

<p>
${order.customerPhone}
</p>

<p>
${order.customerAddress}
</p>

<p>
Total:
$${order.total}
</p>

</div>

`;

});

ordersContainer.innerHTML =
html;

}

loadOrders();