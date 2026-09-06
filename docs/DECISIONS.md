\# Các quyết định kỹ thuật – NurseCallWebViewer



Tài liệu này ghi lại các quyết định kỹ thuật và nghiệp vụ quan trọng đã được thống nhất trong quá trình phát triển dự án.



Mục đích:



\- Tránh quyết định lại những vấn đề đã thống nhất.

\- Giúp ChatGPT và Codex hiểu lý do của các lựa chọn hiện tại.

\- Giúp các phiên làm việc sau tiếp tục đúng hướng.

\- Làm cơ sở tham khảo khi cần thay đổi kiến trúc hoặc nghiệp vụ.



\---



\# DEC-001 — Sử dụng EndPoints để xác định số lượng thiết bị



\*\*Ngày:\*\* 05/09/2026



\*\*Trạng thái:\*\* Đã thống nhất



\## Vấn đề



Cần xác định chính xác số lượng thiết bị Nurse Call.



Database có bảng `EndPoints` và `Patients`.



Một MAC có thể xuất hiện trong nhiều bản ghi `Patients`.



Nếu JOIN `Patients` vào truy vấn thống kê thiết bị, cùng một thiết bị có thể xuất hiện nhiều lần.



Điều này dẫn đến:



\- số lượng thiết bị bị đếm sai;

\- dữ liệu Viewer có thể bị duplicate;

\- thống kê dashboard không chính xác.



\## Quyết định



Sử dụng `EndPoints` làm nguồn dữ liệu chính để xác định số lượng thiết bị Nurse Call.



Không sử dụng `Patients` để đếm số lượng thiết bị.



Không JOIN `Patients` vào truy vấn thiết bị nếu không thực sự cần thiết.



\## Ảnh hưởng



`ViewerService` phải tuân thủ nguyên tắc này.



Các chức năng thống kê số lượng thiết bị trong tương lai cũng phải tuân thủ nguyên tắc này.



\---



\# DEC-002 — Giữ CodacoDb làm lớp truy cập MySQL



\*\*Ngày:\*\* 05/09/2026



\*\*Trạng thái:\*\* Đã thống nhất



\## Vấn đề



Có thể sử dụng nhiều phương pháp để truy cập MySQL, ví dụ:



\- Entity Framework;

\- MySqlConnector;

\- MySQL command line;

\- các ORM hoặc data access layer khác.



\## Quyết định



Giữ nguyên `CodacoDb` hiện tại làm lớp truy cập database.



Không tự ý chuyển sang Entity Framework hoặc provider khác.



\## Lý do



`NurseCallWebViewer` đang hoạt động dựa trên cơ chế hiện tại.



Thay đổi database access layer có thể tạo ra phạm vi thay đổi lớn và không cần thiết đối với các task giao diện hoặc nghiệp vụ thông thường.



\## Ảnh hưởng



Các Service hiện tại tiếp tục sử dụng `CodacoDb`.



Nếu trong tương lai cần thay đổi database access layer, phải có một quyết định kỹ thuật riêng.



\---



\# DEC-003 — Không thay đổi database Nurse Call nếu không cần thiết



\*\*Ngày:\*\* 05/09/2026



\*\*Trạng thái:\*\* Đã thống nhất



\## Vấn đề



`NurseCallWebViewer` kết nối tới database Nurse Call hiện có.



Database này thuộc hệ thống Nurse Call đang vận hành.



\## Quyết định



Ứng dụng ưu tiên đọc dữ liệu từ database.



Không tự ý:



\- thay đổi schema;

\- thêm bảng;

\- sửa bảng;

\- xóa dữ liệu;

\- cập nhật dữ liệu;

\- chạy migration;



trên database hiện có.



\## Lý do



Ứng dụng Viewer cần hoạt động an toàn mà không ảnh hưởng đến hệ thống Nurse Call gốc.



\## Ảnh hưởng



Các task mới phải ưu tiên giải pháp xử lý ở tầng ứng dụng.



Nếu bắt buộc phải thay đổi database, phải xác định rõ phạm vi và thống nhất trước.



\---



\# DEC-004 — Giữ frontend HTML/CSS/JavaScript hiện tại



