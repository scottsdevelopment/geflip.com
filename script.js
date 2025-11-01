const API_BASE = "https://prices.runescape.wiki/api/v1/osrs";
const API_LATEST = `${API_BASE}/latest`;
const API_5M = `${API_BASE}/5m`;
const API_1H = `${API_BASE}/1h`;
const API_MAPPING = `${API_BASE}/mapping`;
const API_VOLUMES = `${API_BASE}/volumes`;

const tableBody = document.querySelector("#flip-table tbody");
const refreshBtn = document.querySelector("#refresh-btn");
const f2pFilterCheckbox = document.querySelector("#f2p-filter");
const showAllCheckbox = document.querySelector("#show-all");
const headers = document.querySelectorAll("th[data-sort]");
const minVolumeInput = document.querySelector("#min-volume");
const searchBar = document.querySelector("#search-bar");

let allItems = [];
let currentSort = { key: "profit", direction: "desc" };

async function fetchData() {
  tableBody.innerHTML = "<tr><td colspan='11'>Loading data...</td></tr>";

  try {
    const [latestRes, mappingRes, fiveMRes, oneHRes, volumesRes] = await Promise.all([
      fetch(API_LATEST),
      fetch(API_MAPPING),
      fetch(API_5M),
      fetch(API_1H),
      fetch(API_VOLUMES),
    ]);

    const latest = (await latestRes.json()).data;
    const mapping = await mappingRes.json();
    const fiveM = (await fiveMRes.json()).data;
    const oneH = (await oneHRes.json()).data;
    const volumes = (await volumesRes.json()).data;

    const results = [];

    for (const item of mapping) {
      const id = item.id;
      const price = latest[id];
      const volume = volumes[id];
      const limit = item.limit;

      if (!price || !price.high || !price.low || !volume) continue;

      const low = price.low;
      const high = price.high;

      const highAfterFee = high * 0.98; // ✅ 2% sell tax only
      const netProfit = highAfterFee - low;
      const roi = (netProfit / low) * 100;

      const avg5m = fiveM[id]?.avgHighPrice || "-";
      const avg1h = oneH[id]?.avgHighPrice || "-";
      
      // Get high alch value from mapping data and calculate margin
      const alchValue = item.highalch || null;
      const alchMargin = alchValue !== null ? alchValue - low : null;

      results.push({
        id,
        name: item.name,
        members: item.members,
        low,
        high,
        profit: Math.round(netProfit),
        roi: parseFloat(roi.toFixed(2)),
        avg5m,
        avg1h,
        volume,
        limit,
        alchValue,
        alchMargin: alchMargin !== null ? Math.round(alchMargin) : null,
      });
    }

    allItems = results;
    renderTable();
  } catch (err) {
    console.error(err);
    tableBody.innerHTML =
      "<tr><td colspan='11'>Error fetching data. Try again later.</td></tr>";
  }
}

function getItemImageUrl(name) {
  const encoded = encodeURIComponent(name.replace(/ /g, "_"));
  return `https://oldschool.runescape.wiki/images/${encoded}_detail.png`;
}

function renderTable() {
  const f2pOnly = f2pFilterCheckbox.checked;
  const showAll = showAllCheckbox.checked;
  const minVolume = parseInt(minVolumeInput.value) || 0;
  const searchQuery = searchBar.value.trim().toLowerCase();

  let items = allItems
    .filter((i) => (!f2pOnly ? true : !i.members))
    .filter((i) => i.volume >= minVolume)
    .filter((i) => i.name.toLowerCase().includes(searchQuery));

  const { key, direction } = currentSort;
  items.sort((a, b) => {
    if (typeof a[key] === "string") {
      return direction === "asc"
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    }
    return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
  });

  const displayItems = showAll ? items : items.slice(0, 50);
  tableBody.innerHTML = "";

  for (const item of displayItems) {
    const row = document.createElement("tr");
    const profitClass = item.profit >= 0 ? "value-positive" : "value-negative";
    const alchValueDisplay = item.alchValue !== null ? item.alchValue.toLocaleString() : "-";
    const alchMarginDisplay = item.alchMargin !== null 
      ? `<span class="${item.alchMargin >= 0 ? 'value-positive' : 'value-negative'}">${item.alchMargin.toLocaleString()}</span>`
      : "-";
    
    row.innerHTML = `
      <td>
        <img class="item-icon" src="${getItemImageUrl(item.name)}" onerror="this.style.display='none'" />
        ${item.name}
      </td>
      <td>${item.low.toLocaleString()}</td>
      <td>${item.high.toLocaleString()}</td>
      <td><span class="${profitClass}">${item.profit.toLocaleString()}</span></td>
      <td>${item.limit !== undefined ? item.limit : "-"}</td>
      <td>${item.roi}%</td>
      <td>${item.volume.toLocaleString()}</td>
      <td>${typeof item.avg5m === "number" ? item.avg5m.toLocaleString() : "-"}</td>
      <td>${typeof item.avg1h === "number" ? item.avg1h.toLocaleString() : "-"}</td>
      <td>${alchValueDisplay}</td>
      <td>${alchMarginDisplay}</td>
    `;
    tableBody.appendChild(row);
  }

  if (displayItems.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='11'>No items match the current filters.</td></tr>";
  }
}

