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


// ============================================================
// VIEWER
// ============================================================

async function loadViewer() {

    const viewer =
        document.getElementById("viewer");

    const status =
        document.querySelector(".system-status");

    try {

        const response =
            await fetch("/api/viewer", {
                cache: "no-store"
            });

        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }

        departmentsCache =
            await response.json();

        updateSummaryCards();

        renderViewer(
            departmentsCache
        );

        if (status) {

            status.innerHTML =
                '<span class="status-dot"></span>' +
                '<span>Đang kết nối</span>';
        }

    }
    catch (error) {

        console.error(error);

        if (viewer) {

            viewer.innerHTML =
                '<div class="loading">' +
                'Không thể tải dữ liệu Nurse Call.' +
                '</div>';
        }

        if (status) {

            status.innerHTML =
                '<span class="status-dot offline-dot"></span>' +
                '<span>Mất kết nối</span>';
        }
    }
}


// ============================================================
// ACTIVE CALLS
// ============================================================

async function loadCalls() {

    const callsList =
        document.getElementById("calls-list");

    const summary =
        document.getElementById(
            "active-calls-summary"
        );

    const callsStatus =
        document.getElementById(
            "calls-status"
        );

    try {

        // ========================================================
        // TEST MODE
        // URL: http://localhost:5227/?testcalls=1
        // Không truy cập CODACO trong chế độ này.
        // ========================================================

        const testMode =
            new URLSearchParams(
                window.location.search
            ).get("testcalls") === "1";


        if (testMode) {

            callsCache = [

                {
                    idSegment: 1,
                    idDepartment: 6,
                    room: 306,
                    bed: 1,
                    typeOfCall: 5,
                    orderIndex: 1,
                    priority: 10,
                    callerTextA: "Bệnh nhân cần cấp cứu",
                    callerTextB: "",
                    callerExtBed: 0
                },

                {
                    idSegment: 1,
                    idDepartment: 5,
                    room: 205,
                    bed: 2,
                    typeOfCall: 3,
                    orderIndex: 2,
                    priority: 5,
                    callerTextA: "",
                    callerTextB: "",
                    callerExtBed: 0
                },

                {
                    idSegment: 1,
                    idDepartment: 7,
                    room: 102,
                    bed: 1,
                    typeOfCall: 1,
                    orderIndex: 3,
                    priority: 3,
                    callerTextA: "",
                    callerTextB: "",
                    callerExtBed: 0
                },

                {
                    idSegment: 1,
                    idDepartment: 5,
                    room: 204,
                    bed: 1,
                    typeOfCall: 9,
                    orderIndex: 4,
                    priority: 2,
                    callerTextA: "",
                    callerTextB: "",
                    callerExtBed: 0
                },

                {
                    idSegment: 1,
                    idDepartment: 2,
                    room: 4,
                    bed: 1,
                    typeOfCall: 10,
                    orderIndex: 5,
                    priority: 10,
                    callerTextA: "Code Blue",
                    callerTextB: "",
                    callerExtBed: 0
                }

            ];


            updateSummaryCards();

            renderCalls(
                callsCache
            );

            updatePresenceIndicators();


            if (callsStatus) {

                callsStatus.textContent =
                    "CHẾ ĐỘ THỬ";

                callsStatus.className =
                    "calls-status online";
            }


            return;
        }


        // ========================================================
        // REAL CODACO MODE
        // ========================================================

        const response =
            await fetch("/api/calls", {
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );
        }


        callsCache =
            await response.json();


        updateSummaryCards();

        renderCalls(
            callsCache
        );

        updatePresenceIndicators();


        if (callsStatus) {

            callsStatus.textContent =
                "Đang hoạt động";

            callsStatus.className =
                "calls-status online";
        }

    }
    catch (error) {

        console.error(
            "Calls:",
            error
        );


        if (callsList) {

            callsList.innerHTML =
                '<div class="calls-empty calls-error">' +
                'Không thể tải trạng thái cuộc gọi.' +
                '</div>';
        }


        if (summary) {

            summary.textContent =
                "Không thể kết nối";
        }


        if (callsStatus) {

            callsStatus.textContent =
                "Mất kết nối";

            callsStatus.className =
                "calls-status offline";
        }
    }
}


// ============================================================
// PRESENCE
// ============================================================

async function loadPresence() {

    try {

        const response =
            await fetch("/api/presence", {
                cache: "no-store"
            });

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );
        }

        presenceCache =
            await response.json();

        updateSummaryCards();

        updatePresenceIndicators();

    }
    catch (error) {

        console.error(
            "Presence:",
            error
        );
    }
}


