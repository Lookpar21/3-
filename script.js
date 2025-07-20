
let history = [];
let current = { result: null, big: null, sml: null, ck: null };

function setResult(res) {
    current.result = res;
}

function setRoad(type, val) {
    current[type] = val;
}

function detectPattern(index) {
    if (index >= 2 && history[index - 1].result === 'P' && history[index - 2].result === 'P') {
        return 'มังกร P';
    }
    return '-';
}

function countStats(currentPattern, currentRoad) {
    let b = 0, p = 0;
    for (let item of history) {
        if (
            item.pattern === currentPattern &&
            item.big === currentRoad.big &&
            item.sml === currentRoad.sml &&
            item.ck === currentRoad.ck
        ) {
            if (item.result === 'B') b++;
            if (item.result === 'P') p++;
        }
    }
    return { b, p };
}

function addResult() {
    const pattern = detectPattern(history.length);
    const stat = countStats(pattern, current);

    let advice = 'พิจารณา';
    if (stat.b > stat.p) advice = 'ตาม-B';
    else if (stat.p > stat.b) advice = 'ตาม-P';

    history.push({ ...current, pattern, statB: stat.b, statP: stat.p, advice });

    render();
    current = { result: null, big: null, sml: null, ck: null };
}

function render() {
    const tbody = document.querySelector('#history tbody');
    tbody.innerHTML = '';
    [...history].reverse().forEach((h, i) => {
        const row = `<tr>
            <td>${history.length - i}</td>
            <td>${h.result}</td>
            <td>${h.big || ''}${h.sml || ''}${h.ck || ''}</td>
            <td>${h.pattern}</td>
            <td>${h.statB}</td>
            <td>${h.statP}</td>
            <td>${h.advice}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}
