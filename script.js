/* Baccarat Pro Tracker v3
 * Features:
 * - Button inputs (P/B/T, side roads 🔴/🔵, bet, outcome)
 * - Auto point type & recommendation
 * - Auto main pattern detection (มังกร, ปิงปอง, ไพ่ติด, ไพ่คู่, ตัด2, ตัด3 แบบง่าย)
 * - Side-road recommendation blend
 * - Track profit
 * - Undo last, reset, download, localStorage persistence
 */

let history = [];
let current = {
  result: null,
  p: null,
  b: null,
  big: null,
  sml: null,
  ck: null,
  bet: "ไม่ลง",
  out: "ไม่ลง"
};
const STORAGE_KEY = "baccarat_history_v3";

/* ---------- UTIL DOM ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ---------- POINT CLASSIFICATION ---------- */
function getPointType(p, b) {
  if (p === b) return "เสมอ";
  if (p > b) {
    if (p === 9 && b <= 1) return "ชนะขาด";
    if (p >= 8 && b <= 2) return "ไพ่แน่น";
    if (p <= 4) return "ไพ่หลวม";
    return "กลางๆ";
  } else {
    if (b === 9 && p <= 1) return "แพ้ขาด";
    if (b >= 8 && p <= 2) return "ไพ่แน่น";
    if (b <= 4) return "ไพ่หลวม";
    return "กลางๆ";
  }
}

/* ---------- MAIN PATTERN DETECTION ---------- */
/* Inspect recent results array of P/B only (ignore T) */
function getMainPattern(resultsPB) {
  if (resultsPB.length < 3) return "-";
  const last = resultsPB[resultsPB.length-1];
  const second = resultsPB[resultsPB.length-2];
  const third = resultsPB[resultsPB.length-3];

  // มังกร: 3+ ตาติด
  let streak = 1;
  for (let i = resultsPB.length-2; i >=0; i--) {
    if (resultsPB[i] === last) streak++; else break;
  }
  if (streak >= 3) return "มังกร " + last;

  // ปิงปอง: ล่าสุด 4 สลับขึ้นไป เช่น PBPB
  if (resultsPB.length >= 4) {
    const last4 = resultsPB.slice(-4);
    if (last4[0] !== last4[1] && last4[1] !== last4[2] && last4[2] !== last4[3] &&
        last4[0] === last4[2] && last4[1] === last4[3]) {
      return "ปิงปอง";
    }
  }

  // ไพ่คู่: PPBB / BBPP (ล่าสุด 4)
  if (resultsPB.length >= 4) {
    const last4 = resultsPB.slice(-4).join("");
    if (last4 === "PPBB") return "ไพ่คู่";
    if (last4 === "BBPP") return "ไพ่คู่";
  }

  // ไพ่ติด (2 ตาติด): ล่าสุด 2 เท่ากันแต่ก่อนหน้าไม่เท่า
  if (last === second && last !== third) return "ติด2";

  return "-";
}

/* ---------- SIDE ROADS COMBINED RECOMMEND ---------- */
function recommendFromSide(big, sml, ck) {
  const arr = [big, sml, ck].filter(Boolean);
  if (arr.length === 0) return "พิจารณา";
  const reds = arr.filter(c => c === "🔴").length;
  const blues = arr.filter(c => c === "🔵").length;
  if (blues === arr.length) return "ตาม";
  if (reds === arr.length) return "สวน";
  if (blues > reds) return "ตาม";
  if (reds > blues) return "สวน";
  return "พิจารณา";
}

/* ---------- MERGED FINAL RECOMMENDATION ---------- */
function mergeRecommendation(mainPattern, sideRec, pointType, lastResultPB) {
  // lastResultPB = P/B string of last non-T result
  let mainRec = "พิจารณา";
  if (mainPattern.startsWith("มังกร")) {
    const side = mainPattern.split(" ")[1]; // P or B
    mainRec = "ตาม-"+side;
  } else if (mainPattern === "ปิงปอง") {
    // alternate: choose opposite of last
    mainRec = "สวน-"+lastResultPB;
  } else if (mainPattern === "ไพ่คู่") {
    // oftenตัด: go opposite of last pair
    mainRec = "สวน-"+lastResultPB;
  } else if (mainPattern === "ติด2") {
    mainRec = "ตาม-"+lastResultPB;
  }

  // convert sideRec simple
  let sideRecFull = sideRec;
  if (sideRec === "ตาม") sideRecFull = "ตาม-"+lastResultPB;
  if (sideRec === "สวน") sideRecFull = "สวน-"+lastResultPB;

  // weight: pointType strong?
  let pointBias = "";
  if (["ไพ่แน่น","ชนะขาด"].includes(pointType)) pointBias = "ตาม-"+lastResultPB;
  if (["ไพ่หลวม","แพ้ขาด"].includes(pointType)) pointBias = "สวน-"+lastResultPB;
  if (pointType === "เสมอ") pointBias = "ตาม-"+lastResultPB;

  // tally votes
  const votes = [mainRec, sideRecFull, pointBias].filter(v=>v!=="พิจารณา");
  let follow = 0, against = 0;
  votes.forEach(v=>{
    if (v.startsWith("ตาม-")) follow++;
    else if (v.startsWith("สวน-")) against++;
  });
  if (follow > against) return "ตาม-"+lastResultPB;
  if (against > follow) return "สวน-"+lastResultPB;
  return "พิจารณา";
}

/* ---------- PROFIT CALC ---------- */
function calcCumulativeProfit() {
  let total = 0;
  history.forEach(h=>{
    if (h.bet === "ลง") {
      if (h.betOutcome === "ชนะ") total += 1;
      else if (h.betOutcome === "แพ้") total -= 1;
    }
    h.cum = total;
  });
}