// ============================================================
// RENDER CALLS
// ============================================================

function renderCalls(calls) {

    const callsList =
        document.getElementById(
            "calls-list"
        );

    const summary =
        document.getElementById(
            "active-calls-summary"
        );

    if (!callsList ||
        !summary) {

        return;
    }


    // --------------------------------------------------------
    // Không có cuộc gọi
    // --------------------------------------------------------

    if (!calls ||
        calls.length === 0) {

        callsList.innerHTML =
            '<div class="calls-empty">' +
            '<span class="calls-empty-icon">✓</span>' +
            '<span>' +
            'Không có cuộc gọi đang hoạt động' +
            '</span>' +
            '</div>';

        summary.textContent =
            "Không có cuộc gọi";

        return;
    }


    // --------------------------------------------------------
    // Có cuộc gọi
    // --------------------------------------------------------

    summary.textContent =
        `${calls.length} cuộc gọi đang hoạt động`;

    callsList.innerHTML = "";


    calls.forEach(call => {

        callsList.appendChild(
            createCallCard(call)
        );
    });
}


// ============================================================
// CREATE CALL CARD
// ============================================================

function createCallCard(call) {

    const card =
        document.createElement("div");

    const type =
        getCallType(call.typeOfCall);

    card.className =
        `call-card ${type.cssClass}`;


    // ========================================================
    // Tìm tên khoa
    // ========================================================

    const department =
        departmentsCache.find(
            item =>
                Number(item.idSegment) ===
                Number(call.idSegment) &&

                Number(item.idDepartment) ===
                Number(call.idDepartment)
        );


    const departmentName =
        department?.name ||
        department?.shortName ||
        `Khoa ${call.idDepartment}`;


    // ========================================================
    // Vị trí
    // ========================================================

    const location =
        formatCallLocation(call);


    const fullLocation =
        `${departmentName} · ${location}`;


    // ========================================================
    // Priority
    // ========================================================

    const priorityText =
        call.priority !== null &&
            call.priority !== undefined
            ? `Ưu tiên ${call.priority}`
            : "";


    // ========================================================
    // Caller text
    // ========================================================

    const callerText = [

        call.callerTextA,

        call.callerTextB

    ]
        .filter(value => value)
        .join(" ");


    // ========================================================
    // HTML
    // ========================================================

    card.innerHTML = `

        <div class="call-icon">
            ${type.icon}
        </div>


        <div class="call-main">

            <div class="call-type">
                ${escapeHtml(type.name)}
            </div>


            <div class="call-location">
                ${escapeHtml(fullLocation)}
            </div>


            ${callerText
            ? `
                        <div class="call-text">
                            ${escapeHtml(callerText)}
                        </div>
                      `
            : ""
        }

        </div>


        <div class="call-meta">

            ${priorityText
            ? `
                        <span>
                            ${escapeHtml(priorityText)}
                        </span>
                      `
            : ""
        }

        </div>

    `;


    return card;
}


// ============================================================
// CALL TYPE
// ============================================================

function getCallType(typeOfCall) {

    switch (Number(typeOfCall)) {

        case 1:

            return {
                name: "Gọi điều dưỡng 1",
                icon: "🔔",
                cssClass: "call-nurse"
            };


        case 2:

            return {
                name: "Gọi điều dưỡng 2",
                icon: "🔔",
                cssClass: "call-nurse"
            };


        case 3:

            return {
                name: "Gọi phòng",
                icon: "🔔",
                cssClass: "call-room"
            };


        case 4:

            return {
                name: "Cấp cứu bệnh nhân",
                icon: "🚨",
                cssClass: "call-emergency"
            };


        case 5:

            return {
                name: "Cấp cứu",
                icon: "🚨",
                cssClass: "call-emergency"
            };


        case 6:

            return {
                name: "Gọi điều dưỡng khẩn",
                icon: "🚨",
                cssClass: "call-emergency"
            };


        case 7:

            return {
                name: "Gọi dịch vụ",
                icon: "🔔",
                cssClass: "call-service"
            };


        case 8:

            return {
                name: "Báo động",
                icon: "⚠️",
                cssClass: "call-alarm"
            };


        case 9:

            return {
                name: "Gọi bác sĩ",
                icon: "👨‍⚕️",
                cssClass: "call-doctor"
            };


        case 10:

            return {
                name: "Code Blue",
                icon: "🔵",
                cssClass: "call-blue-code"
            };


        case 24:

            return {
                name: "Ngắt cuộc gọi",
                icon: "✓",
                cssClass: "call-disconnect"
            };


        default:

            return {
                name:
                    `Cuộc gọi (${typeOfCall ?? "-"})`,
                icon: "🔔",
                cssClass: "call-default"
            };
    }
}


