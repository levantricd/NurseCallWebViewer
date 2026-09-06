\# Bối cảnh dự án NurseCallWebViewer



\## 1. Mục đích dự án



`NurseCallWebViewer` là ứng dụng web dùng để theo dõi và hiển thị hệ thống gọi y tá (Nurse Call).



Ứng dụng lấy dữ liệu từ hệ thống Nurse Call hiện có thông qua MySQL và cung cấp giao diện web để theo dõi trạng thái thiết bị, cuộc gọi, hiện diện và lịch sử.



Mục tiêu chính:



\- Hiển thị trạng thái hệ thống Nurse Call theo thời gian thực hoặc gần thời gian thực.

\- Hiển thị thông tin khoa/phòng/giường.

\- Theo dõi thiết bị và trạng thái thiết bị.

\- Hiển thị các cuộc gọi Nurse Call.

\- Hiển thị trạng thái Presence.

\- Hiển thị lịch sử cuộc gọi.

\- Cho phép lọc và xuất lịch sử ra Excel.

\- Cung cấp giao diện đơn giản, phù hợp với môi trường bệnh viện.



\---



\## 2. Công nghệ hiện tại



\### Backend



\- ASP.NET Core

\- .NET 9

\- C#

\- Nullable enabled

\- Implicit usings enabled



\### Database



\- MySQL



\### Database access



Project hiện sử dụng `CodacoDb`.



`CodacoDb` thực hiện truy vấn thông qua MySQL command line:



`C:\\mysql57\\bin\\mysql.exe`



Không thay đổi cơ chế database access nếu chưa có quyết định mới.



\### Frontend



Frontend hiện tại sử dụng:



\- HTML

\- CSS

\- JavaScript



Các file frontend nằm trong:



`NurseCall.Web/wwwroot`



\### Excel



Sử dụng thư viện:



`ClosedXML`



để xuất lịch sử ra Excel.



\---



\## 3. Cấu trúc project



Project chính:



`NurseCall.Web`



Các thành phần chính:



\### Data



\- `Data/CodacoDb.cs`



Phụ trách kết nối và truy vấn database.



\### Models



\- `Models/Call.cs`

\- `Models/Department.cs`

\- `Models/EndPoint.cs`

\- `Models/HardwareState.cs`

\- `Models/History.cs`

\- `Models/Patient.cs`

\- `Models/Presence.cs`



\### Services



\- `Services/CallService.cs`

\- `Services/DepartmentService.cs`

\- `Services/EndpointService.cs`

\- `Services/HardwareService.cs`

\- `Services/HistoryService.cs`

\- `Services/PresenceService.cs`

\- `Services/ViewerService.cs`



\### Frontend



\- `wwwroot/index.html`

\- `wwwroot/history.html`

\- `wwwroot/css/site.css`

\- `wwwroot/js/site.js`

\- `wwwroot/js/history.js`



\---



\## 4. Các API hiện tại



Các API chính:



`GET /api/departments`



`GET /api/endpoints`



`GET /api/viewer`



`GET /api/history`



`GET /api/history/export`



`GET /api/calls`



`GET /api/presence`



`GET /api/hardware`



Các API này đang được frontend sử dụng và cần được xem là contract hiện tại của ứng dụng.



\---



\## 5. Kiến trúc hiện tại



`Program.cs` đăng ký:



\### Singleton



\- `CodacoDb`



\### Scoped



\- `DepartmentService`

\- `EndpointService`

\- `ViewerService`

\- `HistoryService`

\- `CallService`

\- `PresenceService`

\- `HardwareService`



Luồng xử lý cơ bản:



```text

Browser

&#x20;  |

&#x20;  v

ASP.NET Core API

&#x20;  |

&#x20;  v

Service

&#x20;  |

&#x20;  v

CodacoDb

&#x20;  |

&#x20;  v

MySQL / Nurse Call Database

