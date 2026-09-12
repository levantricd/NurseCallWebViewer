# Architecture

## 1. Tổng quan

NurseCallWebViewer là ứng dụng web ASP.NET Core dùng để đọc và hiển thị dữ liệu từ hệ thống CODACO Nurse Call.

Kiến trúc hiện tại:

```text
Browser
   │
   │ HTTP
   ▼
ASP.NET Core
   │
   ├── API
   │
   └── Services
          │
          ▼
       CodacoDb
          │
          ▼
       mysql.exe
          │
          ▼
   MySQL - CodacoNC
   172.16.0.9:3306
```

WebViewer không điều khiển hệ thống Nurse Call.

WebViewer chỉ đọc dữ liệu từ database CODACO.

---

## 2. Thành phần chính

Project hiện tại:

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

## 3. ASP.NET Core

Ứng dụng sử dụng ASP.NET Core.

`Program.cs` chịu trách nhiệm:

- Khởi tạo ứng dụng.
- Đăng ký services.
- Mapping API.
- Phục vụ static files.
- Mapping các endpoint HTTP.

Frontend gọi API trực tiếp từ trình duyệt.

---

## 4. Services

### CallService

Đọc dữ liệu từ bảng:

```text
Calls
```

Chức năng:

- Lấy các cuộc gọi đang hoạt động.
- Phục vụ `GET /api/calls`.

Frontend polling API này để cập nhật realtime.

### DepartmentService

Đọc bảng:

```text
Departments
```

Chức năng:

- Lấy danh sách khoa.
- Hiển thị tên khoa.
- Phục vụ `GET /api/departments`.

Một khoa được nhận diện bằng:

```text
idSegment + idDepartment
```

Không sử dụng riêng `idDepartment`.

### EndpointService

Đọc bảng:

```text
EndPoints
```

Chức năng:

- Lấy danh sách thiết bị đầu cuối.
- Xác định số lượng thiết bị.
- Phục vụ `GET /api/endpoints`.

`EndPoints` là nguồn chính để thống kê thiết bị đầu cuối.

Không JOIN với `Patients` để đếm thiết bị vì có thể tạo dữ liệu trùng.

### ViewerService

Tổng hợp dữ liệu phục vụ màn hình:

- Khoa.
- Phòng.
- Giường.
- Thiết bị đầu cuối.

Quan hệ dữ liệu sử dụng:

```text
Department
    │
    └── EndPoints
          │
          └── Room
                │
                └── Bed
```

Khi xác định phòng phải sử dụng đầy đủ:

```text
idSegment
idDepartment
Room
```

Không sử dụng riêng `Room`.

### PresenceService

Đọc bảng:

```text
Presence
```

Chức năng:

- Hiển thị điều dưỡng hiện diện.
- Hiển thị bác sĩ hiện diện.
- Phục vụ `GET /api/presence`.

Mapping:

```text
TypeOfPresence = 1 → Điều dưỡng
TypeOfPresence = 2 → Điều dưỡng
TypeOfPresence = 3 → Bác sĩ
```

### HardwareService

Đọc bảng:

```text
HardwareState
```

Chức năng:

- Hiển thị trạng thái phần cứng.
- Hiển thị thiết bị trong phòng.
- Phục vụ `GET /api/hardware`.

Khi lọc thiết bị của một phòng phải sử dụng:

```text
idSegment
idDepartment
Room
```

Điều này tránh lấy nhầm thiết bị của phòng có cùng số Room ở khoa khác.

### HistoryService

Đọc bảng:

```text
History
```

Chức năng:

- Hiển thị lịch sử.
- Lọc lịch sử.
- Xuất Excel.

API:

```text
GET /api/history
GET /api/history/export
```

File Excel được tạo bằng:

```text
ClosedXML
```

---

## 5. Database access

`CodacoDb` là lớp chịu trách nhiệm thực hiện truy vấn database.

Hiện tại database access sử dụng:

```text
C:\mysql57\bin\mysql.exe
```

Luồng:

```text
Service
   │
   ▼
CodacoDb
   │
   ▼
mysql.exe
   │
   ▼
MySQL
```

Các truy vấn phải chỉ đọc dữ liệu.

Không thực hiện:

```text
INSERT
UPDATE
DELETE
TRUNCATE
ALTER
DROP
CREATE
```

trên database CODACO.

---

## 6. Database CODACO

Database:

```text
CodacoNC
```

Server:

```text
172.16.0.9:3306
```

MySQL hiện tại của hệ thống CODACO là MySQL 5.5.x.

Chi tiết schema được ghi trong:

```text
docs/DATABASE.md
```

Các phát hiện từ reverse engineering được ghi trong:

```text
docs/CODACO_REVERSE_ENGINEERING.md
```

---

## 7. Data identity

```text
Department identity
(idSegment, idDepartment)

Room identity
(idSegment, idDepartment, Room)

Bed identity
(idSegment, idDepartment, Room, Bed)
```

Khi JOIN hoặc lọc dữ liệu phải sử dụng đầy đủ các thành phần nhận diện cần thiết.

---

## 8. Calls

Bảng:

```text
Calls
```

Các loại cuộc gọi chính:

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

Trường nút gọi trong schema là:

