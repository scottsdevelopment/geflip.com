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
const minBuyPriceInput = document.querySelector("#min-buy-price");
const maxBuyPriceInput = document.querySelector("#max-buy-price");
const minSellPriceInput = document.querySelector("#min-sell-price");
const maxSellPriceInput = document.querySelector("#max-sell-price");
const minProfitInput = document.querySelector("#min-profit");
const minRoiInput = document.querySelector("#min-roi");
const limitFilterInput = document.querySelector("#limit-filter");
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
  const minVolume = minVolumeInput.value.trim() ? parseInt(minVolumeInput.value) : null;
  const minBuyPrice = minBuyPriceInput.value.trim() ? parseInt(minBuyPriceInput.value) : null;
  const maxBuyPrice = maxBuyPriceInput.value.trim() ? parseInt(maxBuyPriceInput.value) : null;
  const minSellPrice = minSellPriceInput.value.trim() ? parseInt(minSellPriceInput.value) : null;
  const maxSellPrice = maxSellPriceInput.value.trim() ? parseInt(maxSellPriceInput.value) : null;
  const minProfit = minProfitInput.value.trim() ? parseInt(minProfitInput.value) : null;
  const minRoi = minRoiInput.value.trim() ? parseFloat(minRoiInput.value) : null;
  const limitFilter = limitFilterInput.value.trim() ? parseInt(limitFilterInput.value) : null;
  const searchQuery = searchBar.value.trim().toLowerCase();

  let items = allItems
    .filter((i) => (!f2pOnly ? true : !i.members))
    .filter((i) => minVolume === null || i.volume >= minVolume)
    .filter((i) => minBuyPrice === null || i.low >= minBuyPrice)
    .filter((i) => maxBuyPrice === null || i.low <= maxBuyPrice)
    .filter((i) => minSellPrice === null || i.high >= minSellPrice)
    .filter((i) => maxSellPrice === null || i.high <= maxSellPrice)
    .filter((i) => minProfit === null || i.profit >= minProfit)
    .filter((i) => minRoi === null || i.roi >= minRoi)
    .filter((i) => limitFilter === null || (i.limit !== undefined && i.limit >= limitFilter))
    .filter((i) => !searchQuery || i.name.toLowerCase().includes(searchQuery));

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
minBuyPriceInput.addEventListener("input", renderTable);
maxBuyPriceInput.addEventListener("input", renderTable);
minSellPriceInput.addEventListener("input", renderTable);
maxSellPriceInput.addEventListener("input", renderTable);
minProfitInput.addEventListener("input", renderTable);
minRoiInput.addEventListener("input", renderTable);
limitFilterInput.addEventListener("input", renderTable);
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

const resultStartingCapital = document.querySelector("#result-starting-capital");
const resultItemPrice = document.querySelector("#result-item-price");
const resultAlchValue = document.querySelector("#result-alch-value");
const resultQuantity = document.querySelector("#result-quantity");
const resultCost = document.querySelector("#result-cost");
const resultLeftover = document.querySelector("#result-leftover");
const resultProfit = document.querySelector("#result-profit");
const resultEnding = document.querySelector("#result-ending");
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

  // Display results (in same order as log)
  resultStartingCapital.textContent = startingCapital.toLocaleString();
  resultItemPrice.textContent = itemPrice.toLocaleString();
  resultAlchValue.textContent = alchValue.toLocaleString();
  resultQuantity.textContent = quantity.toLocaleString();
  resultCost.textContent = costPaid.toLocaleString();
  resultLeftover.textContent = leftoverCapital.toLocaleString();
  resultProfit.textContent = profit.toLocaleString();
  resultProfit.className = profit >= 0 ? "value-positive" : "value-negative";
  resultEnding.textContent = endingCapital.toLocaleString();

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

// 🧪 Decanting Calculator functionality
const decantTableBody = document.querySelector("#decant-table tbody");
const decantRefreshBtn = document.querySelector("#decant-refresh-btn");
const decantMinVolumeInput = document.querySelector("#decant-min-volume");
const decantSearchBar = document.querySelector("#decant-search-bar");
const decantHeaders = document.querySelectorAll("#decant-table th[data-sort]");

let allDecantData = [];
let decantCurrentSort = { key: "profitPerDecant1", direction: "desc" };

// Extract base potion name and dose from item name
function parsePotionName(name) {
  const match = name.match(/^(.+?)\s*\((\d+)\)$/);
  if (match) {
    return {
      baseName: match[1].trim(),
      dose: parseInt(match[2])
    };
  }
  return null;
}