// ============================================================
// CALL LOCATION
// ============================================================

function formatCallLocation(call) {

    let location = "";


    if (
        call.room !== null &&
        call.room !== undefined
    ) {

        location +=
            `Phòng ${call.room}`;
    }


    if (
        call.bed !== null &&
        call.bed !== undefined &&
        Number(call.bed) > 0
    ) {

        location +=
            ` · Giường ${call.bed}`;
    }


    if (
        call.callerExtBed !== null &&
        call.callerExtBed !== undefined &&
        Number(call.callerExtBed) > 0
    ) {

        location +=
            ` · Giường phụ ${call.callerExtBed}`;
    }


    return location ||
        "Không xác định vị trí";
}


// ============================================================
// RENDER VIEWER
// ============================================================

function renderViewer(departments) {

    const viewer =
        document.getElementById("viewer");

    if (!viewer) {
        return;
    }


    if (
        !departments ||
        departments.length === 0
    ) {

        viewer.innerHTML =
            '<div class="loading">' +
            'Không có dữ liệu khoa.' +
            '</div>';

        return;
    }


    viewer.innerHTML = "";


    departments.forEach(
        department => {

            const section =
                document.createElement(
                    "section"
                );

            section.className =
                "department";


            const endpoints =
                department.endpoints || [];


            const rooms =
                groupRooms(
                    endpoints
                );


            // ------------------------------------------------
            // Department header
            // ------------------------------------------------

            const header =
                document.createElement(
                    "div"
                );

            header.className =
                "department-header";


            header.innerHTML = `

                <div>

                    <div class="department-name">
                        ${escapeHtml(
                department.name ||
                "Không xác định"
            )
                }
                    </div>


                    <div class="department-short-name">
                        ${escapeHtml(
                    department.shortName ||
                    ""
                )
                }
                    </div>

                </div>


                <div class="endpoint-count">

                    ${rooms.length}
                    phòng

                    ·

                    ${endpoints.length}
                    thiết bị

                </div>

            `;


            // ------------------------------------------------
            // Room grid
            // ------------------------------------------------

            const grid =
                document.createElement(
                    "div"
                );

            grid.className =
                "room-grid";


            rooms.forEach(room => {

                grid.appendChild(
                    createRoomCard(room)
                );

            });


            section.appendChild(
                header
            );

            section.appendChild(
                grid
            );

            viewer.appendChild(
                section
            );
        }
    );


    updatePresenceIndicators();
}


// ============================================================
// GROUP ROOMS
// ============================================================

function groupRooms(endpoints) {

    const rooms = {};


    endpoints.forEach(endpoint => {

        const key =
            `${endpoint.idSegment}|` +
            `${endpoint.idDepartment}|` +
            `${endpoint.room}`;


        if (!rooms[key]) {

            rooms[key] = {

                idSegment:
                    endpoint.idSegment,

                idDepartment:
                    endpoint.idDepartment,

                room:
                    endpoint.room,

                endpoints: []

            };
        }


        rooms[key].endpoints.push(
            endpoint
        );
    });


    return Object
        .values(rooms)
        .sort(
            (a, b) =>
                Number(a.room) -
                Number(b.room)
        );
}


// ============================================================
// CREATE ROOM CARD
// ============================================================

