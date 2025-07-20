let data = JSON.parse(localStorage.getItem('baccarat_data')) || [];
let currentResult = '', big = '', small = '', cockroach = '';

function addResult(value) {
    currentResult = value;
}
function setEye(type, value) {
    if (type === 'big') big = value;
    if (type === 'small') small = value;
    if (type === 'cockroach') cockroach = value;
}
function analyzePattern(results) {
    const recent = results.filter(r => !r.isSeparator);
    const len = recent.length;
    let pattern = '-';

    if (len >= 6 && recent.slice(-6).every(r => r.result === recent[len - 1].result)) {
        pattern = `มังกร${recent[len - 1].result}`;
    } else if (len >= 3 && recent[len - 1].result === recent[len - 2].result && recent[len - 2].result === recent[len - 3].result) {
        pattern = 'ไพ่ติด';
    } else if (len >= 4 &&
        recent[len - 1].result !== recent[len - 2].result &&
        recent[len - 2].result !== recent[len - 3].result &&
        recent[len - 3].result !== recent[len - 4].result) {
        pattern = 'ปิงปอง';
    }

    return pattern;
}
function countPatternStats(results, patternKey) {
    const match = results.filter(r => !r.isSeparator && r.patternKey === patternKey);
    const p = match.filter(m => m.result === 'P').length;
    const b = match.filter(m => m.result === 'B').length;
    return `P=${p} / B=${b}`;
}
function addRow() {
    if (!currentResult) return;
    const newRow = {
        result: currentResult,
        bigEye: big,
        smallEye: small,
        cockroachEye: cockroach
    };
    newRow.patternKey = `${big},${small},${cockroach}`;
    newRow.pattern = analyzePattern(data);
    newRow.advice = newRow.pattern.includes('มังกร') || newRow.pattern === 'ไพ่ติด' ? `ตาม ${currentResult}` : `สวน ${currentResult}`;
    newRow.stats = countPatternStats(data, newRow.patternKey);
    data.unshift(newRow);
    currentResult = big = small = cockroach = '';
    updateTable();
    localStorage.setItem('baccarat_data', JSON.stringify(data));
}
function addSeparator() {
    const separatorRow = { isSeparator: true };
    data.unshift(separatorRow);
    updateTable();
    localStorage.setItem('baccarat_data', JSON.stringify(data));
}
function updateTable() {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        if (row.isSeparator) {
            tr.innerHTML = `<td colspan="6" style="text-align:center; background:#eee;">--- เปลี่ยนห้อง ---</td>`;
        } else {
            tr.innerHTML = `
                <td>${data.length - index}</td>
                <td>${row.result}</td>
                <td>${row.bigEye || ''}${row.smallEye || ''}${row.cockroachEye || ''}</td>
                <td>${row.pattern}</td>
                <td>${row.advice}</td>
                <td>${row.stats}</td>
            `;
        }
        tbody.appendChild(tr);
    });
}
function resetData() {
    data = [];
    localStorage.removeItem('baccarat_data');
    updateTable();
}
function downloadData() {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'baccarat_data.json';
    a.click();
}
window.onload = updateTable;
