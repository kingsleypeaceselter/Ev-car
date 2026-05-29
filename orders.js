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