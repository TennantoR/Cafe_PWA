// ---------- Checkout Page Logic ----------
const CART_KEY = "cafeFiniganCart";

// Load cart
function loadCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Remove all elements from the cart by removing representation
function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// Save the cart array back into localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Remove single item from cart
function removeFromCart(MenuItemID) {
  const cart = loadCart();
  // Finds the index of the menu item within the cart
  const index = cart.findIndex(entry => entry.MenuItemID === MenuItemID);

  // Makes sure valid index
  if (index !== -1) {
    // Decrease quantity of item in cart
    cart[index].qty -= 1;

    // Remove the item completely if 0
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
  }
  // Save new cart items
  saveCart(cart);
}

// Re-callable way to recalculate price total
function updateTotal() {
  const cart = loadCart();
  // Uses reduce on cart array to calculate total price
  const newTotal = cart.reduce((sum, item) => sum + item.Price * item.qty, 0);
  // Inserts new total price into textContext HTML element
  totalSpan.textContent = newTotal.toFixed(2);
}

// Failsafe function, checks if cart is empty
function checkIfCartIsEmpty() {
  const cart = loadCart();

  // Reset cart to show "Your cart is empty" after removing all items
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

// Stops showing form and says "Your cart is empty" when empty
if (!cart || cart.length === 0) {
  rowsBody.innerHTML = "<tr><td colspan='5'>Your cart is empty.</td></tr>";
  form.style.display = "none";   // hide form if nothing to order
  totalSpan.textContent = "0.00";
} else {
  // Only shows order button when items in cart
  document.getElementById("order-button-id").setAttribute("style","visibility:visible");
  let total = 0;
  // Calculate subtotal price
  cart.forEach(item => {
  const subtotal = item.Price * item.qty;
  updateTotal();

  // Adds HTML table element similar to 'add' within menu with an inbuilt remove button
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

  // If qty is 0 - fade out animation and remove row
  if (!updatedCart.some(x => x.MenuItemID === item.MenuItemID)) {

  tr.classList.add("fade-out");

  // Pauses for animation then updates cart values live
  setTimeout(() => {
    tr.remove();
    updateTotal();
    checkIfCartIsEmpty();
  }, 300);

  return;
}

  // Otherwise update qty and subtotal
  const updatedItem = updatedCart.find(x => x.MenuItemID === item.MenuItemID);

  // Update quantity text in required HTML element at table row 3
  tr.children[2].textContent = updatedItem.qty;

  // Update subtotal in required HTML element at table row 5
  tr.children[4].textContent = "$" + (updatedItem.qty * updatedItem.Price).toFixed(2);

  // Update total and failsafe
  updateTotal();
  checkIfCartIsEmpty()
});
})};

// When the form is submitted, send the order to Flask
form.addEventListener("submit", event => {
  event.preventDefault();  // stop page reload
  // Colour-changing animation for button feedback
  document.getElementById("order-button-id").setAttribute("style","background:rgba(84, 45, 15, 1)");
    setTimeout(() => {
      document.getElementById("order-button-id").setAttribute("style","background:rgb(141, 68, 17)");
    }, 300);

  // Collects order data to be sent to database
  const orderData = {
    customerName: nameInput.value.trim(),
    customerEmail: emailInput.value.trim(),
    pickupTime: timeInput.value,
    items: loadCart()
  };

  // Connect to app.py /orders route to relay data
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
    // Flask connection error message
    .catch(() => {
      messageP.textContent = "Could not place order. Is Flask running?";
    });
});