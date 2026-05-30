import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyCWTlr45oPyh_UfoZ1UvqkJ9XyIKVgjUBA",

  authDomain: "my-ev-cars.firebaseapp.com",

  projectId: "my-ev-cars",

  storageBucket: "my-ev-cars.firebasestorage.app",

  messagingSenderId: "605495846747",

  appId:
  "1:605495846747:web:6d13374cc433ffb99d9c7e"

};

export const app =
initializeApp(firebaseConfig);

export const db =
getFirestore(app);