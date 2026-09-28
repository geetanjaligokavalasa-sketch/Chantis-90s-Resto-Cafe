// ======================================================
// HAPPY TUMMY RESTAURANT - MAIN SCRIPT
// ======================================================

// ===============================
// GLOBAL DATA
// ===============================

let cart =
  JSON.parse(localStorage.getItem("cart")) || [];

let newOrders =
  parseInt(localStorage.getItem("newOrders")) || 0;

let ongoingOrders =
  parseInt(localStorage.getItem("ongoingOrders")) || 0;

let completedOrders =
  parseInt(localStorage.getItem("completedOrders")) || 0;

let tables =
  JSON.parse(localStorage.getItem("tables")) || [];


// ======================================================
// MENU QUANTITIES
// ======================================================

let menuQuantities =
  JSON.parse(
    localStorage.getItem("menuQuantities")
  ) || {};


// ======================================================
// PAGE DETECTION
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const currentPage =
      window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    // -------------------------------
    // MENU PAGE
    // -------------------------------

    if (currentPage === "menu.html") {

      setupMenuPage();

    }


    // -------------------------------
    // ORDERS PAGE
    // -------------------------------

    else if (currentPage === "orders.html") {

      setupOrdersPage();

    }


    // -------------------------------
    // TABLES PAGE
    // -------------------------------

    else if (currentPage === "tables.html") {

      setupTablesPage();

    }

  }
);


// ======================================================
// MENU PAGE
// ======================================================

function setupMenuPage() {

  console.log("Menu page loaded");

  /*
   * Make sure menu quantities match
   * the current cart.
   */
  syncMenuQuantitiesWithCart();

  updateAllQuantityDisplays();

  setupMenuButtons();

}


// ======================================================
// CONNECT MENU BUTTONS
// ======================================================

function setupMenuButtons() {

  const menuItems =
    document.querySelectorAll(
      ".menu-item"
    );


  menuItems.forEach(
    function (menuItem) {

      // ------------------------------------------
      // GET ITEM INFORMATION
      // ------------------------------------------

      const name =
        menuItem.dataset.name;

      const price =
        Number(
          menuItem.dataset.price
        );


      if (!name) {

        console.error(
          "Menu item name is missing"
        );

        return;

      }


      // ==================================================
      // IMPORTANT FIX
      // ==================================================
      /*
       * Remove old inline onclick attributes.
       *
       * This prevents the same button from running
       * twice if the old menu.html still contains
       * onclick="changeQuantity(...)"
       *
       * Example:
       *
       * onclick="changeQuantity(...)"
       *
       * is removed automatically here.
       */

      const buttons =
        menuItem.querySelectorAll(
          ".minus-btn, .plus-btn, .add-cart-btn"
        );


      buttons.forEach(
        function (button) {

          button.removeAttribute(
            "onclick"
          );

        }
      );


      // ------------------------------------------
      // MINUS BUTTON
      // ------------------------------------------

      const minusButton =
        menuItem.querySelector(
          ".minus-btn"
        );


      if (minusButton) {

        minusButton.addEventListener(
          "click",
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            changeQuantity(
              name,
              price,
              -1
            );

          }
        );

      }


      // ------------------------------------------
      // PLUS BUTTON
      // ------------------------------------------

      const plusButton =
        menuItem.querySelector(
          ".plus-btn"
        );


      if (plusButton) {

        plusButton.addEventListener(
          "click",
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            changeQuantity(
              name,
              price,
              1
            );

          }
        );

      }


      // ------------------------------------------
      // ADD TO CART BUTTON
      // ------------------------------------------

      const addButton =
        menuItem.querySelector(
          ".add-cart-btn"
        );


      if (addButton) {

        addButton.addEventListener(
          "click",
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            /*
             * One click = exactly ONE item.
             */

            addToCart(
              name,
              price
            );

          }
        );

      }

    }
  );


  console.log(
    "Menu buttons connected successfully"
  );

}


// ======================================================
// FILTER MENU ITEMS
// ======================================================

