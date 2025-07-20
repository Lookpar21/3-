/* Baccarat Simulation Tracker
 * Features:
 * - Button inputs for simulated result (P/B/T)
 * - Side road inputs (Big Eye, Small, Cockroach)
 * - Manual entry for actual result summary (e.g. B1, P2)
 * - Focus on pattern training only (no point/score or profit tracking)
 */

let history = [];
let current = {
  result: null,
  big: null,
  sml: null,
  ck: null,
  summary: ""
};

const STORAGE_KEY = "baccarat_simulation_history";

/* ---------- UTIL DOM ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ---------- TABLE RENDER ---------- */
function updateTable() {
  const tbody = $("#historyTable");
  tbody.innerHTML = "";
  history.forEach((h, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${history.length - idx}</td>
      <td>${h.result}</td>
      <td>${[h.big || '-', h.sml || '-', h.ck || '-'].join('/')}</td>
      <td>${h.summary}</td>
    `;
    tbody.prepend(row); // Show newest on top
  });
}

/* ---------- SAVE / LOAD ---------- */
function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
function loadLocal() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    history = JSON.parse(saved) || [];
  } catch (e) { history = []; }
  updateTable();
}

/* ---------- EVENT HANDLERS ---------- */
function setResult(val) {
  current.result = val;
  $$(".btn-result").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.result === val);
  });
}
function setSide(which, val) {
  current[which] = val;
  if (which === "big") $("#bigEyeDisplay").textContent = val;
  if (which === "sml") $("#smallDisplay").textContent = val;
  if (which === "ck") $("#cockDisplay").textContent = val;
}
function setSummary(val) {
  current.summary = val;
}
function addRecord() {
  if (!current.result) {
    alert("กรุณาเลือกผล (P/B/T)");
    return;
  }
  history.push({...current});
  updateTable();
  saveLocal();
  clearCurrentInputs();
}
function clearCurrentInputs() {
  current = { result: null, big: null, sml: null, ck: null, summary: "" };
  $$(".btn-result").forEach(btn => btn.classList.remove("active"));
  $$(".btn-side").forEach(btn => btn.classList.remove("active"));
  $("#bigEyeDisplay").textContent = "-";
  $("#smallDisplay").textContent = "-";
  $("#cockDisplay").textContent = "-";
  $("#summaryInput").value = "";
}
function undoLast() {
  if (!history.length) return;
  history.pop();
  updateTable();
  saveLocal();
}
function resetAll() {
  if (!confirm("ล้างข้อมูลทั้งหมด?")) return;
  history = [];
  saveLocal();
  updateTable();
}
function initEvents() {
  $$(".btn-result").forEach(btn => {
    btn.addEventListener("click", () => setResult(btn.dataset.result));
  });
  $$(".btn-side").forEach(btn => {
    btn.addEventListener("click", () => setSide(btn.dataset.side, btn.dataset.val));
  });
  $("#summaryInput").addEventListener("input", e => setSummary(e.target.value));
  $("#addRecordBtn").addEventListener("click", addRecord);
  $("#undoBtn").addEventListener("click", undoLast);
  $("#resetBtn").addEventListener("click", resetAll);
}

window.addEventListener("load", () => {
  initEvents();
  loadLocal();
});
