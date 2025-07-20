let data = [];
let current = { result: '', big: '', small: '', cockroach: '' };

function addResult(r) {
    current.result = r;
}
function addRoad(type, color) {
    current[type] = color;
}
function addEntry() {
    if (!current.result) return;
    const entry = {
        ...current,
        pattern: current.big + current.small + current.cockroach
    };
    data.push(entry);
    updateTable();
    current = { result: '', big: '', small: '', cockroach: '' };
}

function updateTable() {
    const tbody = document.querySelector("#historyTable tbody");
    tbody.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const pattern = row.pattern;
        const countB = data.filter((d, idx) => idx < i && d.pattern === pattern && d.result === 'B').length;
        const countP = data.filter((d, idx) => idx < i && d.pattern === pattern && d.result === 'P').length;

        const tr = document.createElement("tr");
        tr.innerHTML = \`
            <td>\${i + 1}</td>
            <td>\${row.result}</td>
            <td>\${row.big + row.small + row.cockroach}</td>
            <td>-</td>
            <td>\${countB}</td>
            <td>\${countP}</td>
            <td>\${countB > countP ? 'สวน-P' : countP > countB ? 'ตาม-P' : 'พิจารณา'}</td>
        \`;
        tbody.appendChild(tr);
    }
}