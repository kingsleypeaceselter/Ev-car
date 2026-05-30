import {
getAuth,
signInWithEmailAndPassword
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { app }
from "./firebase.js";

const auth =
getAuth(app);

document
.getElementById("loginBtn")
.addEventListener(
"click",
async function(){

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

window.location.href =
"dashboard.html";

}catch(error){

alert(error.message);

}

});