function createRoomCard(room) {

    const card =
        document.createElement("div");


    const online =
        room.endpoints.every(
            endpoint =>
                endpoint.state === 1 &&
                endpoint.errorCode === 0
        );


    const hasOffline =
        room.endpoints.some(
            endpoint =>
                endpoint.state !== 1 ||
                endpoint.errorCode !== 0
        );


    if (hasOffline) {

        card.className =
            "room-card offline";

    }
    else if (online) {

        card.className =
            "room-card online";

    }
    else {

        card.className =
            "room-card";
    }


    const beds =
        room.endpoints
            .map(endpoint => {

                const stateClass =
                    endpoint.state === 1 &&
                        endpoint.errorCode === 0

                        ? "bed-online"

                        : "bed-offline";


                return `

                    <div class="bed-row"

                        data-segment="
                            ${escapeHtml(
                    endpoint.idSegment
                )}
                        "

                        data-department="
                            ${escapeHtml(
                    endpoint.idDepartment
                )}
                        "

                        data-room="
                            ${escapeHtml(
                    endpoint.room
                )}
                        "

                        data-bed="
                            ${escapeHtml(
                    endpoint.bed
                )}
                        ">


                        <span class="
                            bed-status
                            ${stateClass}
                        "></span>


                        <span>
                            Giường
                            ${escapeHtml(
                    endpoint.bed
                )}
                        </span>


                        <span class="bed-device">
                            ${escapeHtml(
                    endpoint.typeName || ""
                )}
                        </span>


                        <span class="
                            presence-indicator
                        "></span>

                    </div>

                `;
            })
            .join("");


    card.innerHTML = `

        <div class="room-card-header">

            <div class="room-number">
                Phòng
                ${escapeHtml(room.room)}
            </div>


            <div class="room-status">
                ${hasOffline
            ? "Lỗi"
            : "OK"
        }
            </div>

        </div>


        <div class="bed-list">

            ${beds}

        </div>

    `;


    card.addEventListener(
        "click",
        () => showRoomDetail(room)
    );


    return card;
}


// ============================================================
// UPDATE PRESENCE / CALL INDICATORS
// ============================================================

function updatePresenceIndicators() {

    document
        .querySelectorAll(".bed-row")
        .forEach(row => {

            const room =
                Number(row.dataset.room);

            const bed =
                Number(row.dataset.bed);


            const presence =
                presenceCache.find(
                    item =>

                        Number(item.idSegment) ===
                        Number(row.dataset.segment)

                        &&

                        Number(item.idDepartment) ===
                        Number(row.dataset.department)

                        &&

                        Number(item.room) ===
                        room

                        &&

                        Number(item.bed) ===
                        bed
                );


            const call =
                callsCache.find(
                    item =>

                        Number(item.idSegment) ===
                        Number(row.dataset.segment)

                        &&

                        Number(item.idDepartment) ===
                        Number(row.dataset.department)

                        &&

                        Number(item.room) ===
                        room

                        &&

                        Number(item.bed) ===
                        bed
                );


            const indicator =
                row.querySelector(
                    ".presence-indicator"
                );


            if (!indicator) {
                return;
            }


            indicator.className =
                "presence-indicator";


            // ------------------------------------------------
            // Presence
            // ------------------------------------------------

            if (presence) {

                const type =
                    Number(
                        presence.typeOfPresence
                    );


                indicator.classList.add(
                    `presence-${type}`
                );


                indicator.title =
                    getPresenceName(type);
            }


            // ------------------------------------------------
            // Call
            // ------------------------------------------------

            if (call) {

                indicator.classList.add(
                    "has-call"
                );


                indicator.title =
                    getCallType(
                        call.typeOfCall
                    ).name;
            }

        });
}


// ============================================================
// PRESENCE NAME
// ============================================================

function getPresenceName(type) {

    switch (Number(type)) {

        case 1:

            return "Điều dưỡng";


        case 2:

            return "Điều dưỡng";


        case 3:

            return "Bác sĩ";


        default:

            return `Hiện diện (${type})`;
    }
}


// ============================================================
// HARDWARE
// ============================================================

async function loadHardware() {

    try {

        const response =
            await fetch("/api/hardware", {
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );
        }


        hardwareCache =
            await response.json();


        updateSummaryCards();

    }
    catch (error) {

        console.error(
            "Hardware:",
            error
        );

        hardwareCache = [];
    }
}


// ============================================================
// ROOM DETAIL
// ============================================================

