
/* Modified Baccarat Tracker Simulation */
let history = [];
const STORAGE_KEY = "baccarat_simulator";

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function addSimulatedRecord(result, big, sml, ck) {
  const count = { P: 0, B: 0 };
  history.push({ result, big, sml, ck });
  history.forEach(h => {
    if (h.result === "P") count.P++;
    if (h.result === "B") count.B++;
  });
  updateTable(count.P, count.B);
  saveLocal();
}

function updateTable(pCount, bCount) {
  const tbody = $("#historyTable");
  tbody.innerHTML = "";
  history.forEach((h, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${idx + 1}</td>
      <td>${h.result}</td>
      <td>${h.big}</td>
      <td>${h.sml}</td>
      <td>${h.ck}</td>
      <td>P = ${pCount}, B = ${bCount}</td>
    `;
    tbody.appendChild(row);
  });
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function loadLocal() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    history = JSON.parse(saved) || [];
  } catch (e) {
    history = [];
  }
  const count = { P: 0, B: 0 };
  history.forEach(h => {
    if (h.result === "P") count.P++;
    if (h.result === "B") count.B++;
  });
  updateTable(count.P, count.B);
}

function resetAll() {
  if (!confirm("ล้างข้อมูลทั้งหมด?")) return;
  history = [];
  saveLocal();
  updateTable(0, 0);
}

function initSimButtons() {
  $("#simP").addEventListener("click", () => addSimulatedRecord("P", "🔴", "🔵", "🔴"));
  $("#simB").addEventListener("click", () => addSimulatedRecord("B", "🔴", "🔵", "🔴"));
  $("#resetBtn").addEventListener("click", resetAll);
}

window.addEventListener("load", () => {
  initSimButtons();
  loadLocal();
});
