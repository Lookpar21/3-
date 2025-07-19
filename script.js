let history = [];

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

function getRecommendation(type, bigEye, small, cock) {
    const strong = (c) => c === "🔵";
    const weak = (c) => c === "🔴";

    if (["ชนะขาด", "ไพ่แน่น"].includes(type) && (strong(bigEye) || strong(small) || strong(cock))) {
        return "ตาม";
    } else if (["แพ้ขาด", "ไพ่หลวม"].includes(type) && (weak(bigEye) || weak(small) || weak(cock))) {
        return "สวน";
    }
    return "พิจารณา";
}

function getMainPattern(results) {
    if (results.length < 3) return "-";
    let last = results[results.length - 1];
    let second = results[results.length - 2];
    let third = results[results.length - 3];
    if (last === second && second === third) return "มังกร";
    if (last !== second && second !== third && last === third) return "ปิงปอง";
    if (last === second && third !== last) return "ไพ่ติด";
    return "-";
}

function addRecord() {
    const result = document.getElementById("resultInput").value.trim().toUpperCase();
    const p = parseInt(document.getElementById("pointP").value);
    const b = parseInt(document.getElementById("pointB").value);
    const bigEye = document.getElementById("bigEyeInput").value.trim();
    const small = document.getElementById("smallInput").value.trim();
    const cock = document.getElementById("cockInput").value.trim();
    if (!["P","B","T"].includes(result) || isNaN(p) || isNaN(b)) return alert("กรอกผลและแต้มให้ครบ");

    const pointText = `${p}-${b}`;
    const pointType = getPointType(p, b);
    const resultsOnly = history.map(h => h.result);
    const mainPattern = getMainPattern(resultsOnly.concat(result));
    const rec = getRecommendation(pointType, bigEye, small, cock);
    const sidePattern = [bigEye, small, cock].join(",");

    history.push({
        result, point: pointText, type: pointType,
        main: mainPattern, side: sidePattern, rec
    });
    updateTable();
    saveLocal();
}

function updateTable() {
    const tbody = document.getElementById("historyTable");
    tbody.innerHTML = "";
    history.forEach((item, idx) => {
        const row = `<tr><td>${idx + 1}</td><td>${item.result}</td><td>${item.point}</td><td>${item.type}</td><td>${item.main}</td><td>${item.side}</td><td>${item.rec}</td></tr>`;
        tbody.innerHTML += row;
    });
}

function saveLocal() {
    localStorage.setItem("baccarat_history_v2", JSON.stringify(history));
}

function loadLocal() {
    const saved = localStorage.getItem("baccarat_history_v2");
    if (saved) {
        history = JSON.parse(saved);
        updateTable();
    }
}

function downloadHistory() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "baccarat_data_v2.json";
    a.click();
    URL.revokeObjectURL(url);
}

window.onload = loadLocal;
