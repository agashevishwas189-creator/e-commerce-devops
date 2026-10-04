// ==============================
// User Registration
// ==============================

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const message = document.getElementById("registerMessage");

    try {
        const response = await fetch("http://localhost:8080/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.style.color = "green";
            message.textContent = data.message;

            registerForm.reset();
        } else {
            message.style.color = "red";
            message.textContent = data.message;
        }

    } catch (error) {
        console.error("Registration error:", error);

        message.style.color = "red";
        message.textContent = "Unable to connect to backend.";
    }
});


// ==============================
// User Login
// ==============================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const message = document.getElementById("loginMessage");

    try {
        const response = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.style.color = "green";
            message.textContent = data.message;

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            loginForm.reset();

            console.log("JWT Token:", data.token);
            console.log("User:", data.user);

        } else {
            message.style.color = "red";
            message.textContent = data.message;
        }

    } catch (error) {
        console.error("Login error:", error);

        message.style.color = "red";
        message.textContent = "Unable to connect to backend.";
    }
});


// ==============================
// Load Products
// ==============================

async function loadProducts(search = "") {

    const productContainer =
        document.getElementById("productContainer");

    productContainer.innerHTML = "<p>Loading products...</p>";

    try {

        let url = "http://localhost:8080/api/products";

        if (search.trim() !== "") {
            url += "?search=" + encodeURIComponent(search);
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        productContainer.innerHTML = "";

        if (data.products.length === 0) {
            productContainer.innerHTML =
                "<p>No products found.</p>";
            return;
        }

        data.products.forEach(product => {

            const card = document.createElement("div");

            card.className = "product-card";

            card.innerHTML = `
                <div class="product-image">
                    ${product.emoji}
                </div>

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <strong>₹${Number(product.price).toLocaleString("en-IN")}</strong>

                <br><br>

                <button onclick="addToCart(${product.id}, '${product.name}')">
                    Add to Cart
                </button>
            `;

            productContainer.appendChild(card);
        });

    } catch (error) {

        console.error("Products error:", error);

        productContainer.innerHTML =
            "<p>Unable to load products.</p>";
    }
}


// ==============================
// Search Products
// ==============================

async function searchProducts() {

    const searchValue =
        document.getElementById("searchInput").value;

    loadProducts(searchValue);
}


// ==============================
// Load Products on Page Start
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    loadProducts();

});
