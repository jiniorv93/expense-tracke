// =====================================================
// EXPENSE TRACKER
// The loop:  User does something -> update data -> redraw screen
// =====================================================

// ---------- 1. GRAB ELEMENTS FROM THE PAGE ----------
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const errorText = document.getElementById("error");
const totalText = document.getElementById("total");
const filterSelect = document.getElementById("filter");
const list = document.getElementById("expense-list");
const emptyMsg = document.getElementById("empty-msg");

// ---------- 2. DATA (what the app remembers) ----------
// Each expense looks like:
// { id: 1729300000000, title: "Lunch", amount: 150, category: "Food", date: "2026-10-19" }
let expenses = loadExpenses();

// ---------- 3. SAVE AND LOAD (localStorage) ----------
function loadExpenses() {
  const saved = localStorage.getItem("expenses");
  if (saved) {
    return JSON.parse(saved); // text -> array
  }
  return []; // nothing saved yet
}

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses)); // array -> text
}

// ---------- 4. HELPER: calculate total ----------
function calculateTotal(items) {
  // reduce adds up all the amounts, starting from 0
  return items.reduce(function (sum, item) {
    return sum + item.amount;
  }, 0);
}

// ---------- 5. DRAW THE SCREEN ----------
function renderExpenses() {
  // a) Decide which expenses to show (based on the filter)
  const selected = filterSelect.value;
  let visible = expenses;
  if (selected !== "All") {
    visible = expenses.filter(function (item) {
      return item.category === selected;
    });
  }

  // b) Clear the old list
  list.innerHTML = "";

  // c) Build one <li> for each expense
  visible.forEach(function (item) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "item-info";

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = item.title;

    const meta = document.createElement("span");
    meta.className = "item-meta";
    meta.textContent = item.category + " • " + item.date;

    info.appendChild(title);
    info.appendChild(meta);

    const right = document.createElement("div");
    right.className = "item-right";

    const amount = document.createElement("span");
    amount.className = "item-amount";
    amount.textContent = "₹" + item.amount;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.id = item.id; // remember which expense this button belongs to

    right.appendChild(amount);
    right.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(right);
    list.appendChild(li);
  });

  // d) Show or hide the "no expenses" message
  emptyMsg.style.display = visible.length === 0 ? "block" : "none";

  // e) Update the total (only for what is visible)
  totalText.textContent = "₹" + calculateTotal(visible);
}

// ---------- 6. ADD AN EXPENSE ----------
function addExpense(event) {
  event.preventDefault(); // stop the page from reloading

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  // Validation
  if (title === "") {
    errorText.textContent = "Please enter a title.";
    return;
  }
  if (amount <= 0 || isNaN(amount)) {
    errorText.textContent = "Amount must be greater than 0.";
    return;
  }
  if (date === "") {
    errorText.textContent = "Please choose a date.";
    return;
  }
  errorText.textContent = "";

  // Make the new expense object
  const newExpense = {
    id: Date.now(), // unique number
    title: title,
    amount: amount,
    category: category,
    date: date
  };

  expenses.push(newExpense); // update data
  saveExpenses();            // remember it
  renderExpenses();          // redraw screen

  form.reset();
  setTodayAsDefaultDate();
}

// ---------- 7. DELETE AN EXPENSE ----------
function deleteExpense(event) {
  // Only react if a Delete button was clicked
  if (!event.target.classList.contains("delete-btn")) {
    return;
  }

  const idToDelete = Number(event.target.dataset.id);

  // Keep every expense EXCEPT the one we are deleting
  expenses = expenses.filter(function (item) {
    return item.id !== idToDelete;
  });

  saveExpenses();
  renderExpenses();
}

// ---------- 8. SMALL EXTRA: default date = today ----------
function setTodayAsDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

// ---------- 9. CONNECT EVENTS ----------
form.addEventListener("submit", addExpense);
list.addEventListener("click", deleteExpense);   // one listener handles all Delete buttons
filterSelect.addEventListener("change", renderExpenses);

// ---------- 10. START THE APP ----------
setTodayAsDefaultDate();
renderExpenses();
