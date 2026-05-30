import {
getAuth,
createUserWithEmailAndPassword
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
setDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
app,
db
}
from "./firebase.js";

const auth =
getAuth(app);

document
.getElementById("registerBtn")
.addEventListener(
"click",
async function(){

const name =
document.getElementById("name").value;

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

try{

const userCredential =
await createUserWithEmailAndPassword(
auth,
email,
password
);

await setDoc(
doc(
db,
"users",
userCredential.user.uid
),
{
name,
email
}
);

alert("Account Created");

window.location.href =
"user-login.html";

}catch(error){

alert(error.message);

}

});