/* ---------- STATS ---------- */
function calcStats() {
  let p=0,b=0,t=0;
  history.forEach(h=>{
    if (h.result==="P") p++;
    else if (h.result==="B") b++;
    else if (h.result==="T") t++;
  });
  return {p,b,t};
}

function renderStats() {
  const {p,b,t} = calcStats();
  $("#statsBox").innerHTML = `
    <span>Player: ${p}</span>
    <span>Banker: ${b}</span>
    <span>Tie: ${t}</span>
  `;
}

/* ---------- TABLE RENDER ---------- */
function updateTable() {
  calcCumulativeProfit();
  const tbody = $("#historyTable");
  tbody.innerHTML = "";

  // ✅ แสดงตาล่าสุดไว้บนสุด
  [...history].reverse().forEach((h, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${history.length - idx}</td>
      <td>${h.result}</td>
      <td>${h.point}</td>
      <td>${h.pointType}</td>
      <td>${h.mainPattern}</td>
      <td>${h.sidePattern}</td>
      <td>${h.finalRec}</td>
      <td>${h.bet}</td>
      <td>${h.betOutcome}</td>
      <td>${h.cum}</td>
    `;
    tbody.appendChild(row);
  });

  renderStats();
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
  } catch(e) { history=[]; }
  updateTable();
}

/* ---------- EVENT HANDLERS ---------- */
function setResult(val){
  current.result = val;
  // highlight active
  $$(".btn-result").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.result===val);
  });
}
function setSide(which,val){
  if (which==="big") { current.big = val; $("#bigEyeDisplay").textContent = val; }
  if (which==="sml") { current.sml = val; $("#smallDisplay").textContent = val; }
  if (which==="ck") { current.ck = val; $("#cockDisplay").textContent = val; }
}
function setBet(val){
  current.bet = val;
  $("#betMark").classList.toggle("active", val==="ลง");
  $("#betSkip").classList.toggle("active", val==="ไม่ลง");
}
function setBetOutcome(val){
  current.out = val;
  $$(".btn-outcome").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.out===val);
  });
}

function addRecord(){
  const p = parseInt($("#pointP").value);
  const b = parseInt($("#pointB").value);
  if (current.result===null || isNaN(p) || isNaN(b)) {
    alert("เลือกผลและกรอกแต้มให้ครบ");
    return;
  }
  // results PB only ignoring T
  const resultsPB = history.filter(h=>h.result==="P"||h.result==="B").map(h=>h.result).concat(current.result==="T"?[]:[current.result]);
  // last PB result
  let lastPB = null;
  for (let i=resultsPB.length-1;i>=0;i--){ if (["P","B"].includes(resultsPB[i])){lastPB=resultsPB[i];break;} }
  if (!lastPB) lastPB = current.result==="T"?"P":current.result; // default

  const mainPattern = getMainPattern(resultsPB);
  const pointType = getPointType(p,b);
  const sideRec = recommendFromSide(current.big,current.sml,current.ck);
  const finalRec = mergeRecommendation(mainPattern, sideRec, pointType, lastPB);

  const sidePattern = [current.big||"-", current.sml||"-", current.ck||"-"].join("/");

  history.push({
    result: current.result,
    point: `${p}-${b}`,
    pointType,
    mainPattern,
    sidePattern,
    finalRec,
    bet: current.bet,
    betOutcome: current.out,
    cum: 0
  });

  updateTable();
  saveLocal();
  clearCurrentInputs();
}

function clearCurrentInputs(){
  current = {result:null,p:null,b:null,big:null,sml:null,ck:null,bet:"ไม่ลง",out:"ไม่ลง"};
  $$(".btn-result").forEach(btn=>btn.classList.remove("active"));
  $$(".btn-side").forEach(btn=>btn.classList.remove("active"));
  $("#bigEyeDisplay").textContent="-";
  $("#smallDisplay").textContent="-";
  $("#cockDisplay").textContent="-";
  setBet("ไม่ลง");
  setBetOutcome("ไม่ลง");
  $("#pointP").value="";
  $("#pointB").value="";
}

function undoLast(){
  if (!history.length) return;
  history.pop();
  updateTable();
  saveLocal();
}

function resetAll(){
  if (!confirm("ล้างข้อมูลทั้งหมด?")) return;
  history=[];
  saveLocal();
  updateTable();
}

/* ---------- DOWNLOAD ---------- */
function downloadHistory(){
  const blob = new Blob([JSON.stringify(history,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url;
  a.download="baccarat_history_v3.json";
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- INIT ---------- */
function initEvents(){
  $$(".btn-result").forEach(btn=>{
    btn.addEventListener("click",()=>setResult(btn.dataset.result));
  });
  $$(".btn-side").forEach(btn=>{
    btn.addEventListener("click",()=>setSide(btn.dataset.side,btn.dataset.val));
  });
  $("#betMark").addEventListener("click",()=>setBet("ลง"));
  $("#betSkip").addEventListener("click",()=>setBet("ไม่ลง"));
  $$(".btn-outcome").forEach(btn=>{
    btn.addEventListener("click",()=>setBetOutcome(btn.dataset.out));
  });
  $("#addRecordBtn").addEventListener("click",addRecord);
  $("#undoBtn").addEventListener("click",undoLast);
  $("#resetBtn").addEventListener("click",resetAll);
  $("#downloadBtn").addEventListener("click",downloadHistory);
}

window.addEventListener("load",()=>{
  initEvents();
  loadLocal();
});