async function showRoomDetail(room) {

    const existing =
        document.querySelector(
            ".room-modal"
        );


    if (existing) {
        existing.remove();
    }


    // --------------------------------------------------------
    // Load latest hardware
    // --------------------------------------------------------

    let hardware = [];


    try {

        const response =
            await fetch("/api/hardware", {
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );
        }


        const allHardware =
            await response.json();


        hardware =
            allHardware.filter(
                item =>

                    Number(item.idSegment) ===
                    Number(room.idSegment)

                    &&

                    Number(item.idDepartment) ===
                    Number(room.idDepartment)

                    &&

                    Number(item.room) ===
                    Number(room.room)
            );

    }
    catch (error) {

        console.error(
            "Room hardware:",
            error
        );

        hardware = [];
    }


    // --------------------------------------------------------
    // Endpoint / Bed
    // --------------------------------------------------------

    const endpointRows =
        room.endpoints
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


                let status =
                    endpointOk

                        ? `
                            <span class="
                                detail-status ok
                            ">
                                Bình thường
                            </span>
                          `

                        : `
                            <span class="
                                detail-status error
                            ">
                                Lỗi
                            </span>
                          `;


                if (endpoint.priorityCare) {

                    status +=
                        `
                            <span class="
                                priority-badge
                            ">
                                Ưu tiên
                            </span>
                        `;
                }


                return `

                    <div class="detail-row">

                        <span>
                            Giường
                            ${escapeHtml(
                    endpoint.bed
                )}
                        </span>


                        <span>
                            ${escapeHtml(
                    endpoint.typeName || ""
                )}
                        </span>


                        <span>
                            ${escapeHtml(
                    patientText || ""
                )}
                        </span>


                        <span>
                            ${status}
                        </span>

                    </div>

                `;
            })
            .join("");


    // --------------------------------------------------------
    // Hardware rows
    // --------------------------------------------------------

    const hardwareRows =
        hardware
            .map(item => `

                <div class="detail-row">

                    <span>
                        ${escapeHtml(
                item.position ?? "-"
            )}
                    </span>


                    <span>
                        ${escapeHtml(
                item.elementName || ""
            )}
                    </span>


                    <span>
                        ${escapeHtml(
                item.ipAddr || ""
            )}
                    </span>


                    <span>

                        ${Number(
                item.errorState
            ) === 0

                    ? `
                                    <span class="
                                        detail-status ok
                                    ">
                                        Bình thường
                                    </span>
                                  `

                    : `
                                    <span class="
                                        detail-status error
                                    ">
                                        Lỗi
                                    </span>
                                  `
                }

                    </span>

                </div>

            `)
            .join("");


    // --------------------------------------------------------
    // Modal
    // --------------------------------------------------------

    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "room-modal";


    modal.innerHTML = `

        <div class="
            room-modal-backdrop
        "></div>


        <div class="
            room-modal-dialog
        ">


            <div class="
                room-modal-header
            ">


                <div>

                    <h3>
                        Phòng
                        ${escapeHtml(
        room.room
    )}
                    </h3>


                    <p>
                        Chi tiết thiết bị
                        và giường
                    </p>

                </div>


                <button
                    type="button"
                    class="room-modal-close">

                    ×

                </button>

            </div>


            <div class="
                room-modal-body
            ">


                <h4>
                    Endpoint / Giường
                </h4>


                <div class="
                    detail-table
                ">


                    <div class="
                        detail-header
                        detail-row
                    ">

                        <span>
                            Giường
                        </span>

                        <span>
                            Thiết bị
                        </span>

                        <span>
                            Bệnh nhân
                        </span>

                        <span>
                            Trạng thái
                        </span>

                    </div>


                    ${endpointRows ||

        `
                            <div class="
                                detail-empty
                            ">
                                Không có dữ liệu
                            </div>
                        `
        }

                </div>


                <h4>
                    Hardware
                </h4>


                <div class="
                    detail-table
                ">


                    <div class="
                        detail-header
                        detail-row
                    ">

                        <span>
                            Vị trí
                        </span>

                        <span>
                            Thiết bị
                        </span>

                        <span>
                            IP
                        </span>

                        <span>
                            Trạng thái
                        </span>

                    </div>


                    ${hardwareRows ||

        `
                            <div class="
                                detail-empty
                            ">
                                Không có dữ liệu
                            </div>
                        `
        }

                </div>


            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // --------------------------------------------------------
    // Close modal
    // --------------------------------------------------------

    const close =
        () => modal.remove();


    modal
        .querySelector(
            ".room-modal-close"
        )
        ?.addEventListener(
            "click",
            close
        );


    modal
        .querySelector(
            ".room-modal-backdrop"
        )
        ?.addEventListener(
            "click",
            close
        );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


// ============================================================
// STARTUP
// ============================================================

loadViewer();

loadCalls();

loadPresence();

loadHardware();


// ============================================================
// REALTIME POLLING
// ============================================================

setInterval(
    loadCalls,
    CALL_POLL_INTERVAL
);


setInterval(
    loadPresence,
    PRESENCE_POLL_INTERVAL
);


setInterval(
    loadViewer,
    VIEWER_POLL_INTERVAL
);


setInterval(
    loadHardware,
    VIEWER_POLL_INTERVAL
);