function handleSort(e) {
  const key = e.target.dataset.sort;
  if (!key) return;

  if (currentSort.key === key) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.key = key;
    currentSort.direction = "desc";
  }

  headers.forEach((h) => h.classList.remove("sorted-asc", "sorted-desc"));
  e.target.classList.add(
    currentSort.direction === "asc" ? "sorted-asc" : "sorted-desc"
  );

  renderTable();
}

// 🎯 Event listeners
refreshBtn.addEventListener("click", fetchData);
f2pFilterCheckbox.addEventListener("change", renderTable);
showAllCheckbox.addEventListener("change", renderTable);
minVolumeInput.addEventListener("input", renderTable);
searchBar.addEventListener("input", renderTable);
headers.forEach((h) => h.addEventListener("click", handleSort));

fetchData();
setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 minutes

// 🔄 Tab switching functionality
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetTab = btn.dataset.tab;

    // Update button states
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Update content visibility
    tabContents.forEach((content) => {
      content.classList.remove("active");
      if (content.id === `${targetTab}-tab`) {
        content.classList.add("active");
      }
    });
  });
});

// 🧮 Alchemy Calculator functionality
const startingCapitalInput = document.querySelector("#starting-capital");
const itemPriceInput = document.querySelector("#item-price");
const itemNameInput = document.querySelector("#item-name");
const alchValueInput = document.querySelector("#alch-value");
const quantityInput = document.querySelector("#quantity-input");
const autoUpdateCapitalCheckbox = document.querySelector("#auto-update-capital");
const lookupItemBtn = document.querySelector("#lookup-item-btn");
const calculateBtn = document.querySelector("#calculate-btn");
const clearLogBtn = document.querySelector("#clear-log-btn");

const resultQuantity = document.querySelector("#result-quantity");
const resultCost = document.querySelector("#result-cost");
const resultLeftover = document.querySelector("#result-leftover");
const resultAlchTotal = document.querySelector("#result-alch-total");
const resultEnding = document.querySelector("#result-ending");
const resultProfit = document.querySelector("#result-profit");
const tradeLog = document.querySelector("#trade-log");


// Function to update item price based on alch value
function updatePriceFromAlch() {
  const alchValue = parseFloat(alchValueInput.value) || 0;
  if (alchValue > 500) {
    itemPriceInput.value = alchValue - 500;
  }
}

// Item lookup function
async function lookupItem() {
  const itemName = itemNameInput.value.trim().toLowerCase();
  if (!itemName) {
    alert("Please enter an item name");
    return;
  }

  // Try to find in the items list from API data
  const foundItem = allItems.find(
    (item) => item.name.toLowerCase() === itemName
  );

  if (foundItem) {
    // Get alch value from API data
    if (foundItem.alchValue !== null) {
      alchValueInput.value = foundItem.alchValue;
      updatePriceFromAlch();
      alert(
        `Found item: ${foundItem.name}\nAlch value: ${foundItem.alchValue.toLocaleString()} GP\nPrice set to: ${(foundItem.alchValue - 500).toLocaleString()} GP`
      );
    } else {
      // Update item price with current buy price if no alch value found
      itemPriceInput.value = foundItem.low;
      alert(
        `Found item: ${foundItem.name}\nCurrent buy price: ${foundItem.low.toLocaleString()} GP\nNo alch value available. Please enter the alch value manually.`
      );
    }
  } else {
    // Try partial match
    const partialMatch = allItems.find((item) =>
      item.name.toLowerCase().includes(itemName)
    );
    if (partialMatch) {
      const use = confirm(
        `Did you mean "${partialMatch.name}"?\nCurrent buy price: ${partialMatch.low.toLocaleString()} GP`
      );
      if (use) {
        itemNameInput.value = partialMatch.name;
        if (partialMatch.alchValue !== null) {
          alchValueInput.value = partialMatch.alchValue;
          updatePriceFromAlch();
        } else {
          itemPriceInput.value = partialMatch.low;
        }
      }
    } else {
      alert(
        "Item not found in price data. Please check spelling or enter values manually."
      );
    }
  }
}

