
let history = [];
let current = { result: '', big: '', sml: '', ck: '' };

function setResult(val) { current.result = val; }
function setRoad(type, val) { current[type] = val; }

function detectPattern(lastThree) {
  if (lastThree.every(v => v === lastThree[0])) return "มังกร";
  if (lastThree[0] !== lastThree[1] && lastThree[1] !== lastThree[2]) return "ปิงปอง";
  return "-";
}

function addRecord() {
  if (!current.result) return alert("เลือกผลก่อน");

  const lastResults = history.filter(h => h.result === "P" || h.result === "B").map(h => h.result);
  const pattern = detectPattern(lastResults.slice(-2).concat(current.result));
  const key = current.result + current.big + current.sml + current.ck;

  const stats = { B: 0, P: 0 };
  history.forEach(h => {
    const k = h.result + h.big + h.sml + h.ck;
    if (k === key) stats[h.result]++;
  });

  history.unshift({
    ...current,
    pattern,
    statB: stats.B,
    statP: stats.P
  });

  renderTable();
  current = { result: '', big: '', sml: '', ck: '' };
}

function renderTable() {
  const tbody = document.querySelector("#history tbody");
  tbody.innerHTML = "";
  history.forEach((h, i) => {
    const row = `<tr>
      <td>${i + 1}</td>
      <td>${h.result}</td>
      <td>${h.big}</td>
      <td>${h.sml}</td>
      <td>${h.ck}</td>
      <td>${h.pattern}</td>
      <td>${h.statB}</td>
      <td>${h.statP}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function resetAll() {
  if (confirm("ล้างข้อมูลทั้งหมด?")) {
    history = [];
    renderTable();
  }
}