// Group potions by base name
function groupPotionsByBase(items) {
  const potionGroups = {};
  
  for (const item of items) {
    const parsed = parsePotionName(item.name);
    if (!parsed || parsed.dose < 1 || parsed.dose > 4) continue;
    
    if (!potionGroups[parsed.baseName]) {
      potionGroups[parsed.baseName] = {};
    }
    
    potionGroups[parsed.baseName][parsed.dose] = {
      id: item.id,
      name: item.name,
      low: item.low,
      high: item.high,
      volume: item.volume,
      dose: parsed.dose
    };
  }
  
  // Only return groups that have a 4-dose potion
  const validGroups = {};
  for (const [baseName, doses] of Object.entries(potionGroups)) {
    if (doses[4]) {
      validGroups[baseName] = doses;
    }
  }
  
  return validGroups;
}

// Calculate decanting profit
// Formula: (selling price of 4-dose * number of 4-dose potions) - (buying price of lower-dose * number of lower-dose potions)
// Empty vials are counted (they have value)
function calculateDecantProfit(lowerDose, higherDose, numLowerDose) {
  if (!lowerDose || !higherDose) return null;
  
  // Calculate how many 4-dose potions we get based on total doses
  // 12 (1)'s = 12 doses → 3 (4)'s
  // 6 (2)'s = 12 doses → 3 (4)'s  
  // 4 (3)'s = 12 doses → 3 (4)'s
  const totalDoses = numLowerDose * lowerDose.dose;
  const numHigherDose = Math.floor(totalDoses / 4);
  
  if (numHigherDose === 0) return null;
  
  // Calculate costs and revenue
  const buyCost = lowerDose.low * numLowerDose;
  const sellRevenue = higherDose.high * 0.98 * numHigherDose; // 2% GE tax
  const profit = sellRevenue - buyCost;
  
  return {
    profit: Math.round(profit),
    profitPerDecant: Math.round(profit / numHigherDose),
    numLowerDose,
    numHigherDose
  };
}

async function fetchDecantData() {
  decantTableBody.innerHTML = "<tr><td colspan='19'>Loading data...</td></tr>";
  
  try {
    const [latestRes, mappingRes, volumesRes] = await Promise.all([
      fetch(API_LATEST),
      fetch(API_MAPPING),
      fetch(API_VOLUMES),
    ]);
    
    const latest = (await latestRes.json()).data;
    const mapping = await mappingRes.json();
    const volumes = (await volumesRes.json()).data;
    
    // Build items list with prices and volumes
    const items = [];
    for (const item of mapping) {
      const id = item.id;
      const price = latest[id];
      const volume = volumes[id];
      
      if (!price || !price.high || !price.low || !volume) continue;
      
      items.push({
        id,
        name: item.name,
        low: price.low,
        high: price.high,
        volume: volume
      });
    }
    
    // Group potions by base name
    const potionGroups = groupPotionsByBase(items);
    
    // Calculate decanting data for each potion
    const decantResults = [];
    
    for (const [baseName, doses] of Object.entries(potionGroups)) {
      const dose4 = doses[4];
      if (!dose4) continue;
      
      // Calculate cost per charge for all doses
      const costPerCharge1 = doses[1] ? Math.round(doses[1].low / 1) : null;
      const costPerCharge2 = doses[2] ? Math.round(doses[2].low / 2) : null;
      const costPerCharge3 = doses[3] ? Math.round(doses[3].low / 3) : null;
      const costPerCharge4 = Math.round(dose4.low / 4);
      
      // Calculate profits for different decanting scenarios
      // Using standard quantities from wiki: 12 (1)'s, 6 (2)'s, 4 (3)'s → 3 (4)'s
      const profit1to4 = calculateDecantProfit(doses[1], dose4, 12);
      const profit2to4 = calculateDecantProfit(doses[2], dose4, 6);
      const profit3to4 = calculateDecantProfit(doses[3], dose4, 4);
      
      decantResults.push({
        name: baseName,
        volume1: doses[1]?.volume || null,
        volume2: doses[2]?.volume || null,
        volume3: doses[3]?.volume || null,
        volume4: dose4.volume,
        price1: doses[1]?.low || null,
        price2: doses[2]?.low || null,
        price3: doses[3]?.low || null,
        price4: dose4.low,
        high1: doses[1]?.high || null,
        high2: doses[2]?.high || null,
        high3: doses[3]?.high || null,
        high4: dose4.high,
        costPerCharge1,
        costPerCharge2,
        costPerCharge3,
        costPerCharge4,
        profit1to4: profit1to4?.profit || null,
        profit2to4: profit2to4?.profit || null,
        profit3to4: profit3to4?.profit || null,
        profitPerDecant1: profit1to4?.profitPerDecant || null,
        profitPerDecant2: profit2to4?.profitPerDecant || null,
        profitPerDecant3: profit3to4?.profitPerDecant || null,
      });
    }
    
    allDecantData = decantResults;
    renderDecantTable();
  } catch (err) {
    console.error(err);
    decantTableBody.innerHTML = "<tr><td colspan='19'>Error fetching data. Try again later.</td></tr>";
  }
}

