# Technical Decisions

Tài liệu này ghi lại các quyết định kỹ thuật quan trọng của NurseCallWebViewer.

Mục tiêu là giúp những lần phát triển sau hiểu được tại sao hệ thống được xây dựng theo cách hiện tại.

---

## DEC-001 — Sử dụng EndPoints làm nguồn thống kê thiết bị

### Quyết định

Sử dụng bảng `EndPoints` làm nguồn chính để xác định số lượng thiết bị đầu cuối.

### Lý do

Trong quá trình kiểm tra database, JOIN `EndPoints` với `Patients` có thể tạo ra các bản ghi trùng.

Điều này dẫn đến số lượng thiết bị hiển thị không chính xác.

### Quy tắc

Không JOIN `Patients` chỉ để đếm thiết bị.

Nếu cần thông tin bệnh nhân, phải xử lý riêng theo mục đích cụ thể.

---

### DEC-002 — Giữ nguyên CodacoDb

### Quyết định

WebViewer tiếp tục sử dụng lớp `CodacoDb` hiện tại để truy cập database CODACO.

Cơ chế hiện tại sử dụng:

```text
C:\mysql57\bin\mysql.exe
```

### Lý do

Đây là cơ chế đã được kiểm tra thực tế với database CODACO.

Không thay đổi database access layer nếu chưa có yêu cầu rõ ràng và chưa kiểm tra ảnh hưởng.

### DEC-003 — Database CODACO chỉ đọc

### Quyết định

WebViewer chỉ được phép đọc database CODACO.

Không được thực hiện:
INSERT
UPDATE
DELETE
TRUNCATE
ALTER
DROP
CREATE
### Lý do

Database CODACO thuộc hệ thống Nurse Call đang vận hành.

WebViewer phải hoàn toàn độc lập về mặt điều khiển và không được làm thay đổi dữ liệu vận hành.

### DEC-004 — Giữ frontend HTML/CSS/JavaScript

### Quyết định

Frontend tiếp tục sử dụng:

HTML
CSS
JavaScript

Không chuyển sang framework frontend khác.

### Lý do

Giao diện hiện tại đáp ứng được các chức năng cần thiết và có cấu trúc đơn giản.

Việc chuyển framework không mang lại lợi ích cần thiết ở giai đoạn hiện tại.

### DEC-005 — API hiện tại là contract

### Quyết định

Các API hiện tại được xem là contract giữa backend và frontend.

Các API chính:

/api/departments
/api/endpoints
/api/viewer
/api/calls
/api/presence
/api/hardware
/api/history
/api/history/export
### Quy tắc

Trước khi thay đổi API phải kiểm tra frontend đang sử dụng API đó.

Không đổi tên field hoặc cấu trúc response nếu không cần thiết.

Nếu bắt buộc phải thay đổi, phải cập nhật đồng thời các thành phần liên quan.

### DEC-006 — Ưu tiên thay đổi nhỏ

### Quyết định

Ưu tiên các thay đổi nhỏ, độc lập và có thể kiểm tra được.

### Quy tắc

Mỗi thay đổi nên:

Xác định rõ file cần sửa.
Giữ nguyên các chức năng đang hoạt động.
Build sau khi thay đổi.
Test chức năng liên quan.
Commit thành một thay đổi có ý nghĩa.
### Lý do

Giảm nguy cơ làm hỏng những chức năng đã hoạt động ổn định.

Đặc biệt quan trọng đối với hệ thống đang được phát triển dựa trên một hệ thống Nurse Call thực tế.

### DEC-007 — Tài liệu là nguồn ghi nhớ lâu dài của dự án

### Quyết định

Các kiến thức quan trọng không chỉ được giữ trong source code hoặc hội thoại mà phải được ghi lại trong tài liệu.

Các tài liệu quan trọng:

AGENTS.md
docs/PROJECT_CONTEXT.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
docs/CODACO_REVERSE_ENGINEERING.md
docs/DATABASE.md
### Vai trò

PROJECT_CONTEXT.md

→ Bối cảnh và thông tin tổng thể của dự án.

ARCHITECTURE.md

→ Kiến trúc và luồng dữ liệu hiện tại.

DECISIONS.md

→ Các quyết định kỹ thuật quan trọng.

CODACO_REVERSE_ENGINEERING.md

→ Kết quả reverse engineering hệ thống CODACO.

DATABASE.md

→ Schema và thông tin database đã xác minh.

