
let history = [];
let roadColors = [];

function addResult(result) {
    history.push({ result: result, roads: [...roadColors] });
    roadColors = [];
    updateTable();
}

function setRoad(type, color) {
    roadColors.push(color);
}

function addRow() {
    updateTable();
}

function countStats(road) {
    let countB = 0, countP = 0;
    for (let i = 0; i < history.length - 1; i++) {
        const r = history[i];
        if (JSON.stringify(r.roads) === JSON.stringify(road)) {
            if (r.result === 'B') countB++;
            else if (r.result === 'P') countP++;
        }
    }
    return [countB, countP];
}

function detectPattern(recent) {
    const pattern = recent.map(r => r.result).join('');
    if (/^P{3,}$/.test(pattern)) return 'มังกร P';
    if (/^B{3,}$/.test(pattern)) return 'มังกร B';
    if (/^(PB){2,}|(BP){2,}/.test(pattern)) return 'ปิงปอง';
    return '-';
}

function updateTable() {
    const table = document.getElementById("historyTable").getElementsByTagName('tbody')[0];
    table.innerHTML = "";

    for (let i = 0; i < history.length; i++) {
        const r = history[i];
        const row = table.insertRow(0);
        row.insertCell(0).innerText = history.length - i;
        row.insertCell(1).innerText = r.result;
        row.insertCell(2).innerHTML = r.roads.map(c => c === 'R' ? '🔴' : '🔵').join('');
        const recent = history.slice(Math.max(0, i - 5), i + 1);
        const pattern = detectPattern(recent);
        row.insertCell(3).innerText = pattern;
        const [countB, countP] = countStats(r.roads);
        row.insertCell(4).innerText = countB;
        row.insertCell(5).innerText = countP;
        let advice = 'พิจารณา';
        if (countB > countP) advice = 'ตาม-B';
        else if (countP > countB) advice = 'ตาม-P';
        row.insertCell(6).innerText = advice;
    }
}