```text
AccesorButtonId
```

Không sử dụng tên:

```text
ButtonId
```

---

## 9. Realtime

WebViewer hiện sử dụng polling từ browser.

Ví dụ:

```text
Browser
   │
   ├── GET /api/calls
   │
   ├── GET /api/presence
   │
   └── GET /api/viewer
```

Các API được gọi định kỳ để cập nhật giao diện.

### Cuộc gọi mới

Frontend có thể nhận diện cuộc gọi mới bằng một key ổn định được tạo từ các trường nhận diện cuộc gọi.

Lần tải đầu tiên không được coi toàn bộ cuộc gọi hiện tại là cuộc gọi mới.

Các lần polling tiếp theo chỉ đánh dấu những cuộc gọi chưa xuất hiện ở lần trước.

---

## 10. Frontend

Frontend hiện sử dụng:

```text
HTML
CSS
JavaScript
```

Không sử dụng framework frontend.

Các file chính:

```text
wwwroot/index.html
wwwroot/history.html
wwwroot/site.css
wwwroot/site.js
wwwroot/history.js
```

---

## 11. Dashboard

Dashboard chính hiển thị:

- Cuộc gọi đang hoạt động.
- Hiện diện.
- Phòng.
- Thiết bị.
- Danh sách khoa.
- Phòng và giường.
- Trạng thái hệ thống.

Sidebar cung cấp các khu vực:

- Tổng quan
- Cuộc gọi
- Phòng & giường
- Hiện diện
- Khoa
- Thiết bị
- Lịch sử
- Hệ thống

---

## 12. History và Excel

Trang:

```text
/history.html
```

cho phép:

- Xem lịch sử.
- Lọc theo khoa.
- Lọc theo phòng.
- Lọc theo thời gian.
- Xuất Excel.

Endpoint xuất Excel:

```text
/api/history/export
```

File Excel chứa các thông tin chính:

- ID
- Segment
- Khoa
- Phòng
- Giường
- Loại cuộc gọi
- Hiện diện
- ID bệnh nhân
- Nội dung A
- Nội dung B
- Ngày bắt đầu
- Giờ bắt đầu
- Ngày kết thúc
- Giờ kết thúc
- Thời gian

---

## 13. Duplicate avoidance

Một lỗi quan trọng đã được xác định trong quá trình phát triển:

Không được dùng JOIN không cần thiết giữa:

```text
EndPoints
Patients
```

để xác định số lượng thiết bị.

Một thiết bị có thể xuất hiện liên quan đến nhiều bản ghi dữ liệu khác, dẫn đến số lượng thiết bị bị nhân đôi.

Do đó:

```text
EndPoints
```

là nguồn chính cho device count.

---

## 14. Hardware room detail

Khi người dùng mở chi tiết thiết bị của một phòng, frontend/API phải xác định phòng bằng:

```text
idSegment
idDepartment
Room
```

Ví dụ:

```text
Room = 4
```

không đủ để xác định phòng.

Phải xác định:

```text
idSegment = ...
idDepartment = ...
Room = 4
```

---

## 15. API hiện tại

| API | Chức năng |
| --- | --- |
| `/api/departments` | Danh sách khoa |
| `/api/endpoints` | Thiết bị đầu cuối |
| `/api/viewer` | Khoa/phòng/giường |
| `/api/calls` | Cuộc gọi đang hoạt động |
| `/api/presence` | Hiện diện |
| `/api/hardware` | Trạng thái phần cứng |
| `/api/history` | Lịch sử |
| `/api/history/export` | Xuất lịch sử Excel |

Các API này là interface giữa frontend và backend.

Không thay đổi contract nếu không kiểm tra frontend trước.

---

## 16. Nguyên tắc an toàn

WebViewer là hệ thống giám sát/hiển thị.

Không được:

- Điều khiển thiết bị Nurse Call.
- Ghi dữ liệu vào database CODACO.
- Thay đổi cấu hình hệ thống CODACO.
- Xóa lịch sử.
- Thay đổi trạng thái cuộc gọi.
- Thay đổi bệnh nhân.

Mọi thao tác đều phải giữ nguyên hệ thống CODACO đang vận hành.

---

## 17. Nguyên tắc thay đổi kiến trúc

Trước khi thay đổi kiến trúc:

- Đọc `PROJECT_CONTEXT.md`.
- Đọc `DECISIONS.md`.
- Kiểm tra `CODACO_REVERSE_ENGINEERING.md`.
- Kiểm tra `DATABASE.md`.

Nếu một thay đổi ảnh hưởng đến cách truy cập database, API hoặc cấu trúc dữ liệu, phải ghi nhận quyết định trong `DECISIONS.md`.

Không thực hiện refactor lớn chỉ để thay đổi cách viết code nếu kiến trúc hiện tại vẫn đáp ứng yêu cầu.

---

## 18. Phân biệt hiện tại và đề xuất

Tài liệu kiến trúc phải phân biệt rõ:

### Current

Những gì WebViewer đang thực sự sử dụng.

### Proposed

Những kiến trúc hoặc cải tiến mới chỉ là đề xuất.

Không mô tả một giải pháp chưa triển khai như một thành phần hiện có của hệ thống.
