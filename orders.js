import { db }
from "./firebase.js";

import {
collection,
query,
where,
getDocs
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getAuth
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth =
getAuth();

const ordersContainer =
document.getElementById(
"ordersContainer"
);

async function loadOrders(){

const user =
auth.currentUser;

if(!user){

ordersContainer.innerHTML =
"<h2>Please Login</h2>";

return;

}

const q =
query(

collection(db,"orders"),

where(
"userId",
"==",
user.uid
)

);

const snapshot =
await getDocs(q);

let html = "";

snapshot.forEach(docItem=>{

const order =
docItem.data();

html += `

<div class="card">

<h3>
Order
</h3>

<p>
Status:
${order.status}
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

auth.onAuthStateChanged(
function(user){

if(user){

loadOrders();

}

}
);