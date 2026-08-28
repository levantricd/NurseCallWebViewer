async function loadViewer() {
    const viewer = document.getElementById("viewer");

    try {
        const response = await fetch("/api/viewer");

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const text = await response.text();

        renderViewer(text);

        document.querySelector(".system-status").innerHTML =
            '<span class="status-dot"></span><span>Đang kết nối</span>';
    }
    catch (error) {
        console.error(error);

        viewer.innerHTML =
            '<div class="loading">Không thể tải dữ liệu Nurse Call.</div>';

        document.querySelector(".system-status").innerHTML =
            '<span class="status-dot offline-dot"></span>' +
            '<span>Mất kết nối</span>';
    }
}

async function loadHistory() {
    const body = document.getElementById("history-body");
    const status = document.getElementById("history-status");

    try {
        const response = await fetch("/api/history");

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const rows = await response.json();

        renderHistory(rows);

        status.textContent = rows.length + " sự kiện";
    }
    catch (error) {
        console.error(error);

        body.innerHTML =
            '<tr><td colspan="8" class="loading">' +
            'Không thể tải lịch sử.' +
            '</td></tr>';

        status.textContent = "Lỗi";
    }
}

function renderViewer(text) {
    const viewer = document.getElementById("viewer");

    const lines = text
        .split(/\r?\n/)
        .filter(x => x.trim() !== "");

    if (lines.length < 2) {
        viewer.innerHTML =
            '<div class="loading">Không có dữ liệu endpoint.</div>';
        return;
    }

    const headers = lines[0].split("\t");

    const rows = lines.slice(1).map(line => {
        const values = line.split("\t");
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] ?? "";
        });

        return row;
    });

    const departments = {};

    rows.forEach(row => {
        const key = row.idDepartment;

        if (!departments[key]) {
            departments[key] = {
                name: row.DepartmentName,
                rows: []
            };
        }

        departments[key].rows.push(row);
    });

    viewer.innerHTML = "";

    Object.values(departments).forEach(department => {
        const section = document.createElement("section");
        section.className = "department";

        const header = document.createElement("div");
        header.className = "department-header";

        header.innerHTML = `
            <div class="department-name">
                ${escapeHtml(department.name || "Không xác định")}
            </div>

            <div class="endpoint-count">
                ${department.rows.length} thiết bị
            </div>
        `;

        const grid = document.createElement("div");
        grid.className = "endpoint-grid";

        department.rows.forEach(row => {
            const card = document.createElement("div");

            const online =
                row.State === "1" &&
                row.ErrorCode === "0";

            card.className =
                "endpoint" + (online ? "" : " offline");

            card.innerHTML = `
                <div class="room">
                    Phòng ${escapeHtml(row.Room)}
                </div>

                <div class="bed">
                    Giường ${escapeHtml(row.Bed)}
                </div>

                <div class="device">
                    ${escapeHtml(row.TypeName)}
                </div>

                <div class="device">
                    PBX: ${escapeHtml(row.PbxId)}
                </div>
            `;

            grid.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(grid);

        viewer.appendChild(section);
    });
}

function renderHistory(rows) {
    const body = document.getElementById("history-body");

    if (!rows || rows.length === 0) {
        body.innerHTML =
            '<tr><td colspan="8" class="loading">' +
            'Chưa có dữ liệu lịch sử.' +
            '</td></tr>';
        return;
    }

    body.innerHTML = "";

    rows.forEach(row => {
        const tr = document.createElement("tr");

        const start = combineDateTime(
            row.StartDate,
            row.StartTime
        );

        const stop = combineDateTime(
            row.StopDate,
            row.StopTime
        );

        const duration = calculateDuration(start, stop);

        tr.innerHTML = `
            <td>${escapeHtml(start)}</td>
            <td>${escapeHtml(row.idDepartment)}</td>
            <td>${escapeHtml(row.Room)}</td>
            <td>${escapeHtml(row.Bed)}</td>
            <td>${escapeHtml(row.TypeOfCall)}</td>
            <td>${escapeHtml(row.StartTime)}</td>
            <td>${escapeHtml(row.StopTime)}</td>
            <td>${escapeHtml(duration)}</td>
        `;

        body.appendChild(tr);
    });
}

function combineDateTime(date, time) {
    if (!date || !time) {
        return "";
    }

    return date + " " + time;
}

function calculateDuration(start, stop) {
    if (!start || !stop) {
        return "";
    }

    const startDate = new Date(start.replace(" ", "T"));
    const stopDate = new Date(stop.replace(" ", "T"));

    if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(stopDate.getTime())
    ) {
        return "";
    }

    let seconds =
        Math.floor(
            (stopDate.getTime() - startDate.getTime()) / 1000
        );

    if (seconds < 0) {
        return "";
    }

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    if (hours > 0) {
        return `${hours} giờ ${minutes} phút ${seconds} giây`;
    }

    if (minutes > 0) {
        return `${minutes} phút ${seconds} giây`;
    }

    return `${seconds} giây`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadAll() {
    await Promise.all([
        loadViewer(),
        loadHistory()
    ]);
}

loadAll();

setInterval(loadAll, 5000);