### Lý do

Dự án phụ thuộc nhiều vào việc hiểu đúng hệ thống CODACO hiện có.

Các kiến thức này cần được bảo tồn để những lần phát triển sau không phải phân tích lại từ đầu.

### DEC-008 — Định danh Department bằng Segment + Department

### Quyết định

Không coi idDepartment là định danh duy nhất của khoa.

Định danh đầy đủ là:

idSegment + idDepartment
### Lý do

Các bảng CODACO sử dụng cả idSegment và idDepartment.

Do đó việc chỉ sử dụng idDepartment có thể dẫn đến nhầm dữ liệu nếu hệ thống có nhiều segment.

### Quy tắc

Các JOIN hoặc filter liên quan đến Department phải sử dụng:

idSegment
idDepartment
### DEC-009 — Định danh Room phải bao gồm Department

### Quyết định

Không sử dụng riêng Room để xác định phòng.

Định danh đầy đủ:

idSegment
idDepartment
Room
### Lý do

Các khoa có thể có cùng số phòng.

Ví dụ:

Khoa A - Room 4
Khoa B - Room 4

là hai phòng khác nhau.

### Quy tắc

Khi lấy HardwareState hoặc dữ liệu phòng phải lọc theo đầy đủ:

idSegment
idDepartment
Room
### DEC-010 — EndPoints là nguồn chính cho device count

### Quyết định

Số lượng thiết bị hiển thị trên Dashboard phải dựa trên dữ liệu EndPoints.

### Lý do

EndPoints đại diện cho các endpoint thiết bị của hệ thống.

Không sử dụng số lượng bản ghi của bảng khác để suy ra tổng thiết bị nếu không có lý do rõ ràng.

### DEC-011 — HardwareState phải lọc theo full room identity

### Quyết định

Khi hiển thị HardwareState của một phòng, phải sử dụng:

idSegment
idDepartment
Room
### Lý do

Chỉ sử dụng Room có thể lấy nhầm thiết bị từ khoa khác.

Đây là nguyên nhân của lỗi hiển thị thiết bị phòng đã được phát hiện trong quá trình phát triển.

### DEC-012 — Calls sử dụng AccesorButtonId

### Quyết định

Trong model và logic xử lý bảng Calls, sử dụng field:

AccesorButtonId
### Lý do

Đây là tên field thực tế trong schema CODACO.

Không sử dụng:

ButtonId

nếu không có field tương ứng trong database.

### DEC-013 — Realtime sử dụng polling

### Quyết định

Frontend hiện cập nhật dữ liệu realtime bằng cách polling API.

Các dữ liệu chính được cập nhật định kỳ gồm:

Calls
Presence
Viewer
### Lý do

Polling đơn giản, dễ kiểm tra và phù hợp với kiến trúc hiện tại.

Chưa cần chuyển sang WebSocket hoặc SignalR nếu chưa có yêu cầu thực tế.

### DEC-014 — Phát hiện cuộc gọi mới ở frontend

### Quyết định

Frontend có thể duy trì danh sách key của các cuộc gọi đã quan sát để phát hiện cuộc gọi mới giữa các lần polling.

### Quy tắc
Lần tải đầu tiên không tạo cảnh báo.
Chỉ cuộc gọi xuất hiện mới sau lần polling trước mới được xem là cuộc gọi mới.
Key phải được tạo từ các trường nhận diện ổn định của cuộc gọi.
Việc phát hiện cuộc gọi mới không được ghi dữ liệu trở lại CODACO.
### DEC-015 — History export sử dụng ClosedXML

### Quyết định

Sử dụng thư viện ClosedXML để tạo file Excel từ dữ liệu History.

### Lý do

ClosedXML cung cấp API thuận tiện để tạo file .xlsx và định dạng worksheet.

### Quy tắc

Excel được tạo từ dữ liệu đọc từ database.

Không thay đổi dữ liệu History trong quá trình export.

## DEC-016 — Phân biệt kiến trúc hiện tại và đề xuất tương lai

### Quyết định

Tài liệu kỹ thuật phải phân biệt rõ:

Current
Proposed
### Lý do

Trong quá trình phát triển có thể xuất hiện nhiều phương án cải tiến.

Một phương án được thảo luận không có nghĩa là nó đã được triển khai.

### Quy tắc

Không mô tả một thành phần chưa triển khai như một phần của kiến trúc hiện tại.
