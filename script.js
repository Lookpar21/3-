let data = [];
let current = { result: null, big: null, sml: null, ck: null };

function setResult(val) { current.result = val; }
function setRoad(key, val) { current[key] = val; }

function addRecord() {
  if (!current.result || !current.big || !current.sml || !current.ck) return alert("กรอกข้อมูลให้ครบ");

  const roadKey = current.big + current.sml + current.ck;
  const past = data.filter(d => d.roadKey === roadKey);
  let p = 0, b = 0;
  past.forEach(d => {
    if (d.result === "P") p++;
    if (d.result === "B") b++;
  });

  const row = {
    result: current.result,
    roadKey,
    mainPattern: detectPattern(),
    advice: getAdvice(current.result, p, b),
    stat: `P=${p} / B=${b}`
  };
  data.unshift(row);
  render();
  current = { result: null, big: null, sml: null, ck: null };
}

function detectPattern() {
  if (data.length < 2) return "-";
  const last = data[0].result;
  const prev = data[1].result;
  if (last === prev) return "ไพ่ติด";
  if (last !== prev) return "ปิงปอง";
  return "-";
}

function getAdvice(result, p, b) {
  if (p > b) return "ตาม P";
  if (b > p) return "ตาม B";
  return "พิจารณา";
}

function render() {
  const tbody = document.querySelector("#history tbody");
  tbody.innerHTML = "";
  data.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${row.result}</td><td>${row.roadKey}</td><td>${row.mainPattern}</td><td>${row.advice}</td><td>${row.stat}</td>`;
    tbody.appendChild(tr);
  });
}

function resetData() {
  if (confirm("ล้างข้อมูลทั้งหมด?")) {
    data = [];
    render();
  }
}

function downloadData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "baccarat_data.json";
  a.click();
  URL.revokeObjectURL(url);
}