let departmentsCache = [];
let callsCache = [];
let presenceCache = [];
let hardwareCache = [];

const CALL_POLL_INTERVAL = 2000;
const PRESENCE_POLL_INTERVAL = 2000;
const VIEWER_POLL_INTERVAL = 10000;

// ============================================================
// SUMMARY CARDS
// ============================================================

function updateSummaryCards() {

    // ----------------------------
    // Cuộc gọi
    // ----------------------------

    const callsElement =
        document.getElementById("summary-calls");

    const menuCallElement =
        document.getElementById("menu-call-count");

    if (callsElement) {
        callsElement.textContent =
            callsCache.length;
    }

    if (menuCallElement) {
        menuCallElement.textContent =
            callsCache.length;
    }


    // ----------------------------
    // Hiện diện
    // ----------------------------

    const presenceElement =
        document.getElementById("summary-presence");

    if (presenceElement) {
        presenceElement.textContent =
            presenceCache.length;
    }


    // ----------------------------
    // Phòng
    // ----------------------------

    const roomsElement =
        document.getElementById("summary-rooms");

    let roomCount = 0;

    departmentsCache.forEach(department => {

        const endpoints =
            department.endpoints || [];

        const rooms = new Set();

        endpoints.forEach(endpoint => {

            const key =
                `${endpoint.idSegment}|` +
                `${endpoint.idDepartment}|` +
                `${endpoint.room}`;

            rooms.add(key);
        });

        roomCount += rooms.size;
    });

    if (roomsElement) {
        roomsElement.textContent =
            roomCount;
    }


    // ----------------------------
    // Thiết bị
    // ----------------------------

    const devicesElement =
        document.getElementById("summary-devices");

    let deviceCount = 0;

    departmentsCache.forEach(department => {

        deviceCount +=
            (department.endpoints || []).length;
    });

    if (devicesElement) {
        devicesElement.textContent =
            deviceCount;
    }
}

