import { db, app } from "./firebase.js";
import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(app);
const ordersContainer = document.getElementById("ordersContainer");

// Function to fetch and display the orders
async function loadOrders(user) {
    if (!user) {
        ordersContainer.innerHTML = "<h2 class='error-msg'>Please Login</h2>";
        return;
    }

    try {
        // Query orders that match the logged-in user's UID
        const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);
        
        // Handle case where user has no orders yet
        if (snapshot.empty) {
            ordersContainer.innerHTML = "<h2 class='empty-msg'>You haven't placed any orders yet. 📦</h2>";
            return;
        }

        let html = "";

        snapshot.forEach(docItem => {
            const order = docItem.data();

            // Build a list of the car items inside this specific order
            let itemsHtml = "";
            if (order.items && Array.isArray(order.items)) {
                itemsHtml = "<ul class='order-items-list'>" + 
                    order.items.map(item => `<li>${item.name} (x${item.quantity || 1})</li>`).join('') + 
                "</ul>";
            }

            // Create the layout using semantic classes instead of inline styles
            html += `
                <div class="order-card">
                    <h3 class="order-id">Order Reference: ${docItem.id.substring(0, 8)}</h3>
                    <p class="order-status">
                        <strong>Status:</strong> 
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </p>
                    <div class="order-details">
                        <strong>Items:</strong> 
                        ${itemsHtml}
                    </div>
                    <p class="order-total"><strong>Total Paid:</strong> $${order.total}</p>
                </div>
            `;
        });

        ordersContainer.innerHTML = html;

    } catch (error) {
        console.error("Error loading orders:", error);
        ordersContainer.innerHTML = "<h2 class='error-msg'>Error loading your orders. Please try again later.</h2>";
    }
}

// Track user authentication state
onAuthStateChanged(auth, function(user) {
    if (user) {
        loadOrders(user);
    } else {
        ordersContainer.innerHTML = "<h2 class='error-msg'>Please Login to View Your Orders</h2>";
    }
});