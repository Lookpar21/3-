
let history = [];
let patternStats = {};
let current = { result: null, big: null, sml: null, ck: null };

function setResult(r) {
  current.result = r;
}

function setRoad(type, val) {
  current[type] = val;
}

function analyzeMainPattern(history) {
  if (history.length < 3) return "-";
  const last = history[history.length - 1].result;
  const prev = history[history.length - 2].result;
  if (last === prev) return "ไพ่ติด";
  if (history.length >= 4) {
    const last4 = history.slice(-4).map(h => h.result);
    if (last4[0] === last4[2] && last4[1] === last4[3] && last4[0] !== last4[1])
      return "ปิงปอง";
  }
  return "-";
}

function addRecord() {
  if (!current.result || !current.big || !current.sml || !current.ck) {
    alert("กรอกข้อมูลให้ครบ");
    return;
  }

  const patternKey = current.big + current.sml + current.ck;
  if (!patternStats[patternKey]) patternStats[patternKey] = { P: 0, B: 0 };
  patternStats[patternKey][current.result]++;

  const mainPattern = analyzeMainPattern(history);

  const rec = {
    ...current,
    main: mainPattern,
    rec: patternStats[patternKey].P > patternStats[patternKey].B ? "ตาม P" :
         patternStats[patternKey].B > patternStats[patternKey].P ? "ตาม B" : "พิจารณา",
    countP: patternStats[patternKey].P,
    countB: patternStats[patternKey].B
  };

  history.push(rec);
  current = { result: null, big: null, sml: null, ck: null };
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";
  [...history].reverse().forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${history.length - i}</td>
      <td>${r.result}</td>
      <td>${r.big}${r.sml}${r.ck}</td>
      <td>${r.main}</td>
      <td>${r.rec}</td>
      <td>${r.countP}</td>
      <td>${r.countB}</td>
    `;
    tbody.appendChild(tr);
  });
}

function resetData() {
  if (confirm("ล้างข้อมูลทั้งหมด?")) {
    history = [];
    patternStats = {};
    renderTable();
  }
}