// Auto-update price when alch value changes
function handleAlchValueChange() {
  // Always update price when alch value changes
  updatePriceFromAlch();
}

// Calculate alchemy trade
function calculateAlchemyTrade() {
  const startingCapital = parseFloat(startingCapitalInput.value) || 0;
  const itemPrice = parseFloat(itemPriceInput.value) || 0;
  const alchValue = parseFloat(alchValueInput.value) || 0;
  const inputQuantity = quantityInput.value.trim() ? parseFloat(quantityInput.value) : null;

  if (startingCapital <= 0 || itemPrice <= 0 || alchValue <= 0) {
    alert("Please enter valid values for all fields");
    return;
  }

  // Calculate quantity (floor division) - either from input or from capital
  let quantity;
  if (inputQuantity !== null && inputQuantity > 0) {
    // Use specified quantity, but check if capital is sufficient
    const maxQuantity = Math.floor(startingCapital / itemPrice);
    quantity = Math.min(inputQuantity, maxQuantity);
    
    if (inputQuantity > maxQuantity) {
      alert(`Warning: Insufficient capital for ${inputQuantity.toLocaleString()} items. Using maximum quantity of ${quantity.toLocaleString()}.`);
    }
  } else {
    // Calculate quantity normally from capital
    quantity = Math.floor(startingCapital / itemPrice);
  }

  if (quantity === 0) {
    alert("Starting capital is too low to buy even one item");
    return;
  }

  // Calculate cost paid
  const costPaid = quantity * itemPrice;

  // Calculate leftover capital
  const leftoverCapital = startingCapital - costPaid;

  // Calculate total from alching
  const totalFromAlching = quantity * alchValue;

  // Calculate ending capital
  const endingCapital = totalFromAlching + leftoverCapital;

  // Calculate profit
  const profit = endingCapital - startingCapital;

  // Display results
  resultQuantity.textContent = quantity.toLocaleString();
  resultCost.textContent = costPaid.toLocaleString();
  resultLeftover.textContent = leftoverCapital.toLocaleString();
  resultAlchTotal.textContent = totalFromAlching.toLocaleString();
  resultEnding.textContent = endingCapital.toLocaleString();
  resultProfit.textContent = profit.toLocaleString();
  resultProfit.className = profit >= 0 ? "value-positive" : "value-negative";

  // Log the trade
  const logEntry = document.createElement("div");
  logEntry.className = "log-entry";
  logEntry.innerHTML = `
    <p><strong>Trade #${tradeLog.children.length + 1}</strong></p>
    <p>Starting Capital: ${startingCapital.toLocaleString()} GP</p>
    <p>Item Price: ${itemPrice.toLocaleString()} GP</p>
    <p>Alch Value: ${alchValue.toLocaleString()} GP</p>
    <p>Quantity: ${quantity.toLocaleString()}</p>
    <p>Cost Paid: ${costPaid.toLocaleString()} GP</p>
    <p>Leftover: ${leftoverCapital.toLocaleString()} GP</p>
    <p>Profit: <span class="${profit >= 0 ? 'value-positive' : 'value-negative'}">${profit.toLocaleString()} GP</span></p>
    <p>Ending Capital: ${endingCapital.toLocaleString()} GP</p>
    <hr>
  `;
  tradeLog.appendChild(logEntry);

  // Reset quantity input to blank
  quantityInput.value = "";

  // Update starting capital for next run (only if checkbox is enabled)
  if (autoUpdateCapitalCheckbox.checked) {
    startingCapitalInput.value = endingCapital;
  }
}

// Event listeners for calculator
lookupItemBtn.addEventListener("click", lookupItem);
calculateBtn.addEventListener("click", calculateAlchemyTrade);
clearLogBtn.addEventListener("click", () => {
  tradeLog.innerHTML = "";
});

// Auto-update price when alch value changes
alchValueInput.addEventListener("input", handleAlchValueChange);

// Auto-lookup when item name changes (with debounce)
let itemNameTimeout;
itemNameInput.addEventListener("input", () => {
  clearTimeout(itemNameTimeout);
  itemNameTimeout = setTimeout(() => {
    const itemName = itemNameInput.value.trim().toLowerCase();
    if (itemName) {
      // Try exact match in allItems from API data
      const foundItem = allItems.find(
        (item) => item.name.toLowerCase() === itemName
      );
      if (foundItem && foundItem.alchValue !== null) {
        alchValueInput.value = foundItem.alchValue;
        updatePriceFromAlch();
      }
    }
  }, 500); // Wait 500ms after user stops typing
});

// Allow Enter key to trigger calculate
itemPriceInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") calculateAlchemyTrade();
});
alchValueInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") calculateAlchemyTrade();
});
itemNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") lookupItem();
});