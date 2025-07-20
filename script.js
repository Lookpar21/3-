
let data = [];
let current = { result: '', big: '', small: '', cock: '' };

function addResult(r) {
    current.result = r;
    data.unshift({ ...current });
    analyze();
    render();
    current = { result: '', big: '', small: '', cock: '' };
}

function setRoad(type, val) {
    current[type] = val;
}

function analyze() {
    const patterns = {};
    data.forEach((row, index) => {
        const key = row.big + row.small + row.cock;
        if (!patterns[key]) patterns[key] = { P: 0, B: 0 };
        if (row.result === 'P') patterns[key].P++;
        if (row.result === 'B') patterns[key].B++;
        row.stat = `P=${patterns[key].P}, B=${patterns[key].B}`;
        row.pattern = detectPattern(index);
        row.advice = generateAdvice(patterns[key], row.result);
    });
}

function detectPattern(index) {
    if (index < 2) return '-';
    let p = data[index + 2]?.result;
    let q = data[index + 1]?.result;
    let r = data[index]?.result;
    if (p === q && q === r) return `มังกร ${r}`;
    if (p !== q && q !== r) return 'ปิงปอง';
    if (p === q && r !== q) return 'ไพ่คู่';
    return 'ไพ่ติด';
}

function generateAdvice(stats, current) {
    if (!stats) return '-';
    return stats.P > stats.B ? 'ตาม P' : stats.B > stats.P ? 'ตาม B' : 'พิจารณา';
}

function render() {
    const tbody = document.querySelector('#history tbody');
    tbody.innerHTML = '';
    data.forEach((row, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${data.length - i}</td>
                        <td>${row.result}</td>
                        <td>${row.big}</td>
                        <td>${row.small}</td>
                        <td>${row.cock}</td>
                        <td>${row.pattern}</td>
                        <td>${row.advice}</td>
                        <td>${row.stat}</td>`;
        tbody.appendChild(tr);
    });
}

function resetData() {
    data = [];
    render();
}
