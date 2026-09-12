# Project Context

## 1. Mục đích dự án

`NurseCallWebViewer` là ứng dụng web được xây dựng để thay thế chức năng hiển thị của phần mềm Nurse Call Viewer cũ của CODACO.

Mục tiêu:

- Hiển thị cuộc gọi đang hoạt động.
- Hiển thị trạng thái hiện diện.
- Hiển thị khoa, phòng và giường.
- Hiển thị thiết bị và trạng thái phần cứng.
- Xem lịch sử.
- Lọc lịch sử.
- Xuất lịch sử ra Excel.
- Có giao diện web để sử dụng trên máy tính trong mạng nội bộ.

WebViewer là hệ thống **read-only** đối với database CODACO.

---

## 2. Hệ thống nguồn

Hệ thống Nurse Call hiện tại sử dụng phần mềm CODACO.

Phần mềm cũ đã được reverse engineering trong phạm vi cần thiết để xây dựng WebViewer.

Các tài liệu liên quan:

```text
docs/CODACO_REVERSE_ENGINEERING.md
docs/DATABASE.md
```

CODACO_REVERSE_ENGINEERING.md chứa các phát hiện về phần mềm cũ, SQL query và cách hệ thống CODACO xử lý dữ liệu.

DATABASE.md chứa schema và thông tin database đã được xác minh.

---

## 3. Database CODACO

Database:

```text
CodacoNC
```

MySQL server:

```text
172.16.0.9:3306
```

Version đã xác minh:

```text
MySQL 5.5.60
```

Database có 12 bảng chính:

```text
Calls
CardUsers
DepIntegrations
Departments
EndPoints
History
HistoryCache
IncomePatients
Patients
Presence
SysInfo
HardwareState
```

WebViewer chỉ đọc dữ liệu từ database.

Không được thay đổi dữ liệu hoặc schema của hệ thống CODACO.

---

## 4. Công nghệ WebViewer

Backend:

```text
.NET 9
ASP.NET Core
C#
```

Database access:

```text
CodacoDb
C:\mysql57\bin\mysql.exe
```

Frontend:

```text
HTML
CSS
JavaScript
```

Excel:

```text
ClosedXML
```

---

## 5. Cấu trúc project

```text
NurseCallWebViewer/
│
├── NurseCall.Web/
│   ├── Models/
│   ├── Services/
│   ├── wwwroot/
│   │   ├── index.html
│   │   ├── history.html
│   │   ├── site.css
│   │   ├── site.js
│   │   └── history.js
│   │
│   └── Program.cs
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CODACO_REVERSE_ENGINEERING.md
│   ├── DATABASE.md
│   ├── DECISIONS.md
│   └── PROJECT_CONTEXT.md
│
└── AGENTS.md
```

---

## 6. Services hiện tại

Các service chính:

```text
CallService
DepartmentService
EndpointService
ViewerService
PresenceService
HardwareService
HistoryService
```

### CallService

Đọc:

```text
Calls
```

Phục vụ cuộc gọi đang hoạt động.

### DepartmentService

Đọc:

```text
Departments
```

Phục vụ danh sách khoa.

### EndpointService

Đọc:

```text
EndPoints
```

Phục vụ thông tin thiết bị đầu cuối.

### ViewerService

Tổng hợp:

```text
Departments
EndPoints
```

để hiển thị:

- Khoa.
- Phòng.
- Giường.
- Thiết bị.

### PresenceService

Đọc:

```text
Presence
```

để hiển thị người đang hiện diện.

### HardwareService

Đọc:

```text
HardwareState
```

để hiển thị trạng thái phần cứng.

### HistoryService

Đọc:

```text
History
```

để:

- Xem lịch sử.
- Lọc lịch sử.
- Xuất Excel.

---

## 7. API

Các API hiện tại:

```text
/api/departments
/api/endpoints
/api/viewer
/api/calls
/api/presence
/api/hardware
/api/history
/api/history/export
```

Frontend sử dụng các API này để lấy dữ liệu.

---

## 8. Quy tắc định danh dữ liệu

### Department

Department được xác định bằng:

```text
idSegment + idDepartment
```

Không sử dụng riêng:

```text
idDepartment
```

### Room

Room được xác định bằng:

```text
idSegment + idDepartment + Room
```

Không sử dụng riêng:

```text
Room
```

### Bed

Bed được xác định bằng:

```text
idSegment + idDepartment + Room + Bed
```

---

## 9. EndPoints và Patients

EndPoints là nguồn chính để xác định thiết bị đầu cuối.

Không JOIN:

```text
EndPoints
+
Patients
```

chỉ để đếm thiết bị.

Lý do là JOIN có thể tạo ra bản ghi trùng và làm sai số lượng thiết bị hiển thị.

---

## 10. HardwareState

Khi lấy thiết bị phần cứng của một phòng, phải xác định phòng bằng:

```text
idSegment
idDepartment
Room
```

Ví dụ:

```text
Room = 4
```

không đủ để xác định một phòng.

Phải sử dụng đầy đủ:

```text
idSegment
idDepartment
Room = 4
```

---

## 11. Calls

Bảng:

```text
Calls
```

Các loại cuộc gọi đã xác định:

```text
1  → Gọi điều dưỡng 1
2  → Gọi điều dưỡng 2
3  → Gọi phòng
4  → Cấp cứu bệnh nhân
5  → Cấp cứu
6  → Gọi điều dưỡng khẩn
7  → Gọi dịch vụ
8  → Báo động
9  → Gọi bác sĩ
10 → Code Blue
24 → Ngắt cuộc gọi
```