function filterMenu(category) {

  const items =
    document.querySelectorAll(
      ".menu-item"
    );


  items.forEach(
    function (item) {

      const itemCategory =
        item.dataset.category || "";


      if (
        category.toLowerCase() === "all" ||
        itemCategory.toLowerCase() ===
          category.toLowerCase()
      ) {

        item.style.display =
          "block";

      }

      else {

        item.style.display =
          "none";

      }

    }
  );

}


// ======================================================
// CREATE SAFE QUANTITY ID
// ======================================================

function getQuantityId(name) {

  return (
    "qty-" +
    name
      .replace(
        /[^a-zA-Z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      )
  );

}


// ======================================================
// CHANGE QUANTITY
// ======================================================

function changeQuantity(
  name,
  price,
  change
) {

  // ------------------------------------------
  // FIND ITEM IN CART
  // ------------------------------------------

  let existingItem =
    cart.find(
      function (item) {

        return (
          item.name === name
        );

      }
    );


  // ==================================================
  // PLUS
  // ==================================================

  if (change === 1) {

    // ------------------------------------------
    // ITEM ALREADY EXISTS
    // ------------------------------------------

    if (existingItem) {

      existingItem.quantity =
        (
          Number(
            existingItem.quantity
          ) || 0
        ) + 1;

    }


    // ------------------------------------------
    // NEW ITEM
    // ------------------------------------------

    else {

      cart.push({

        name:
          name,

        price:
          Number(price),

        quantity:
          1

      });

    }

  }


  // ==================================================
  // MINUS
  // ==================================================

  else if (change === -1) {

    if (!existingItem) {

      // Nothing to decrease
      return;

    }


    existingItem.quantity =
      (
        Number(
          existingItem.quantity
        ) || 0
      ) - 1;


    // ------------------------------------------
    // NEVER ALLOW NEGATIVE QUANTITY
    // ------------------------------------------

    if (
      existingItem.quantity <= 0
    ) {

      cart =
        cart.filter(
          function (item) {

            return (
              item.name !== name
            );

          }
        );

    }

  }


  // ==================================================
  // SAVE CART
  // ==================================================

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  // ==================================================
  // UPDATE MENU QUANTITY
  // ==================================================

  syncMenuQuantitiesWithCart();

  updateQuantityDisplay(
    name
  );


  // ==================================================
  // UPDATE CART DISPLAY
  // ==================================================

  updateCart();

}


// ======================================================
// ADD ONE ITEM TO CART
// ======================================================

function addToCart(
  name,
  price
) {

  /*
   * IMPORTANT:
   *
   * Every click on Add to Cart
   * adds exactly ONE item.
   */

  let existingItem =
    cart.find(
      function (item) {

        return (
          item.name === name
        );

      }
    );


  // ------------------------------------------
  // ITEM ALREADY EXISTS
  // ------------------------------------------

  if (existingItem) {

    existingItem.quantity =
      (
        Number(
          existingItem.quantity
        ) || 0
      ) + 1;

  }


  // ------------------------------------------
  // NEW ITEM
  // ------------------------------------------

  else {

    cart.push({

      name:
        name,

      price:
        Number(price),

      quantity:
        1

    });

  }


  // ------------------------------------------
  // SAVE CART
  // ------------------------------------------

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  // ------------------------------------------
  // SYNC MENU QUANTITY
  // ------------------------------------------

  syncMenuQuantitiesWithCart();

  updateQuantityDisplay(
    name
  );


  // ------------------------------------------
  // UPDATE CART
  // ------------------------------------------

  updateCart();

}


// ======================================================
// SYNCHRONIZE MENU WITH CART
// ======================================================

function syncMenuQuantitiesWithCart() {

  /*
   * First reset menu quantities.
   */

  menuQuantities = {};


  /*
   * Then copy quantities from cart.
   */

  cart.forEach(
    function (item) {

      const quantity =
        Number(
          item.quantity
        ) || 0;


      if (quantity > 0) {

        menuQuantities[item.name] =
          quantity;

      }

    }
  );


  localStorage.setItem(
    "menuQuantities",
    JSON.stringify(
      menuQuantities
    )
  );

}


// ======================================================
// UPDATE ONE QUANTITY DISPLAY
// ======================================================

function updateQuantityDisplay(
  name
) {

  const quantityId =
    getQuantityId(
      name
    );


  const quantityElement =
    document.getElementById(
      quantityId
    );


  if (!quantityElement) {

    return;

  }


  const quantity =
    Number(
      menuQuantities[name]
    ) || 0;


  quantityElement.textContent =
    quantity;

}


// ======================================================
// UPDATE ALL QUANTITY DISPLAYS
// ======================================================

function updateAllQuantityDisplays() {

  const quantityElements =
    document.querySelectorAll(
      ".quantity-value"
    );


  quantityElements.forEach(
    function (element) {

      const name =
        element.dataset.name;


      if (!name) {

        return;

      }


      const quantity =
        Number(
          menuQuantities[name]
        ) || 0;


      element.textContent =
        quantity;

    }
  );

}


// ======================================================
// ORDERS PAGE
// ======================================================

function setupOrdersPage() {

  console.log(
    "Orders page loaded"
  );


  updateOrderSummary();

  updateCart();

}


// ======================================================
// UPDATE CART DISPLAY
// ======================================================

function updateCart() {

  const cartContainer =
    document.getElementById(
      "cart-items"
    );


  const totalPriceElement =
    document.getElementById(
      "total-price"
    );


  if (
    !cartContainer ||
    !totalPriceElement
  ) {

    return;

  }


  cartContainer.innerHTML =
    "";


  let total = 0;


  // ==========================================
  // EMPTY CART
  // ==========================================

  if (
    cart.length === 0
  ) {

    cartContainer.innerHTML = `
      <p class="empty-cart">
        Your cart is empty.
      </p>
    `;


    totalPriceElement.textContent =
      "Total: ₹0.00";


    return;

  }


  // ==========================================
  // DISPLAY CART
  // ==========================================

  cart.forEach(
    function (item, index) {

      const quantity =
        Number(
          item.quantity
        ) || 0;


      const price =
        Number(
          item.price
        ) || 0;


      const itemTotal =
        price *
        quantity;


      total +=
        itemTotal;


      const div =
        document.createElement(
          "div"
        );


      div.classList.add(
        "cart-item"
      );


      div.innerHTML = `

        <div class="cart-item-details">

          <strong>
            ${item.name}
          </strong>

          <span>
            × ${quantity}
          </span>

          <span>
            ₹${itemTotal.toFixed(2)}
          </span>

        </div>

        <button
          type="button"
          onclick="removeItem(${index})"
        >
          ❌
        </button>

      `;


      cartContainer.appendChild(
        div
      );

    }
  );


  // ==========================================
  // TOTAL
  // ==========================================

  totalPriceElement.textContent =
    `Total: ₹${total.toFixed(2)}`;

}


// ======================================================
// REMOVE ITEM FROM CART
// ======================================================

function removeItem(index) {

  if (
    index < 0 ||
    index >= cart.length
  ) {

    return;

  }


  const removedItem =
    cart[index];


  cart.splice(
    index,
    1
  );


  // ------------------------------------------
  // SAVE CART
  // ------------------------------------------

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  // ------------------------------------------
  // UPDATE MENU QUANTITIES
  // ------------------------------------------

  if (removedItem) {

    menuQuantities[
      removedItem.name
    ] = 0;


    localStorage.setItem(
      "menuQuantities",
      JSON.stringify(
        menuQuantities
      )
    );

  }


  syncMenuQuantitiesWithCart();

  updateCart();

  updateAllQuantityDisplays();

}


// ======================================================
// PLACE ORDER
// ======================================================

function placeOrder() {

  // ==========================================
  // CHECK CART
  // ==========================================

  if (
    cart.length === 0
  ) {

    alert(
      "Your cart is empty!"
    );

    return;

  }


  // ==========================================
  // CHECK TABLES
  // ==========================================

  if (
    tables.length === 0
  ) {

    alert(
      "No tables available. Please add a table first in the Tables page."
    );

    return;

  }


  // ==========================================
  // CREATE TABLE LIST
  // ==========================================

  let tableNames =
    tables
      .map(
        function (table, index) {

          return (
            `${index + 1}. ${table.name} - ` +
            `${
              table.reserved
                ? "Reserved"
                : "Available"
            }`
          );

        }
      )
      .join("\n");


  // ==========================================
  // ASK TABLE
  // ==========================================

  let choice =
    prompt(
      `Enter the table number for this order:\n\n${tableNames}`
    );


  let tableIndex =
    parseInt(choice) - 1;


  // ==========================================
  // VALIDATE TABLE
  // ==========================================

  if (
    isNaN(tableIndex) ||
    tableIndex < 0 ||
    tableIndex >= tables.length
  ) {

    alert(
      "Invalid table selection!"
    );

    return;

  }


  // ==========================================
  // SELECT TABLE
  // ==========================================

  const selectedTable =
    tables[tableIndex];


  // ==========================================
  // COPY CART
  // ==========================================

  const orderItems =
    cart.map(
      function (item) {

        return {

          name:
            item.name,

          price:
            Number(
              item.price
            ),

          quantity:
            Number(
              item.quantity
            ) || 1

        };

      }
    );


  // ==========================================
  // RESERVE TABLE
  // ==========================================

  selectedTable.reserved =
    true;


  if (
    !Array.isArray(
      selectedTable.orders
    )
  ) {

    selectedTable.orders =
      [];

  }


  // ==========================================
  // ADD ORDER
  // ==========================================

  selectedTable.orders.push(
    orderItems
  );


  // ==========================================
  // NEW ORDER COUNT
  // ==========================================

  newOrders++;


  // ==========================================
  // SAVE
  // ==========================================

  localStorage.setItem(
    "newOrders",
    newOrders
  );


  localStorage.setItem(
    "tables",
    JSON.stringify(
      tables
    )
  );


  // ==========================================
  // CLEAR CART
  // ==========================================

  cart = [];


  localStorage.setItem(
    "cart",
    JSON.stringify(
      cart
    )
  );


  // ==========================================
  // CLEAR MENU QUANTITIES
  // ==========================================

  menuQuantities = {};


  localStorage.setItem(
    "menuQuantities",
    JSON.stringify(
      menuQuantities
    )
  );


  // ==========================================
  // UPDATE
  // ==========================================

  updateOrderSummary();

  updateCart();

  updateTableOrdersDisplay();


  // ==========================================
  // SUCCESS MESSAGE
  // ==========================================

  alert(
    `🎉 Order placed for ${selectedTable.name}!`
  );

}


// ======================================================
// UPDATE ORDER SUMMARY
// ======================================================

function updateOrderSummary() {

  const newOrdersEl =
    document.getElementById(
      "new-orders-count"
    );


  const ongoingOrdersEl =
    document.getElementById(
      "ongoing-orders-count"
    );


  const completedOrdersEl =
    document.getElementById(
      "completed-orders-count"
    );


  if (!newOrdersEl) {

    return;

  }


  newOrdersEl.textContent =
    newOrders;


  if (ongoingOrdersEl) {

    ongoingOrdersEl.textContent =
      ongoingOrders;

  }


  if (completedOrdersEl) {

    completedOrdersEl.textContent =
      completedOrders;

  }

}


// ======================================================
// TABLES PAGE
// ======================================================

function setupTablesPage() {

  console.log(
    "Tables page loaded"
  );


  updateTableList();

  updateTableCounts();

  updateTableOrdersDisplay();

}


// ======================================================
// ADD TABLE
// ======================================================

function addTable() {

  const input =
    document.getElementById(
      "table-name"
    );


  if (!input) {

    return;

  }


  const tableName =
    input.value.trim();


  if (
    tableName === ""
  ) {

    alert(
      "Enter a valid table name"
    );

    return;

  }


  // ==========================================
  // DUPLICATE CHECK
  // ==========================================

  const duplicate =
    tables.some(
      function (table) {

        return (
          table.name.toLowerCase() ===
          tableName.toLowerCase()
        );

      }
    );


  if (duplicate) {

    alert(
      "Table name already exists!"
    );

    return;

  }


  // ==========================================
  // ADD TABLE
  // ==========================================

  tables.push({

    name:
      tableName,

    reserved:
      false,

    orders:
      []

  });


  localStorage.setItem(
    "tables",
    JSON.stringify(
      tables
    )
  );


  input.value =
    "";


  updateTableList();

  updateTableCounts();

}


// ======================================================
// UPDATE TABLE LIST
// ======================================================

function updateTableList() {

  const tableList =
    document.getElementById(
      "table-list"
    );


  if (!tableList) {

    return;

  }


  tableList.innerHTML =
    "";


  tables.forEach(
    function (table, index) {

      const li =
        document.createElement(
          "li"
        );


      li.classList.add(
        "table-item"
      );


      li.innerHTML = `

        <strong>
          ${table.name}
        </strong>

        -

        <span>
          ${
            table.reserved
              ? "Reserved"
              : "Available"
          }
        </span>

        <button
          type="button"
          onclick="removeTable(${index})"
        >
          ❌
        </button>

      `;


      tableList.appendChild(
        li
      );

    }
  );


  updateTableCounts();

  updateTableOrdersDisplay();

}


// ======================================================
// REMOVE TABLE
// ======================================================

function removeTable(index) {

  if (
    index < 0 ||
    index >= tables.length
  ) {

    return;

  }


  tables.splice(
    index,
    1
  );


  localStorage.setItem(
    "tables",
    JSON.stringify(
      tables
    )
  );


  updateTableList();

  updateTableCounts();

}


// ======================================================
// UPDATE TABLE COUNTS
// ======================================================

function updateTableCounts() {

  const total =
    tables.length;


  const reserved =
    tables.filter(
      function (table) {

        return table.reserved;

      }
    ).length;


  const available =
    total -
    reserved;


  const totalEl =
    document.getElementById(
      "total-tables-count"
    );


  const reservedEl =
    document.getElementById(
      "reserved-tables-count"
    );


  const availableEl =
    document.getElementById(
      "available-tables-count"
    );


  if (totalEl) {

    totalEl.textContent =
      total;

  }


  if (reservedEl) {

    reservedEl.textContent =
      reserved;

  }


  if (availableEl) {

    availableEl.textContent =
      available;

  }

}


// ======================================================
// DISPLAY ORDERS ASSIGNED TO TABLES
// ======================================================

function updateTableOrdersDisplay() {

  const list =
    document.getElementById(
      "table-orders-list"
    );


  if (!list) {

    return;

  }


  list.innerHTML =
    "";


  let hasOrders =
    false;


  tables.forEach(
    function (table) {

      if (
        !Array.isArray(
          table.orders
        ) ||
        table.orders.length === 0
      ) {

        return;

      }


      hasOrders =
        true;


      const li =
        document.createElement(
          "li"
        );


      let orderHTML =
        `<strong>${table.name}</strong>`;


      orderHTML +=
        "<ul>";


      table.orders.forEach(
        function (
          orderSet,
          orderIndex
        ) {

          orderHTML +=
            `<li>
              <strong>
                Order ${orderIndex + 1}
              </strong>

              <ul>`;


          let orderTotal =
            0;


          orderSet.forEach(
            function (item) {

              const quantity =
                Number(
                  item.quantity
                ) || 1;


              const price =
                Number(
                  item.price
                ) || 0;


              const itemTotal =
                price *
                quantity;


              orderTotal +=
                itemTotal;


              orderHTML +=
                `<li>
                  ${item.name}
                  × ${quantity}
                  -
                  ₹${itemTotal.toFixed(2)}
                </li>`;

            }
          );


          orderHTML +=
            `<li>
              <strong>
                Order Total:
                ₹${orderTotal.toFixed(2)}
              </strong>
            </li>`;


          orderHTML +=
            `</ul>
            </li>`;

        }
      );


      orderHTML +=
        "</ul>";


      li.innerHTML =
        orderHTML;


      list.appendChild(
        li
      );

    }
  );


  // ==========================================
  // NO ORDERS
  // ==========================================

  if (!hasOrders) {

    list.innerHTML =
      `<li>
        No orders assigned to tables yet.
      </li>`;

  }

}