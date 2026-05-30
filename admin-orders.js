import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ordersContainer =
document.getElementById(
"ordersContainer"
);

async function loadOrders() {

    const snapshot =
    await getDocs(
        collection(db, "orders")
    );

    let html = "";

    snapshot.forEach(docItem => {

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
        Total: $${order.total}
        </p>

        <p>
        Status:
        ${order.status}
        </p>

        <button
        class="completeBtn"
        data-id="${docItem.id}"
        >
        Mark Completed
        </button>

        </div>

        <hr>

        `;

    });

    ordersContainer.innerHTML =
    html;
}

ordersContainer.addEventListener(
"click",

async function(e){

const btn =
e.target.closest(
".completeBtn"
);

if(!btn) return;

await updateDoc(

doc(
db,
"orders",
btn.dataset.id
),

{
status:
"Completed"
}

);

loadOrders();

}
);

loadOrders();