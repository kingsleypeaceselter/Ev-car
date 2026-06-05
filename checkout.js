
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

// ==========================================
// DOM ELEMENTS (HTML Layout Selectors)
// ==========================================
const nameInput = document.getElementById("customerName");
const emailInput = document.getElementById("customerEmail");
const phoneInput = document.getElementById("customerPhone");
const addressInput = document.getElementById("customerAddress");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const paymentMethod = document.getElementById("paymentMethod");
const bankDetails = document.getElementById("bankDetails");

// ==========================================
// GLOBAL STATE DATA VARIABLES
// ==========================================
let currentUserData = null;
let cart = []; 
let total = 0;

// ==========================================
// 1. MONITOR AUTH STATE & AUTO-FILL DATA
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User logged in -> Autofill email from Auth account credentials
        emailInput.value = user.email;

        try {
            // Fetch profile data from Firestore "users" collection
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                currentUserData = userDocSnap.data();
                // Autofill name from Firestore profile document rules
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
        // No user logged in -> Redirect back to user login form setup
        alert("Please Login First to complete your checkout.");
        window.location.href = "user-login.html";
    }
});

// ==========================================
// 2. LOAD LOCAL BASKET DATA (From LocalStorage)
// ==========================================
function loadCartData() {
    // Pull active cart items saved from storefront interactions
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart.length === 0) {
        alert("Your shopping cart is empty!");
        window.location.href = "index.html";
        return;
    }

    // Calculate total price structure seamlessly
    total = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
    console.log(`Cart Loaded. Total: $${total}`, cart);
}

// ==========================================
// 3. PAYMENT METHOD SELECTION LISTENER
// ==========================================
// FIXED: Placed safely out in the open so it works immediately when the page loads!
paymentMethod.addEventListener("change", function() {
    if (paymentMethod.value === "bank") {
        bankDetails.style.display = "block";
    } else {
        bankDetails.style.display = "none";
    }
});

// ==========================================
// 4. PLACE ORDER ACTION WORKFLOW
// ==========================================
async function handlePlaceOrder(e) {
    e.preventDefault(); // Stop the form from refreshing the browser window

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

    // Disable button to prevent multi-clicking while server database writes execute
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerText = "Processing Order...";

    try {
        // FIXED: Cleaned up the duplicates into one structured data payload object
        const orderData = {
            userId: user.uid,
            customerName: currentUserData?.name || nameInput.value,
            customerEmail: user.email,
            customerPhone: phoneInput.value.trim(),
            customerAddress: addressInput.value.trim(),
            paymentMethod: paymentMethod.value, // Captured seamlessly
            status: "Pending",
            items: cart,
            total: total,
            createdAt: new Date() // Server tracking reference timestamp
        };

        // Write directly to your main firestore "orders" data storage collection
        const orderRef = await addDoc(collection(db, "orders"), orderData);
        console.log("Order placed successfully! Document ID:", orderRef.id);

        // Clear shopping basket cache from local storage after checkout success
        localStorage.removeItem("cart");

        alert("🎉 Your order has been placed successfully!");
        
        // Redirect them to their personal profile dashboard view tracking log
window.location.href = "my-orders.html";


    } catch (error) {
        console.error("Error processing your checkout database write:", error);
        alert("Something went wrong saving your order. Please try again.");
        
        // Re-enable interactive click button on failures
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerText = "Place Order";
    }
}

// ==========================================
// 5. EVENT ACTIVATOR DELEGATION
// ==========================================
placeOrderBtn.addEventListener("click", handlePlaceOrder);