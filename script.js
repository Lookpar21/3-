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
    if (len === 0) return '-';

    const last = recent[len - 1].result;
    const last3 = recent.slice(-3).map(r => r.result);
    const last4 = recent.slice(-4).map(r => r.result);
    const last6 = recent.slice(-6).map(r => r.result);
    const last6Same = last6.every(r => r === last);
    const last2 = last3[1], last1 = last3[2];

    if (last6.length === 6 && last6Same) return `มังกร${last}`;
    if (last3.length === 3 && last3[0] === last3[1] && last3[1] === last3[2]) return 'ไพ่ติด';
    if (last4.length === 4 && last4[0] !== last4[1] && last4[1] !== last4[2] && last4[2] !== last4[3]) return 'ปิงปอง';
    if (last4.join(',') === 'P,P,B,B') return 'ไพ่คู่';
    if (last4.join(',') === 'B,P,P,B') return 'แดง1น้ำเงิน2';
    if (last4.join(',') === 'P,B,B,P') return 'น้ำเงิน1แดง2';
    if (last3.join(',') === 'B,P,B') return 'แดงต่อ';
    if (last3.join(',') === 'P,B,P') return 'น้ำเงินต่อ';
    if (last3.slice(-1)[0] === 'B') return 'เจอแดงลงน้ำเงิน';
    if (last3.slice(-1)[0] === 'P') return 'เจอน้ำเงินลงแดง';

    return '-';
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
    newRow.advice = (newRow.pattern.includes('มังกร') || newRow.pattern === 'ไพ่ติด') ? `ตาม ${currentResult}` : `สวน ${currentResult}`;
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