Field của nút gọi:

```text
AccesorButtonId
```

Không dùng:

```text
ButtonId
```

---

## 12. Presence

Bảng:

```text
Presence
```

Mapping hiện tại:

```text
TypeOfPresence = 1 → Điều dưỡng
TypeOfPresence = 2 → Điều dưỡng
TypeOfPresence = 3 → Bác sĩ
```

---

## 13. History

Bảng:

```text
History
```

History chứa các sự kiện Nurse Call và Presence theo cấu trúc của hệ thống CODACO.

WebViewer có thể:

- Hiển thị history.
- Lọc history.
- Xuất history ra Excel.

Không sửa dữ liệu trong bảng History.

---

## 14. Excel Export

History được xuất thành file:

```text
.xlsx
```

Thư viện sử dụng:

```text
ClosedXML
```

Các trường chính:

```text
ID
Segment
Khoa
Phòng
Giường
Loại cuộc gọi
Hiện diện
ID bệnh nhân
Nội dung A
Nội dung B
Ngày bắt đầu
Giờ bắt đầu
Ngày kết thúc
Giờ kết thúc
Thời gian
```

---

## 15. Realtime

WebViewer hiện sử dụng polling.

Browser định kỳ gọi:

```text
/api/calls
/api/presence
/api/viewer
```

để cập nhật giao diện.

### Cuộc gọi mới

Frontend có cơ chế theo dõi các cuộc gọi đã quan sát.

Khi một cuộc gọi xuất hiện mà chưa tồn tại trong lần polling trước, cuộc gọi đó được xem là cuộc gọi mới.

Lần tải đầu tiên không được coi các cuộc gọi hiện có là cuộc gọi mới.

---

## 16. Dashboard

Dashboard hiện có các khu vực:

```text
Tổng quan
Cuộc gọi
Phòng & giường
Hiện diện
Khoa
Thiết bị
Lịch sử
Hệ thống
```

Summary hiển thị:

```text
Cuộc gọi
Hiện diện
Phòng
Thiết bị
```

---

## 17. Test mode

Frontend có test mode cho cuộc gọi để kiểm tra giao diện mà không cần tạo cuộc gọi thật trên hệ thống Nurse Call.

Test mode được kích hoạt bằng:

```text
?testcalls=1
```

Ví dụ:

```text
http://localhost:5227/?testcalls=1
```

Test mode chỉ tạo dữ liệu giả ở frontend.

Không ghi dữ liệu vào CODACO.

---

## 18. Nguyên tắc an toàn

WebViewer phải đảm bảo:

```text
CODACO → WebViewer
```

là luồng dữ liệu đọc.

Không được biến WebViewer thành hệ thống điều khiển Nurse Call nếu chưa có yêu cầu và thiết kế riêng.

Không được:

```text
Ghi database CODACO.
Xóa history.
Thay đổi calls.
Thay đổi bệnh nhân.
Thay đổi cấu hình Nurse Call.
Điều khiển thiết bị.
```

---

## 19. Những điều cần nhớ khi phát triển

### Không nhầm Room

Không dùng:

```text
Room
```

làm khóa duy nhất.

Luôn xem xét:

```text
idSegment
idDepartment
Room
```

### Không nhầm Department

Không dùng riêng:

```text
idDepartment
```

Luôn xem xét:

```text
idSegment
idDepartment
```

### Không đếm thiết bị bằng Patients

Dùng:

```text
EndPoints
```

làm nguồn chính.

### Không dùng ButtonId

Trong Calls, field đúng là:

```text
AccesorButtonId
```

### Không ghi database CODACO

WebViewer là:

```text
READ ONLY
```

đối với hệ thống CODACO.

---

## 20. Tài liệu tham chiếu

Khi cần hiểu hệ thống, đọc theo thứ tự:

```text
AGENTS.md
    ↓
PROJECT_CONTEXT.md
    ↓
ARCHITECTURE.md
    ↓
DECISIONS.md
    ↓
CODACO_REVERSE_ENGINEERING.md
    ↓
DATABASE.md
```

Trong đó:

```text
AGENTS.md → quy tắc làm việc.
PROJECT_CONTEXT.md → bối cảnh dự án.
ARCHITECTURE.md → kiến trúc.
DECISIONS.md → quyết định kỹ thuật.
CODACO_REVERSE_ENGINEERING.md → reverse engineering.
DATABASE.md → database/schema.
```

---

## 21. Trạng thái hiện tại

Các chức năng WebViewer hiện đã có:

- Dashboard.
- Danh sách khoa.
- Phòng và giường.
- Thiết bị.
- Hardware state.
- Presence.
- Active Calls.
- History.
- History filtering.
- Excel export.
- Test mode cho Active Calls.
- Phát hiện cuộc gọi mới ở frontend.

Các chức năng đang hoạt động phải được giữ nguyên khi phát triển thêm.

---

## 22. Nguyên tắc phát triển tiếp theo

Khi bổ sung chức năng:

- Xác định dữ liệu cần thiết.
- Kiểm tra schema trong DATABASE.md.
- Kiểm tra hành vi hệ thống cũ trong CODACO_REVERSE_ENGINEERING.md.
- Xác định service/API/frontend bị ảnh hưởng.
- Thay đổi nhỏ nhất có thể.
- Build và test.
- Cập nhật documentation nếu có quyết định kỹ thuật mới.

Không tự ý thực hiện refactor lớn nếu chưa có lý do rõ ràng.