\*\*Ngày:\*\* 05/09/2026



\*\*Trạng thái:\*\* Đã thống nhất



\## Quyết định



Tiếp tục sử dụng frontend hiện tại:



\- HTML;

\- CSS;

\- JavaScript.



Không tự ý chuyển sang:



\- React;

\- Vue;

\- Angular;

\- framework SPA khác.



\## Lý do



Giao diện hiện tại đơn giản và phù hợp với mục đích của ứng dụng.



Việc chuyển framework sẽ tạo ra phạm vi thay đổi lớn không cần thiết.



\## Ảnh hưởng



Các cải tiến giao diện nên được thực hiện trên cấu trúc frontend hiện tại trước.



\---



\# DEC-005 — API hiện tại được xem là contract



\*\*Ngày:\*\* 05/09/2026



\*\*Trạng thái:\*\* Đã thống nhất



\## Quyết định



Các API hiện tại được xem là contract của ứng dụng.



Các API chính:



```text

GET /api/departments

GET /api/endpoints

GET /api/viewer

GET /api/history

GET /api/history/export

GET /api/calls

GET /api/presence

GET /api/hardware



Không tự ý xóa API hoặc thay đổi cấu trúc response nếu không kiểm tra ảnh hưởng đến frontend.



Lý do



Frontend hiện tại phụ thuộc vào các API này.



Thay đổi backend có thể làm hỏng giao diện mà không gây lỗi compile.



DEC-006 — Ưu tiên thay đổi nhỏ và có kiểm chứng



Ngày: 05/09/2026



Trạng thái: Đã thống nhất



Quyết định



Khi phát triển tính năng mới hoặc sửa lỗi:



ưu tiên thay đổi nhỏ;

tránh refactor lớn nếu không cần;

không thay đổi kiến trúc chỉ vì có một cách khác "đẹp hơn";

kiểm tra code hiện tại trước khi sửa;

build sau khi thay đổi;

kiểm tra các chức năng bị ảnh hưởng.

Lý do



Project đang được sử dụng thực tế.



Ổn định và khả năng kiểm soát thay đổi quan trọng hơn việc tối ưu kiến trúc một cách quá mức.



DEC-007 — Tài liệu dự án là bộ nhớ dài hạn



Ngày: 06/09/2026



Trạng thái: Đã thống nhất



Quyết định



Các thông tin quan trọng không chỉ được lưu trong cuộc trò chuyện với ChatGPT.



Chúng phải được lưu trong repository.



Ba tài liệu chính:



AGENTS.md

docs/PROJECT\_CONTEXT.md

docs/ARCHITECTURE.md

docs/DECISIONS.md

Vai trò

AGENTS.md



Quy định Codex phải làm việc như thế nào.



PROJECT\_CONTEXT.md



Mô tả project là gì và trạng thái hiện tại.



ARCHITECTURE.md



Mô tả project được xây dựng và vận hành như thế nào.



DECISIONS.md



Ghi lại những quyết định quan trọng và lý do tại sao chúng được lựa chọn.



Mục tiêu



Khi chuyển giữa:



ChatGPT;

Codex trong ChatGPT;

Codex CLI;

các phiên làm việc khác;



Codex có thể đọc repository và khôi phục phần lớn bối cảnh mà không cần người dùng giải thích lại từ đầu.



Quy tắc cập nhật DECISIONS.md



Chỉ ghi những quyết định có giá trị lâu dài.



Không cần ghi:



bug nhỏ;

lỗi typo;

thay đổi CSS nhỏ;

sửa lỗi tạm thời;

những thử nghiệm chưa được thống nhất.



Nên ghi khi có quyết định liên quan đến:



kiến trúc;

database;

API;

nghiệp vụ;

cách tính toán dữ liệu;

công nghệ;

bảo mật;

cách tổ chức project;

những vấn đề đã được tranh luận và thống nhất.



Mỗi quyết định mới sử dụng ID tiếp theo:



DEC-008



DEC-009



DEC-010



...



Không sửa/xóa quyết định cũ chỉ vì sau này có quyết định mới.



Nếu một quyết định bị thay thế, giữ lại quyết định cũ và ghi rõ quyết định mới thay thế nó.

