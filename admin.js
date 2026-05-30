import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app, db } from "./firebase.js";

// ======================
// AUTHENTICATION & LOGOUT
// ======================
const auth = getAuth(app);
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function() {
        await signOut(auth);
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "login.html";
    });
}

// ======================
// FORM INPUTS
// ======================
const nameInput = document.getElementById("name");
const brandInput = document.getElementById("brand");
const priceInput = document.getElementById("price");
const rangeInput = document.getElementById("range");
const statusInput = document.getElementById("status");
const stockInput = document.getElementById("stock");
const ratingInput = document.getElementById("rating");
const reviewsInput = document.getElementById("reviews");
const descriptionInput = document.getElementById("description");
const yearInput = document.getElementById("year");
const mileageInput = document.getElementById("mileage");
const batteryInput = document.getElementById("batterySize");
const chargingInput = document.getElementById("chargingTime");
const topSpeedInput = document.getElementById("topSpeed");
const seatsInput = document.getElementById("seats");
const colorInput = document.getElementById("color");
const imageFile = document.getElementById("imageInput");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const addBtn = document.getElementById("addProduct");
const adminProducts = document.getElementById("adminProducts");

// ======================
// CLOUDINARY CONFIG
// ======================
const CLOUD_NAME = "dkadqbrv1";
const UPLOAD_PRESET = "mystore_upload";

// ======================
// UPLOAD IMAGES
// ======================
async function uploadToCloudinary(files) {
    let uploadedImages = [];
    for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();
            console.log(data);
            if (data.secure_url) {
                uploadedImages.push(data.secure_url);
            }
        } catch (error) {
            console.error("Cloudinary upload error:", error);
        }
    }
    return uploadedImages;
}

// ======================
// LOAD PRODUCTS
// ======================
async function loadProducts() {
    if (!adminProducts) return;
    
    const snapshot = await getDocs(collection(db, "products"));
    let html = "";

    snapshot.forEach(docItem => {
        const item = docItem.data();
        html += `
            <div class="card">
                <img src="${item.images?.[0] || 'https://via.placeholder.com/200'}" width="200">
                <h3>${item.name}</h3>
                <p>Brand: ${item.brand}</p>
                <p>💰 $${item.price}</p>
                <p>🔋 ${item.range}</p>
                <p>Status: ${item.status}</p>
                <p>⭐ ${item.rating} (${item.reviews} reviews)</p>
                <p>${item.description}</p>
                <button class="deleteBtn" data-id="${docItem.id}">Delete</button>
                <button class="editBtn" data-id="${docItem.id}">Edit</button>
            </div>
        `;
    });
    adminProducts.innerHTML = html;
}

// ======================
// IMAGE PREVIEW
// ======================
if (imageFile) {
    imageFile.addEventListener("change", function() {
        imagePreviewContainer.innerHTML = "";
        const files = imageFile.files;

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreviewContainer.innerHTML += `
                    <div class="previewCard">
                        <img src="${e.target.result}" width="120" class="previewImage">
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });
}

// ======================
// ADD PRODUCT
// ======================
if (addBtn) {
    addBtn.addEventListener("click", async function() {
        const files = imageFile.files;
        if (files.length === 0) {
            alert("Select image");
            return;
        }

        const imageUrls = await uploadToCloudinary(files);
        if (imageUrls.length === 0) {
            alert("Upload failed");
            return;
        }

        await addDoc(collection(db, "products"), {
            name: nameInput.value,
            brand: brandInput.value,
            price: Number(priceInput.value),
            range: rangeInput.value,
            chargingTime: chargingInput.value,
            status: statusInput.value,
            rating: Number(ratingInput.value),
            reviews: Number(reviewsInput.value),
            year: Number(yearInput.value),
            stock: Number(stockInput.value),
            mileage: mileageInput.value,
            batterySize: batteryInput.value,
            topSpeed: topSpeedInput.value,
            seats: Number(seatsInput.value),
            color: colorInput.value,
            description: descriptionInput.value,
            images: imageUrls
        });

        alert("Product Added");

        // Clear Inputs
        nameInput.value = "";
        brandInput.value = "";
        priceInput.value = "";
        rangeInput.value = "";
        statusInput.value = "";
        ratingInput.value = "";
        reviewsInput.value = "";
        descriptionInput.value = "";
        yearInput.value = "";
        mileageInput.value = "";
        batteryInput.value = "";
        chargingInput.value = "";
        topSpeedInput.value = "";
        seatsInput.value = "";
        colorInput.value = "";
        stockInput.value = "";
        imageFile.value = "";
        imagePreviewContainer.innerHTML = "";

        loadProducts();
    });
}

// ======================
// DELETE + EDIT
// ======================
if (adminProducts) {
    adminProducts.addEventListener("click", async function(e) {
        // DELETE
        const del = e.target.closest(".deleteBtn");
        if (del) {
            const confirmDelete = confirm("Are you sure you want to delete this car?");
            if (confirmDelete) {
                await deleteDoc(doc(db, "products", del.dataset.id));
                loadProducts();
            }
        }

        // EDIT
        const edit = e.target.closest(".editBtn");
        if (edit) {
            const newName = prompt("New Name");
            if (!newName) return;

            await updateDoc(doc(db, "products", edit.dataset.id), {
                name: newName
            });
            loadProducts();
        }
    });
}

// ======================
// INITIAL LOAD
// ======================
loadProducts();