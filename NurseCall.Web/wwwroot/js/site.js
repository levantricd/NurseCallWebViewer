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

        const departments = await response.json();

        renderViewer(departments);

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
}


function groupRooms(endpoints) {
    const rooms = {};

    endpoints.forEach(endpoint => {
        const key = endpoint.room;

        if (!rooms[key]) {
            rooms[key] = {
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
                <div class="bed-row">
                    <span class="bed-status ${stateClass}"></span>
                    <span>Giường ${escapeHtml(endpoint.bed)}</span>
                    <span class="bed-device">
                        ${escapeHtml(endpoint.typeName || "")}
                    </span>
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


function showRoomDetail(room) {
    const existing = document.querySelector(".room-modal");

    if (existing) {
        existing.remove();
    }

    const modal = document.createElement("div");
    modal.className = "room-modal";

    const endpointRows = room.endpoints
        .map(endpoint => `
            <tr>
                <td>${escapeHtml(endpoint.bed)}</td>
                <td>${escapeHtml(endpoint.typeName || "")}</td>
                <td>${escapeHtml(endpoint.pbxId || "")}</td>
                <td>${escapeHtml(endpoint.mac || "")}</td>
                <td>${endpoint.state === 1 && endpoint.errorCode === 0
                ? "Bình thường"
                : "Lỗi"}</td>
            </tr>
        `)
        .join("");

    modal.innerHTML = `
        <div class="room-modal-backdrop"></div>

        <div class="room-modal-content">
            <div class="room-modal-header">
                <h2>Phòng ${escapeHtml(room.room)}</h2>
                <button class="room-modal-close">×</button>
            </div>

            <table class="endpoint-detail-table">
                <thead>
                    <tr>
                        <th>Giường</th>
                        <th>Thiết bị</th>
                        <th>PBX ID</th>
                        <th>MAC</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>

                <tbody>
                    ${endpointRows}
                </tbody>
            </table>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".room-modal-close")
        .addEventListener("click", () => modal.remove());

    modal.querySelector(".room-modal-backdrop")
        .addEventListener("click", () => modal.remove());
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


loadViewer();