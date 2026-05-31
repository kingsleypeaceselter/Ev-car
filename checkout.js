import { db } from "./firebase.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    collection, 
    addDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth();

// DOM Elements
const nameInput = document.getElementById("customerName");
const emailInput = document.getElementById("customerEmail");
const phoneInput = document.getElementById("customerPhone");
const addressInput = document.getElementById("customerAddress");
const placeOrderBtn = document.getElementById("placeOrderBtn");

// Global variables for data tracking
let currentUserData = null;
let cart = []; 
let total = 0;

// ==========================================
// 1. MONITOR AUTH STATE & AUTO-FILL DATA
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User logged in -> Autofill email from Auth
        emailInput.value = user.email;

        try {
            // Fetch profile data from Firestore "users" collection
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                currentUserData = userDocSnap.data();
                // Autofill name from Firestore profile
                nameInput.value = currentUserData.name || "No Name Provided";
            } else {
                console.warn("User profile document not found in Firestore!");
                nameInput.value = "Guest Buyer";
            }
        } catch (error) {
            console.error("Error loading user profile:", error);
        }

        // Load cart details for checkout calculations
        loadCartData();

    } else {
        // No user logged in -> Redirect back to login block
        alert("Please Login First to complete your checkout.");
        window.location.href = "user-login.html";
    }
});

// ==========================================
// 2. LOAD LOCAL BASKET DATA (From LocalStorage)
// ==========================================
function loadCartData() {
    // Pull active cart items saved from index.html / product.html
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart.length === 0) {
        alert("Your shopping cart is empty!");
        window.location.href = "index.html";
        return;
    }

    // Calculate total price structure
    total = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
    console.log(`Cart Loaded. Total: $${total}`, cart);
}

// ==========================================
// 3. PLACE ORDER ACTION
// ==========================================
async function handlePlaceOrder(e) {
    e.preventDefault(); // Stop page from refreshing

    const user = auth.currentUser;
    if (!user) {
        alert("Session expired. Please log in again.");
        return;
    }

    // Form input validation checks
    if (phoneInput.value.trim() === "" || addressInput.value.trim() === "") {
        alert("Please complete both your Phone Number and Delivery Address fields!");
        return;
    }

    // Disable button to prevent multi-clicking while server works
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerText = "Processing Order...";

    try {
        // Construct the target safe schema object structure
        const orderData = {
            userId: user.uid,
            customerName: currentUserData?.name || nameInput.value,
            customerEmail: user.email,
            customerPhone: phoneInput.value.trim(),
            customerAddress: addressInput.value.trim(),
            status: "Pending",
            items: cart,
            total: total,
            createdAt: new Date() // Server timestamp reference tracking
        };

        // Write directly to your main firestore "orders" stream tracker
        const orderRef = await addDoc(collection(db, "orders"), orderData);
        console.log("Order placed successfully! Document ID:", orderRef.id);

        // Clear shopping basket from machine storage after checkout success
        localStorage.removeItem("cart");

        alert("🎉 Your order has been placed successfully!");
        
        // Redirect them to their personal profile dashboard page to view their order status tracking log
        window.location.href = "orders.html";

    } catch (error) {
        console.error("Error processing your checkout database write:", error);
        alert("Something went wrong saving your order. Please try again.");
        
        // Re-enable clicker button on failure tracking setups
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerText = "Place Order";
    }
}

// Event Listener activation
placeOrderBtn.addEventListener("click", handlePlaceOrder);