function renderDecantTable() {
  const minVolume = decantMinVolumeInput.value.trim() ? parseInt(decantMinVolumeInput.value) : null;
  const searchQuery = decantSearchBar.value.trim().toLowerCase();
  
  let potions = allDecantData
    .filter((p) => minVolume === null || p.volume4 >= minVolume)
    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery));
  
  // Sort
  const { key, direction } = decantCurrentSort;
  potions.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    // Handle null values
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    
    if (typeof aVal === "string") {
      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return direction === "asc" ? aVal - bVal : bVal - aVal;
  });
  
  decantTableBody.innerHTML = "";
  
  for (const potion of potions) {
    const row = document.createElement("tr");
    
    const formatValue = (val) => {
      if (val === null) return "-";
      return val.toLocaleString();
    };
    
    const formatProfit = (val) => {
      if (val === null) return "-";
      const profitClass = val >= 0 ? "value-positive" : "value-negative";
      return `<span class="${profitClass}">${val.toLocaleString()}</span>`;
    };
    
    row.innerHTML = `
      <td>
        <img class="item-icon" src="${getItemImageUrl(potion.name + " (4)")}" onerror="this.style.display='none'" />
        ${potion.name}
      </td>
      <td>${formatValue(potion.volume1)}</td>
      <td>${formatValue(potion.volume2)}</td>
      <td>${formatValue(potion.volume3)}</td>
      <td>${formatValue(potion.volume4)}</td>
      <td>${formatValue(potion.price1)}</td>
      <td>${formatValue(potion.price2)}</td>
      <td>${formatValue(potion.price3)}</td>
      <td>${formatValue(potion.price4)}</td>
      <td>${formatValue(potion.costPerCharge1)}</td>
      <td>${formatValue(potion.costPerCharge2)}</td>
      <td>${formatValue(potion.costPerCharge3)}</td>
      <td>${formatValue(potion.costPerCharge4)}</td>
      <td>${formatProfit(potion.profit1to4)}</td>
      <td>${formatProfit(potion.profit2to4)}</td>
      <td>${formatProfit(potion.profit3to4)}</td>
      <td>${formatProfit(potion.profitPerDecant1)}</td>
      <td>${formatProfit(potion.profitPerDecant2)}</td>
      <td>${formatProfit(potion.profitPerDecant3)}</td>
    `;
    decantTableBody.appendChild(row);
  }
  
  if (potions.length === 0) {
    decantTableBody.innerHTML = "<tr><td colspan='19'>No potions match the current filters.</td></tr>";
  }
}

function handleDecantSort(e) {
  const key = e.target.dataset.sort;
  if (!key) return;
  
  if (decantCurrentSort.key === key) {
    decantCurrentSort.direction = decantCurrentSort.direction === "asc" ? "desc" : "asc";
  } else {
    decantCurrentSort.key = key;
    decantCurrentSort.direction = "desc";
  }
  
  decantHeaders.forEach((h) => h.classList.remove("sorted-asc", "sorted-desc"));
  e.target.classList.add(
    decantCurrentSort.direction === "asc" ? "sorted-asc" : "sorted-desc"
  );
  
  renderDecantTable();
}

// Event listeners for decanting calculator
decantRefreshBtn.addEventListener("click", fetchDecantData);
decantMinVolumeInput.addEventListener("input", renderDecantTable);
decantSearchBar.addEventListener("input", renderDecantTable);
decantHeaders.forEach((h) => h.addEventListener("click", handleDecantSort));

// Initial fetch for decanting data
fetchDecantData();
setInterval(fetchDecantData, 5 * 60 * 1000); // refresh every 5 minutes