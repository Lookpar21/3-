
let history = [];
let current = {result: '', big: '', small: '', cock: ''};

function addResult(value) {
  current.result = value;
  if (current.big && current.small && current.cock) {
    history.unshift({...current});
    current = {result: '', big: '', small: '', cock: ''};
    updateTable();
  }
}

function setBigEye(val) {
  current.big = val;
}

function setSmall(val) {
  current.small = val;
}

function setCockroach(val) {
  current.cock = val;
}

function resetAll() {
  history = [];
  updateTable();
}

function updateTable() {
  const tbody = document.getElementById('historyBody');
  tbody.innerHTML = '';
  const patternCount = {};
  history.forEach((entry, index) => {
    const pattern = entry.big + entry.small + entry.cock;
    patternCount[pattern] = patternCount[pattern] || {B: 0, P: 0};
    patternCount[pattern][entry.result] += 1;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${history.length - index}</td>
      <td>${entry.result}</td>
      <td>${entry.big}${entry.small}${entry.cock}</td>
      <td>-</td>
      <td>-</td>
      <td>B=${patternCount[pattern].B || 0} / P=${patternCount[pattern].P || 0}</td>
    `;
    tbody.appendChild(row);
  });
}