async function loadViewer() {
    const viewer = document.getElementById("viewer");
    const status = document.querySelector(".system-status");

    try {
        const response = await fetch("/api/viewer", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        departmentsCache = await response.json();

        updateSummaryCards();
        renderViewer(departmentsCache);

        status.innerHTML =
            '<span class="status-dot"></span>' +
            '<span>Đang kết nối</span>';
    }
    catch (error) {
        console.error(error);

        viewer.innerHTML =
            '<div class="loading">' +
            'Không thể tải dữ liệu Nurse Call.' +
            '</div>';

        status.innerHTML =
            '<span class="status-dot offline-dot"></span>' +
            '<span>Mất kết nối</span>';
    }
}


async function loadCalls() {
    const callsList = document.getElementById("calls-list");
    const summary = document.getElementById("active-calls-summary");
    const callsStatus = document.getElementById("calls-status");

    try {
        const response = await fetch("/api/calls", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        callsCache = await response.json();

        renderCalls(callsCache);
        updatePresenceIndicators();

        callsStatus.textContent = "Đang hoạt động";
        callsStatus.className = "calls-status online";
    }
    catch (error) {
        console.error(error);

        callsList.innerHTML =
            '<div class="calls-empty calls-error">' +
            'Không thể tải trạng thái cuộc gọi.' +
            '</div>';

        summary.textContent = "Không thể kết nối";

        callsStatus.textContent = "Mất kết nối";
        callsStatus.className = "calls-status offline";
    }
}


async function loadPresence() {
    try {
        const response = await fetch("/api/presence", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        presenceCache = await response.json();

        updateSummaryCards();
        updatePresenceIndicators();
    }
    catch (error) {
        console.error("Presence:", error);
    }
}


function renderCalls(calls) {
    const callsList = document.getElementById("calls-list");
    const summary = document.getElementById("active-calls-summary");

    if (!calls || calls.length === 0) {
        callsList.innerHTML =
            '<div class="calls-empty">' +
            '<span class="calls-empty-icon">✓</span>' +
            '<span>Không có cuộc gọi đang hoạt động</span>' +
            '</div>';

        summary.textContent = "Không có cuộc gọi";
        return;
    }

    summary.textContent =
        `${calls.length} cuộc gọi đang hoạt động`;

    callsList.innerHTML = "";

    calls.forEach(call => {
        callsList.appendChild(createCallCard(call));
    });
}


function createCallCard(call) {
    const card = document.createElement("div");

    const type = getCallType(call.typeOfCall);

    card.className = `call-card ${type.cssClass}`;

    const location = formatCallLocation(call);

    const priorityText =
        call.priority !== null && call.priority !== undefined
            ? `Ưu tiên ${call.priority}`
            : "";

    const callerText = [
        call.callerTextA,
        call.callerTextB
    ]
        .filter(value => value)
        .join(" ");

    card.innerHTML = `
        <div class="call-icon">
            ${type.icon}
        </div>

        <div class="call-main">
            <div class="call-type">
                ${escapeHtml(type.name)}
            </div>

            <div class="call-location">
                ${escapeHtml(location)}
            </div>

            ${callerText
            ? `<div class="call-text">${escapeHtml(callerText)}</div>`
            : ""}
        </div>

        <div class="call-meta">
            ${priorityText
            ? `<span>${escapeHtml(priorityText)}</span>`
            : ""}
        </div>
    `;

    return card;
}


function getCallType(typeOfCall) {
    switch (Number(typeOfCall)) {

        case 3:
            return {
                name: "Room call",
                icon: "🔔",
                cssClass: "call-room"
            };

        case 5:
            return {
                name: "Emergency call",
                icon: "🚨",
                cssClass: "call-emergency"
            };

        case 10:
            return {
                name: "Blue code",
                icon: "🔵",
                cssClass: "call-blue-code"
            };

        default:
            return {
                name: `Call (${typeOfCall ?? "-"})`,
                icon: "🔔",
                cssClass: "call-default"
            };
    }
}


function formatCallLocation(call) {
    let location = "";

    if (call.room !== null && call.room !== undefined) {
        location += `Phòng ${call.room}`;
    }

    if (call.bed !== null && call.bed !== undefined) {
        location += ` · Giường ${call.bed}`;
    }

    if (call.callerExtBed !== null &&
        call.callerExtBed !== undefined &&
        call.callerExtBed > 0) {

        location += ` · Giường phụ ${call.callerExtBed}`;
    }

    return location || "Không xác định vị trí";
}


function renderViewer(departments) {
    const viewer = document.getElementById("viewer");

    if (!departments || departments.length === 0) {
        viewer.innerHTML =
            '<div class="loading">Không có dữ liệu khoa.</div>';
        return;
    }

    viewer.innerHTML = "";

    departments.forEach(department => {
        const section = document.createElement("section");
        section.className = "department";

        const endpoints = department.endpoints || [];
        const rooms = groupRooms(endpoints);

        const header = document.createElement("div");
        header.className = "department-header";

        header.innerHTML = `
            <div>
                <div class="department-name">
                    ${escapeHtml(department.name || "Không xác định")}
                </div>

                <div class="department-short-name">
                    ${escapeHtml(department.shortName || "")}
                </div>
            </div>

            <div class="endpoint-count">
                ${rooms.length} phòng
                ·
                ${endpoints.length} thiết bị
            </div>
        `;

        const grid = document.createElement("div");
        grid.className = "room-grid";

        rooms.forEach(room => {
            const card = createRoomCard(room);
            grid.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(grid);

        viewer.appendChild(section);
    });

    updatePresenceIndicators();
}


function groupRooms(endpoints) {
    const rooms = {};

    endpoints.forEach(endpoint => {
        const key =
            `${endpoint.idSegment}|${endpoint.idDepartment}|${endpoint.room}`;

        if (!rooms[key]) {
            rooms[key] = {
                idSegment: endpoint.idSegment,
                idDepartment: endpoint.idDepartment,
                room: endpoint.room,
                endpoints: []
            };
        }

        rooms[key].endpoints.push(endpoint);
    });

    return Object.values(rooms).sort(
        (a, b) => Number(a.room) - Number(b.room)
    );
}


function createRoomCard(room) {
    const card = document.createElement("div");

    const online = room.endpoints.every(endpoint =>
        endpoint.state === 1 &&
        endpoint.errorCode === 0
    );

    const hasOffline = room.endpoints.some(endpoint =>
        endpoint.state !== 1 ||
        endpoint.errorCode !== 0
    );

    if (hasOffline) {
        card.className = "room-card offline";
    }
    else if (online) {
        card.className = "room-card online";
    }
    else {
        card.className = "room-card";
    }

    const beds = room.endpoints
        .map(endpoint => {
            const stateClass =
                endpoint.state === 1 && endpoint.errorCode === 0
                    ? "bed-online"
                    : "bed-offline";

            return `
                <div class="bed-row"
                    data-segment="${escapeHtml(endpoint.idSegment)}"
                    data-department="${escapeHtml(endpoint.idDepartment)}"
                    data-room="${escapeHtml(endpoint.room)}"
                    data-bed="${escapeHtml(endpoint.bed)}">

                    <span class="bed-status ${stateClass}"></span>

                    <span>
                        Giường ${escapeHtml(endpoint.bed)}
                    </span>

                    <span class="bed-device">
                        ${escapeHtml(endpoint.typeName || "")}
                    </span>

                    <span class="presence-indicator"></span>
                </div>
            `;
        })
        .join("");

    card.innerHTML = `
        <div class="room-card-header">
            <div class="room-number">
                Phòng ${escapeHtml(room.room)}
            </div>

            <div class="room-status">
                ${hasOffline ? "Lỗi" : "OK"}
            </div>
        </div>

        <div class="bed-list">
            ${beds}
        </div>
    `;

    card.addEventListener("click", () => {
        showRoomDetail(room);
    });

    return card;
}


function updatePresenceIndicators() {
    document.querySelectorAll(".bed-row").forEach(row => {

        const room = Number(row.dataset.room);
        const bed = Number(row.dataset.bed);

        const presence = presenceCache.find(item =>
            Number(item.idSegment) === Number(row.dataset.segment) &&
            Number(item.idDepartment) === Number(row.dataset.department) &&
            Number(item.room) === room &&
            Number(item.bed) === bed
        );

        const call = callsCache.find(item =>
            Number(item.idSegment) === Number(row.dataset.segment) &&
            Number(item.idDepartment) === Number(row.dataset.department) &&
            Number(item.room) === room &&
            Number(item.bed) === bed
        );

        const indicator =
            row.querySelector(".presence-indicator");

        if (!indicator)
            return;

        indicator.className = "presence-indicator";

        if (presence) {
            const type = Number(presence.typeOfPresence);

            indicator.classList.add(`presence-${type}`);
            indicator.title = getPresenceName(type);
        }

        if (call) {
            indicator.classList.add("has-call");
            indicator.title =
                `${getCallType(call.typeOfCall).name}`;
        }
    });
}


function getPresenceName(type) {
    switch (type) {
        case 1:
            return "Presence";
        default:
            return `Presence (${type})`;
    }
}

async function loadHardware() {
    try {
        const response = await fetch("/api/hardware", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        hardwareCache = await response.json();

        updateSummaryCards();
    }
    catch (error) {
        console.error("Hardware:", error);
        hardwareCache = [];
    }
}


async function showRoomDetail(room) {
    const existing = document.querySelector(".room-modal");

    if (existing) {
        existing.remove();
    }

    // ============================================================
    // LOAD HARDWARE MỚI NHẤT
    // ============================================================

    let hardware = [];

    try {
        const response = await fetch("/api/hardware", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const allHardware = await response.json();

        hardware = allHardware.filter(item =>
            Number(item.idSegment) === Number(room.idSegment) &&
            Number(item.idDepartment) === Number(room.idDepartment) &&
            Number(item.room) === Number(room.room)
        );
    }
    catch (error) {
        console.error("Room hardware:", error);

        hardware = [];
    }


    // ============================================================
    // ENDPOINT / BED
    // ============================================================

    const endpointRows = room.endpoints
        .map(endpoint => {

            const patientText = [
                endpoint.patientTextA,
                endpoint.patientTextB
            ]
                .filter(value => value)
                .join(" ");

            const endpointOk =
                endpoint.state === 1 &&
                endpoint.errorCode === 0;

            let status = endpointOk
                ? `<span class="detail-status ok">Bình thường</span>`
                : `<span class="detail-status error">Lỗi</span>`;

            if (endpoint.priorityCare) {
                status +=
                    `<span class="priority-badge">Ưu tiên</span>`;
            }

            return `
                <tr>
                    <td>
                        <strong>
                            Giường ${escapeHtml(endpoint.bed)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(endpoint.typeName || "")}
                    </td>

                    <td>
                        ${patientText
                    ? escapeHtml(patientText)
                    : '<span class="muted">Trống</span>'}
                    </td>

                    <td>
                        ${endpoint.terminalConnected === 1
                    ? '<span class="detail-status ok">Connected</span>'
                    : endpoint.terminal
                        ? '<span class="detail-status error">Disconnected</span>'
                        : '<span class="muted">-</span>'}
                    </td>

                    <td>
                        ${status}
                    </td>
                </tr>
            `;
        })
        .join("");


    // ============================================================
    // HARDWARE
    // ============================================================

    const hardwareRows = hardware.length > 0

        ? hardware
            .sort((a, b) =>
                Number(a.position) - Number(b.position)
            )
            .map(item => {

                const hardwareOk =
                    Number(item.errorState) === 0;

                return `
                    <tr>
                        <td>
                            ${escapeHtml(item.position)}
                        </td>

                        <td>
                            ${escapeHtml(item.elementName || "")}
                        </td>

                        <td>
                            ${escapeHtml(item.ipAddr || "")}
                        </td>

                        <td>
                            ${escapeHtml(item.macAddr || "")}
                        </td>

                        <td>
                            ${hardwareOk
                        ? '<span class="detail-status ok">OK</span>'
                        : `<span class="detail-status error">
                                    Error ${escapeHtml(item.errorState)}
                                   </span>`}
                        </td>
                    </tr>
                `;
            })
            .join("")

        : `
            <tr>
                <td colspan="5" class="muted">
                    Không có thông tin phần cứng.
                </td>
            </tr>
        `;


    // ============================================================
    // MODAL
    // ============================================================

    const modal = document.createElement("div");

    modal.className = "room-modal";

    modal.innerHTML = `
        <div class="room-modal-backdrop"></div>

        <div class="room-modal-content">

            <div class="room-modal-header">

                <div>
                    <h2>
                        Phòng ${escapeHtml(room.room)}
                    </h2>

                    <div class="room-modal-subtitle">
                        Thông tin phòng và thiết bị
                    </div>
                </div>

                <button
                    class="room-modal-close"
                    type="button">
                    ×
                </button>

            </div>


            <section class="room-detail-section">

                <div class="room-detail-section-title">
                    Giường / Bệnh nhân
                </div>

                <div class="table-wrapper">

                    <table class="endpoint-detail-table">

                        <thead>
                            <tr>
                                <th>Giường</th>
                                <th>Thiết bị</th>
                                <th>Bệnh nhân</th>
                                <th>Terminal</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${endpointRows}
                        </tbody>

                    </table>

                </div>

            </section>


            <section class="room-detail-section">

                <div class="room-detail-section-title">
                    Hardware
                </div>

                <div class="table-wrapper">

                    <table class="endpoint-detail-table">

                        <thead>
                            <tr>
                                <th>Position</th>
                                <th>Thiết bị</th>
                                <th>IP</th>
                                <th>MAC</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${hardwareRows}
                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    `;


    document.body.appendChild(modal);


    // ============================================================
    // CLOSE
    // ============================================================

    modal.querySelector(".room-modal-close")
        .addEventListener("click", () => {
            modal.remove();
        });

    modal.querySelector(".room-modal-backdrop")
        .addEventListener("click", () => {
            modal.remove();
        });
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


async function startPolling() {
    await loadViewer();
    await loadCalls();
    await loadPresence();
    await loadHardware();

    setInterval(loadCalls, CALL_POLL_INTERVAL);
    setInterval(loadPresence, PRESENCE_POLL_INTERVAL);
    setInterval(loadViewer, VIEWER_POLL_INTERVAL);
}


startPolling();