\# Kiến trúc hệ thống NurseCallWebViewer



\## 1. Tổng quan



`NurseCallWebViewer` là ứng dụng web ASP.NET Core dùng để hiển thị và theo dõi hệ thống Nurse Call.



Kiến trúc hiện tại được giữ đơn giản:



```text

┌─────────────────────┐

│      Trình duyệt    │

│ HTML / CSS / JS     │

└──────────┬──────────┘

&#x20;          │ HTTP

&#x20;          ▼

┌─────────────────────┐

│    ASP.NET Core     │

│        API          │

└──────────┬──────────┘

&#x20;          │

&#x20;          ▼

┌─────────────────────┐

│      Services       │

│                     │

│ CallService         │

│ DepartmentService   │

│ EndpointService     │

│ HardwareService     │

│ HistoryService      │

│ PresenceService     │

│ ViewerService       │

└──────────┬──────────┘

&#x20;          │

&#x20;          ▼

┌─────────────────────┐

│      CodacoDb       │

│ Database access     │

└──────────┬──────────┘

&#x20;          │

&#x20;          ▼

┌─────────────────────┐

│        MySQL        │

│ Nurse Call Database │

└─────────────────────┘

2. Project structure

Project chính:
Cấu trúc logic:
NurseCall.Web
NurseCall.Web
│
├── Data
│   └── CodacoDb.cs
│
├── Models
│   ├── Call.cs
│   ├── Department.cs
│   ├── EndPoint.cs
│   ├── HardwareState.cs
│   ├── History.cs
│   ├── Patient.cs
│   └── Presence.cs
│
├── Services
│   ├── CallService.cs
│   ├── DepartmentService.cs
│   ├── EndpointService.cs
│   ├── HardwareService.cs
│   ├── HistoryService.cs
│   ├── PresenceService.cs
│   └── ViewerService.cs
│
├── wwwroot
│   ├── index.html
│   ├── history.html
│   ├── css
│   │   └── site.css
│   └── js
│       ├── site.js
│       └── history.js
│
├── Program.cs
├── appsettings.json
└── appsettings.Development.json


3. Dependency Injection

Các service được đăng ký trong Program.cs.

Singleton

CodacoDb

Scoped
DepartmentService
EndpointService
ViewerService
HistoryService
CallService
PresenceService
HardwareService

Mô hình phụ thuộc:
API / Endpoint
       │
       ▼
    Service
       │
       ▼
    CodacoDb
Service chịu trách nhiệm xử lý nghiệp vụ và truy vấn dữ liệu cần thiết.

4. CodacoDb

File:

Data/CodacoDb.cs

CodacoDb là lớp truy cập database dùng chung.

Connection string được lấy từ cấu hình:

CodacoNC

Hiện tại project sử dụng MySQL command line client:

C:\mysql57\bin\mysql.exe

Các tham số kết nối được xây dựng bằng MySqlConnectionStringBuilder.

MySQL command được chạy thông qua process.

Password được truyền qua biến môi trường:

MYSQL_PWD
Không đưa password hoặc connection string chứa password vào source code.

Quy tắc quan trọng

Không tự ý thay đổi CodacoDb sang ORM hoặc database provider khác.

Nếu cần thay đổi cơ chế database access, phải đánh giá ảnh hưởng đến toàn bộ Services trước.

5. Services
DepartmentService

Phụ trách dữ liệu khoa/phòng.

API liên quan:

GET /api/departments
EndpointService

Phụ trách dữ liệu các endpoint/thiết bị Nurse Call.

API liên quan:

GET /api/endpoints

Nguồn dữ liệu endpoint cần được phân biệt rõ với dữ liệu bệnh nhân.

ViewerService

Phụ trách dữ liệu tổng hợp cho màn hình Viewer/Dashboard.

API:

GET /api/viewer

Viewer lấy dữ liệu chính từ:

Departments
EndPoints

Quan hệ:
Departments
     │
     │ idSegment + idDepartment
     ▼
 EndPoints

Hiện tại sử dụng:

Departments d
LEFT JOIN EndPoints e

theo:

e.idSegment = d.idSegment
e.idDepartment = d.idDepartment

Dữ liệu sau khi truy vấn được nhóm thành:

ViewerDepartment

và:

ViewerEndpoint

Thứ tự hiện tại:

segment
department
room
bed
Quy tắc rất quan trọng

EndPoints là nguồn xác định số lượng thiết bị.

Không JOIN Patients vào truy vấn Viewer chỉ để đếm thiết bị.

Lý do:

Một MAC có thể xuất hiện trong nhiều bản ghi Patients, dẫn đến duplicate và thống kê sai.

CallService

Phụ trách dữ liệu cuộc gọi Nurse Call.

API:

GET /api/calls

Dữ liệu được sử dụng để hiển thị trạng thái/cuộc gọi trên dashboard.

Khi thay đổi logic cuộc gọi cần kiểm tra cả frontend realtime display.

PresenceService

Phụ trách trạng thái Presence.

API:

GET /api/presence

HardwareService

Phụ trách trạng thái phần cứng.

API:

GET /api/hardware

HistoryService

Phụ trách lịch sử Nurse Call.

API:

GET /api/history

và:

GET /api/history/export

API history hỗ trợ các bộ lọc:

idSegment
idDepartment
room
fromDate
toDate

GetFilteredAsync(...) hiện giới hạn số lượng kết quả ở:

10000

6. Export Excel

API:

GET /api/history/export

Sử dụng thư viện:

ClosedXML

File Excel được tạo trực tiếp từ dữ liệu lịch sử.

Tên file có dạng:

NurseCall_History_yyyyMMdd_HHmmss.xlsx

Khi thay đổi HistoryService phải kiểm tra cả chức năng export.

7. Frontend

Frontend hiện tại không sử dụng framework SPA.

Sử dụng:

HTML
CSS
JavaScript
Dashboard

File:

wwwroot/index.html

JavaScript chính:

wwwroot/js/site.js

CSS:

wwwroot/css/site.css

History

File:

wwwroot/history.html

JavaScript:

wwwroot/js/history.js

8. Luồng dữ liệu Viewer

Luồng dữ liệu chính:

MySQL
  │
  ▼
CodacoDb
  │
  ▼
ViewerService
  │
  ▼
GET /api/viewer
  │
  ▼
JavaScript
  │
  ▼
Dashboard

ViewerService chịu trách nhiệm chuyển dữ liệu database thành model phù hợp cho frontend.

Frontend không nên truy cập database trực tiếp.

9. Luồng dữ liệu History
MySQL
  │
  ▼
CodacoDb
  │
  ▼
HistoryService
  │
  ├──────────────► GET /api/history
  │                       │
  │                       ▼
  │                    history.html
  │
  └──────────────► GET /api/history/export
                          │
                          ▼
                       Excel file
10. API hiện tại

Các endpoint hiện có:

GET /api/departments
GET /api/endpoints
GET /api/viewer
GET /api/history
GET /api/history/export
GET /api/calls
GET /api/presence
GET /api/hardware

Các API này được xem là contract hiện tại.

Không tự ý xóa hoặc đổi cấu trúc response nếu không kiểm tra frontend và yêu cầu nghiệp vụ.

11. Database principle

Database Nurse Call là hệ thống dữ liệu có sẵn.

Ứng dụng NurseCallWebViewer chủ yếu đọc dữ liệu.

Ưu tiên:

SELECT

Hạn chế:

INSERT
UPDATE
DELETE
ALTER
DROP

Không tự ý thay đổi database production.

12. Nguyên tắc khi phát triển
Ưu tiên bảo toàn kiến trúc hiện tại

Không tự ý:

chuyển sang Entity Framework;
chuyển database provider;
chuyển frontend sang React/Vue/Angular;
thay đổi toàn bộ Service layer;
thay đổi database schema;

nếu task hiện tại không yêu cầu.

Khi sửa một chức năng

Phải kiểm tra chuỗi phụ thuộc:

Database
   ↓
CodacoDb
   ↓
Service
   ↓
API
   ↓
JavaScript
   ↓
UI

Một thay đổi ở tầng dưới có thể ảnh hưởng đến các tầng phía trên.

13. Nguyên tắc tránh duplicate

Đặc biệt chú ý các bảng có thể chứa nhiều bản ghi liên quan cùng một thiết bị/MAC.

Không dùng JOIN tùy tiện để đếm thiết bị.

Trước khi thay đổi query thống kê:

Xác định bảng nào là nguồn dữ liệu chính.
Kiểm tra cardinality của quan hệ.
Kiểm tra khả năng duplicate.
Kiểm tra kết quả thực tế.
14. Nguyên tắc realtime

Dashboard có chức năng hiển thị trạng thái/cuộc gọi gần thời gian thực.

Khi thay đổi:

CallService;
API /api/calls;
JavaScript xử lý call;
cơ chế polling/reload dữ liệu;

phải kiểm tra toàn bộ chuỗi realtime.

Không chỉ kiểm tra backend mà bỏ qua frontend.

15. Khi cần thay đổi kiến trúc

Nếu một yêu cầu dẫn đến thay đổi lớn như:

thay đổi database access;
thay đổi database schema;
thêm middleware quan trọng;
thay đổi cách realtime;
thay framework frontend;
thay đổi cấu trúc API;

phải:

Phân tích kiến trúc hiện tại.
Đề xuất phương án.
Đánh giá ảnh hưởng.
Thống nhất trước khi triển khai.

Quyết định cuối cùng phải được ghi vào:

docs/DECISIONS.md