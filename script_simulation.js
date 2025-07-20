
/* Baccarat Tracker - Simulation Mode Added
 * Removed: point, pointType, bet, profit
 * Added: Manual simulation input for result + side roads (🔴🔵🔴) and track outcome stats
 */

let simHistory = [];

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function addSimResult(result, big, sml, ck) {
  const record = { result, big, sml, ck };
  simHistory.push(record);
  renderSimTable();
}

function renderSimTable() {
  const tbody = $("#simTableBody");
  tbody.innerHTML = "";

  let countP = 0, countB = 0;

  simHistory.forEach((r, idx) => {
    if (r.result === "P") countP++;
    if (r.result === "B") countB++;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${idx + 1}</td>
      <td>${r.result}</td>
      <td>${r.big || "-"}</td>
      <td>${r.sml || "-"}</td>
      <td>${r.ck || "-"}</td>
    `;
    tbody.appendChild(row);
  });

  $("#simStats").textContent = `P = ${countP} | B = ${countB}`;
}

function clearSim() {
  simHistory = [];
  renderSimTable();
}

function initSimEvents() {
  $("#simP").addEventListener("click", () => setSimResult("P"));
  $("#simB").addEventListener("click", () => setSimResult("B"));
  $("#simT").addEventListener("click", () => setSimResult("T"));
  $("#simAdd").addEventListener("click", () => {
    const result = currentSim.result;
    const big = currentSim.big;
    const sml = currentSim.sml;
    const ck = currentSim.ck;
    if (!result) {
      alert("เลือกผลก่อน");
      return;
    }
    addSimResult(result, big, sml, ck);
    clearSimInputs();
  });
  $("#simClear").addEventListener("click", clearSim);

  $$(".btn-sim-side").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      const val = btn.dataset.val;
      currentSim[type] = val;
      document.getElementById("simDisp_" + type).textContent = val;
    });
  });
}

let currentSim = { result: null, big: null, sml: null, ck: null };

function setSimResult(val) {
  currentSim.result = val;
  $$(".btn-sim-result").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.result === val);
  });
}

function clearSimInputs() {
  currentSim = { result: null, big: null, sml: null, ck: null };
  $$(".btn-sim-result").forEach(btn => btn.classList.remove("active"));
  $$(".btn-sim-side").forEach(btn => btn.classList.remove("active"));
  $("#simDisp_big").textContent = "-";
  $("#simDisp_sml").textContent = "-";
  $("#simDisp_ck").textContent = "-";
}

// Initialize simulation section on load
window.addEventListener("load", () => {
  initSimEvents();
  renderSimTable();
});
