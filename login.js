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

const loginBtn =
document.getElementById(
"loginBtn"
);

const errorText =
document.getElementById(
"loginError"
);

loginBtn.addEventListener(
"click",

async function(){

const email =
document.getElementById(
"email"
).value;

const password =
document.getElementById(
"password"
).value;

try{

await signInWithEmailAndPassword(

auth,
email,
password

);

localStorage.setItem(
"adminLoggedIn",
"true"
);

window.location.href =
"admin.html";

}catch(error){

errorText.textContent =
error.message;

}

}
);