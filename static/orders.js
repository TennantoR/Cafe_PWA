// ---------- Checkout Page Logic ----------
const CART_KEY = "cafeFiniganCart";

function loadCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// Save the cart array back into localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function removeFromCart(MenuItemID) {
  const cart = loadCart();
  const index = cart.findIndex(entry => entry.MenuItemID === MenuItemID);

  if (index !== -1) {
    // Decrease qty
    cart[index].qty -= 1;

    // Remove completely if 0
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
  }

  saveCart(cart);
}

function updateTotal() {
  const cart = loadCart();
  const newTotal = cart.reduce((sum, item) => sum + item.Price * item.qty, 0);
  totalSpan.textContent = newTotal.toFixed(2);
}

function checkIfCartIsEmpty() {
  const cart = loadCart();

  if (cart.length === 0) {
    rowsBody.innerHTML = "<tr><td colspan='5'>Your cart is empty.</td></tr>";
    form.style.display = "none";
    totalSpan.textContent = "0.00";
  }
}

// Get references to page elements
const rowsBody   = document.getElementById("order-rows");
const totalSpan  = document.getElementById("order-total");
const messageP   = document.getElementById("order-message");
const form       = document.getElementById("order-form");
const nameInput  = document.getElementById("customer-name");
const emailInput = document.getElementById("customer-email");
const timeInput  = document.getElementById("pickup-time");

// Load cart and display it
const cart = loadCart();

if (!cart || cart.length === 0) {
  rowsBody.innerHTML = "<tr><td colspan='5'>Your cart is empty.</td></tr>";
  form.style.display = "none";   // hide form if nothing to order
  totalSpan.textContent = "0.00";
} else {
  document.getElementById("order-button-id").setAttribute("style","visibility:visible");
  let total = 0;

  cart.forEach(item => {
  const subtotal = item.Price * item.qty;
  updateTotal();

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.ItemName}</td>
    <td><button class="remove-btn">Remove</button></td>
    <td>${item.qty}</td>
    <td>$${item.Price.toFixed(2)}</td>
    <td>$${subtotal.toFixed(2)}</td>
  `;

  // Append row
  rowsBody.appendChild(tr);

  // Find the Remove button inside this tr section
  const removeButton = tr.querySelector(".remove-btn");

  removeButton.addEventListener("click", () => {
  // Update cart
  removeFromCart(item.MenuItemID);

  // Recalculate updated cart
  const updatedCart = loadCart();

  // If qty is now 0 → fade out & remove row
  if (!updatedCart.some(x => x.MenuItemID === item.MenuItemID)) {

  tr.classList.add("fade-out");

  setTimeout(() => {
    tr.remove();
    updateTotal();
    checkIfCartIsEmpty();
  }, 300);

  return;
}

  // Otherwise update qty + subtotal
  const updatedItem = updatedCart.find(x => x.MenuItemID === item.MenuItemID);

  // Update quantity text
  tr.children[2].textContent = updatedItem.qty;

  // Update subtotal
  tr.children[4].textContent = "$" + (updatedItem.qty * updatedItem.Price).toFixed(2);

  // Update total
  updateTotal();
  checkIfCartIsEmpty()
});
})};

// When the form is submitted, send the order to Flask
form.addEventListener("submit", event => {
  event.preventDefault();  // stop page reload

  document.getElementById("order-button-id").setAttribute("style","background:rgba(84, 45, 15, 1)");
    setTimeout(() => {
      document.getElementById("order-button-id").setAttribute("style","background:rgb(141, 68, 17)");
    }, 300);

  const orderData = {
    customerName: nameInput.value.trim(),
    customerEmail: emailInput.value.trim(),
    pickupTime: timeInput.value,
    items: loadCart()
  };

  fetch("http://127.0.0.1:5050/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  })
    .then(res => res.json())
    .then(data => {
      // Store name + time so the Thank-You page can read them
      localStorage.setItem("lastOrderName", nameInput.value.trim());
      localStorage.setItem("lastOrderTime", timeInput.value);

      // Clear the cart
      clearCart();

      // Redirect to Thank-You page
      window.location.href = "../templates/thanks.html";
    })
    .catch(() => {
      messageP.textContent = "Could not place order. Is Flask running?";
    });
});