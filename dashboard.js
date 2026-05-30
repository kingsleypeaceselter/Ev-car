import {
getAuth,
signOut
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { app }
from "./firebase.js";

const auth =
getAuth(app);

document
.getElementById("logoutBtn")
.addEventListener(
"click",
async function(){

await signOut(auth);

window.location.href =
"user-login.html";

});