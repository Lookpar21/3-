let history = [];
let current = {
  result: '',
  big: '',
  small: '',
  cock: ''
};

function selectResult(res) {
  current.result = res;
}

function setRoad(which, color) {
  current[which] = color;
}

function getPatternType(history, currentResult) {
  const seq = history.map(h => h.result).concat(currentResult).filter(r => r === 'P' || r === 'B');
  if (seq.length < 3) return "-";
  const last = seq[seq.length - 1];
  let streak = 1;
  for (let i = seq.length - 2; i >= 0; i--) {
    if (seq[i] === last) streak++; else break;
  }
  if (streak >= 3) return "มังกร " + last;

  const last4 = seq.slice(-4);
  if (last4.length === 4 && last4[0] !== last4[1] && last4[1] !== last4[2] && last4[2] !== last4[3] &&
      last4[0] === last4[2] && last4[1] === last4[3]) {
    return "ปิงปอง";
  }

  if (seq.slice(-4).join('') === "PPBB" || seq.slice(-4).join('') === "BBPP") return "ไพ่คู่";
  if (seq.length >= 3 && seq[seq.length-1] === seq[seq.length-2] && seq[seq.length-2] !== seq[seq.length-3]) return "ติด2";

  return "-";
}

function getAdvice(pattern, lastResult) {
  if (pattern.startsWith("มังกร")) return "ตาม-" + lastResult;
  if (pattern === "ปิงปอง") return "สวน-" + lastResult;
  if (pattern === "ไพ่คู่") return "สวน-" + lastResult;
  if (pattern === "ติด2") return "ตาม-" + lastResult;
  return "พิจารณา";
}

function addRecord() {
  if (!current.result) {
    alert("เลือกผลก่อน");
    return;
  }
  const pattern = getPatternType(history, current.result);
  const last = history.filter(h => h.result === 'P' || h.result === 'B').slice(-1)[0]?.result || current.result;
  const statB = history.filter(h => h.pattern === pattern && h.result === 'B').length;
  const statP = history.filter(h => h.pattern === pattern && h.result === 'P').length;
  const advice = getAdvice(pattern, last);

  const row = {
    result: current.result,
    big: current.big,
    small: current.small,
    cock: current.cock,
    pattern,
    statB,
    statP,
    advice
  };
  history.unshift(row);
  renderTable();
}

function renderTable() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";
  history.forEach((h, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${history.length - i}</td>
      <td>${h.result}</td>
      <td>${h.big || '-'}${h.small || '-'}${h.cock || '-'}</td>
      <td>${h.pattern}</td>
      <td>${h.statB}</td>
      <td>${h.statP}</td>
      <td>${h.advice}</td>
    `;
    tbody.appendChild(tr);
  });
}
