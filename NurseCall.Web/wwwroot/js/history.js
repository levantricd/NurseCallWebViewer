let historyData = [];
let departments = [];

async function loadHistoryPage() {

    const loading =
        document.getElementById("history-loading");

    const error =
        document.getElementById("history-error");

    try {

        const [
            historyResponse,
            departmentResponse
        ] = await Promise.all([

            fetch("/api/history", {
                cache: "no-store"
            }),

            fetch("/api/departments", {
                cache: "no-store"
            })
        ]);

        if (!historyResponse.ok) {
            throw new Error(
                "History HTTP " +
                historyResponse.status
            );
        }

        if (!departmentResponse.ok) {
            throw new Error(
                "Department HTTP " +
                departmentResponse.status
            );
        }

        historyData =
            await historyResponse.json();

        departments =
            await departmentResponse.json();

        buildDepartmentFilter();

        renderHistory(historyData);

    }
    catch (err) {

        console.error(err);

        error.hidden = false;

    }
    finally {

        loading.style.display = "none";
    }
}


function buildDepartmentFilter() {

    const select =
        document.getElementById(
            "history-department"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Tất cả khoa
        </option>
    `;

    departments.forEach(department => {

        const option =
            document.createElement("option");

        option.value =
            `${department.idSegment}|${department.idDepartment}`;

        option.textContent =
            department.name ||
            department.shortName ||
            department.idDepartment;

        select.appendChild(option);
    });
}


function getDepartmentName(record) {

    const department =
        departments.find(d =>
            Number(d.idSegment) ===
            Number(record.idSegment) &&
            Number(d.idDepartment) ===
            Number(record.idDepartment)
        );

    if (department) {

        return department.name ||
            department.shortName ||
            String(record.idDepartment ?? "");
    }

    return String(
        record.idDepartment ?? ""
    );
}


function getFilteredHistory() {

    const departmentValue =
        document.getElementById(
            "history-department"
        )?.value || "";

    const roomValue =
        document.getElementById(
            "history-room"
        )?.value.trim() || "";

    const fromDate =
        document.getElementById(
            "history-from"
        )?.value || "";

    const toDate =
        document.getElementById(
            "history-to"
        )?.value || "";

    return historyData.filter(record => {

        if (departmentValue) {

            const [
                segment,
                department
            ] = departmentValue.split("|");

            if (
                Number(record.idSegment) !==
                Number(segment) ||
                Number(record.idDepartment) !==
                Number(department)
            ) {
                return false;
            }
        }


        if (roomValue) {

            if (
                String(record.room ?? "") !==
                roomValue
            ) {
                return false;
            }
        }


        if (fromDate) {

            if (
                (record.startDate || "") <
                fromDate
            ) {
                return false;
            }
        }


        if (toDate) {

            if (
                (record.startDate || "") >
                toDate
            ) {
                return false;
            }
        }

        return true;
    });
}


function renderHistory(records) {

    const body =
        document.getElementById(
            "history-body"
        );

    if (!body) {
        return;
    }

    body.innerHTML = "";

    if (
        !records ||
        records.length === 0
    ) {

        body.innerHTML = `
            <tr>
                <td colspan="10"
                    class="empty-history">
                    Không có dữ liệu phù hợp
                </td>
            </tr>
        `;

        updateHistoryCount(0);

        return;
    }


    records.forEach(record => {

        const row =
            document.createElement("tr");

        const duration =
            calculateDuration(
                record.startDate,
                record.startTime,
                record.stopDate,
                record.stopTime
            );

        row.innerHTML = `

            <td>
                ${escapeHtml(record.idRecord)}
            </td>

            <td>
                ${escapeHtml(
            record.startDate || ""
        )}
            </td>

            <td>
                ${escapeHtml(
            record.startTime || ""
        )}
            </td>

            <td>
                ${escapeHtml(
            getDepartmentName(record)
        )}
            </td>

            <td>
                ${escapeHtml(
            record.room ?? ""
        )}
            </td>

            <td>
                ${escapeHtml(
            record.bed ?? ""
        )}
            </td>

            <td>
                <span class="event-type">
                    ${escapeHtml(
            getCallTypeName(
                record.typeOfCall
            )
        )}
                </span>
            </td>

            <td>
                ${escapeHtml(
            getPresenceName(
                record.typeOfPresence
            )
        )}
            </td>

            <td>
                ${escapeHtml(
            record.stopTime || ""
        )}
            </td>

            <td>
                ${escapeHtml(duration)}
            </td>
        `;

        body.appendChild(row);
    });


    updateHistoryCount(
        records.length
    );
}


function updateHistoryCount(count) {

    const element =
        document.getElementById(
            "history-count"
        );

    if (element) {

        element.textContent =
            `${count} bản ghi`;
    }
}


function applyHistoryFilter() {

    const filtered =
        getFilteredHistory();

    renderHistory(filtered);
}


function clearHistoryFilter() {

    const department =
        document.getElementById(
            "history-department"
        );

    const room =
        document.getElementById(
            "history-room"
        );

    const from =
        document.getElementById(
            "history-from"
        );

    const to =
        document.getElementById(
            "history-to"
        );

    if (department)
        department.value = "";

    if (room)
        room.value = "";

    if (from)
        from.value = "";

    if (to)
        to.value = "";

    renderHistory(historyData);
}


function buildExportUrl() {

    const params =
        new URLSearchParams();

    const departmentValue =
        document.getElementById(
            "history-department"
        )?.value || "";

    const roomValue =
        document.getElementById(
            "history-room"
        )?.value.trim() || "";

    const fromDate =
        document.getElementById(
            "history-from"
        )?.value || "";

    const toDate =
        document.getElementById(
            "history-to"
        )?.value || "";


    if (departmentValue) {

        const [
            segment,
            department
        ] = departmentValue.split("|");

        params.set(
            "idSegment",
            segment
        );

        params.set(
            "idDepartment",
            department
        );
    }


    if (roomValue) {

        params.set(
            "room",
            roomValue
        );
    }


    if (fromDate) {

        params.set(
            "fromDate",
            fromDate
        );
    }


    if (toDate) {

        params.set(
            "toDate",
            toDate
        );
    }


    const query =
        params.toString();

    return query
        ? `/api/history/export?${query}`
        : "/api/history/export";
}


async function exportHistory() {

    const button =
        document.getElementById(
            "history-export"
        );

    const status =
        document.getElementById(
            "history-export-status"
        );

    try {

        button.disabled = true;

        status.textContent =
            "Đang tạo file Excel...";


        const response =
            await fetch(
                buildExportUrl(),
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Export HTTP " +
                response.status
            );
        }


        const blob =
            await response.blob();


        const disposition =
            response.headers.get(
                "Content-Disposition"
            );

        let filename =
            "NurseCall_History.xlsx";


        if (disposition) {

            const match =
                disposition.match(
                    /filename="?([^"]+)"?/
                );

            if (match && match[1]) {
                filename = match[1];
            }
        }


        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);


        status.textContent =
            "Đã tải Excel";

    }
    catch (error) {

        console.error(error);

        status.textContent =
            "Không thể tạo file Excel";

    }
    finally {

        button.disabled = false;
    }
}


function getCallTypeName(type) {

    switch (Number(type)) {

        case 1:
            return "Voice call 1";

        case 2:
            return "Voice call 2";

        case 3:
            return "Room call";

        case 4:
            return "Patient emergency";

        case 5:
            return "Emergency";

        case 6:
            return "Nurse emergency";

        case 7:
            return "Service";

        case 8:
            return "Alarm";

        case 9:
            return "Doctor";

        case 10:
            return "Blue code";

        case 24:
            return "Disconnect";

        default:
            return type ?? "";
    }
}


function getPresenceName(type) {

    switch (Number(type)) {

        case 1:
            return "Điều dưỡng";

        case 2:
            return "Điều dưỡng";

        case 3:
            return "Bác sĩ";

        default:
            return type ?? "";
    }
}


function calculateDuration(
    startDate,
    startTime,
    stopDate,
    stopTime
) {

    if (
        !startDate ||
        !startTime ||
        !stopDate ||
        !stopTime
    ) {
        return "";
    }


    const start =
        new Date(
            `${startDate}T${startTime}`
        );

    const stop =
        new Date(
            `${stopDate}T${stopTime}`
        );


    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            stop.getTime()
        )
    ) {
        return "";
    }


    const seconds =
        Math.max(
            0,
            Math.floor(
                (stop - start) / 1000
            )
        );


    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        seconds % 60;


    if (minutes === 0) {

        return `${remainingSeconds}s`;
    }


    return `${minutes}m ${remainingSeconds}s`;
}


function escapeHtml(value) {

    return String(value)
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


document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById(
                "history-search"
            )
            ?.addEventListener(
                "click",
                applyHistoryFilter
            );


        document
            .getElementById(
                "history-clear"
            )
            ?.addEventListener(
                "click",
                clearHistoryFilter
            );


        document
            .getElementById(
                "history-export"
            )
            ?.addEventListener(
                "click",
                exportHistory
            );


        loadHistoryPage();
    }
);