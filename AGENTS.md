# AGENTS.md
# Hướng dẫn cho Codex – NurseCallWebViewer

## 1. Quy tắc trước khi sửa code

Trước khi thực hiện bất kỳ thay đổi nào:

1. Đọc file AGENTS.md này.
2. Đọc docs/PROJECT_CONTEXT.md nếu file tồn tại.
3. Đọc docs/ARCHITECTURE.md nếu task liên quan đến kiến trúc, database, API, backend hoặc frontend.
4. Đọc docs/DECISIONS.md nếu task có liên quan đến các quyết định kỹ thuật đã được thống nhất.
5. Đọc docs/CODACO_REVERSE_ENGINEERING.md nếu task liên quan đến hệ thống CODACO, Nurse Call, Calls, Presence, History hoặc hành vi của NCViewer/Nurse Call Admin.
6. Đọc docs/DATABASE.md nếu task liên quan đến database CodacoNC, bảng, field, quan hệ dữ liệu hoặc truy vấn MySQL.
7. Kiểm tra code hiện tại trước khi đưa ra giải pháp hoặc sửa code.

Không được giả định rằng code hiện tại hoạt động theo cách mình tưởng tượng. Hãy đọc code và xác nhận trước.

## 2. Nguyên tắc sửa code

- Ưu tiên sửa nhỏ, rõ ràng và ít ảnh hưởng nhất.
- Bảo toàn hành vi hiện tại nếu task không yêu cầu thay đổi hành vi đó.
- Không tự ý refactor lớn khi không cần thiết.
- Không xóa code chỉ vì chưa hiểu mục đích của code.
- Không tự ý thay đổi kiến trúc của project.
- Không tự ý thêm framework hoặc thư viện lớn.
- Không tạo ra breaking change cho API hiện tại nếu chưa được yêu cầu.
- Khi phát hiện vấn đề ngoài phạm vi task, ghi nhận vấn đề thay vì tự ý sửa.

## 3. Database

Project hiện tại sử dụng MySQL.

Database hiện tại là hệ thống có sẵn. Ưu tiên thao tác đọc dữ liệu.

Không tự ý:

- thay đổi schema;
- xóa dữ liệu;
- cập nhật dữ liệu production;
- thêm migration;
- thay đổi cấu trúc bảng;

nếu chưa có yêu cầu rõ ràng.

Đối với database CODACO, phải tuân thủ các kết quả reverse engineering đã được ghi trong:

`docs/CODACO_REVERSE_ENGINEERING.md`

và:

`docs/DATABASE.md`

Không tự ý suy đoán lại tên bảng, tên field, quan hệ hoặc ý nghĩa dữ liệu nếu tài liệu đã có thông tin được xác minh.

## 4. CodacoDb

Project hiện đang sử dụng `CodacoDb` để truy vấn MySQL.

Cơ chế hiện tại sử dụng:

`C:\mysql57\bin\mysql.exe`

Không tự ý thay thế cơ chế này bằng ORM, MySqlConnector hoặc một cơ chế database khác nếu chưa được thống nhất.

## 5. EndPoints và Patients

`EndPoints` là nguồn dữ liệu chính để xác định số lượng thiết bị Nurse Call.

Không sử dụng `Patients` để xác định số lượng thiết bị.

Không JOIN `Patients` vào truy vấn thống kê thiết bị nếu việc JOIN có thể làm phát sinh bản ghi trùng.

Lý do: một MAC có thể xuất hiện trong nhiều bản ghi `Patients`.

## 6. Backend

Backend sử dụng ASP.NET Core.

Các service hiện tại gồm:

- DepartmentService
- EndpointService
- ViewerService
- HistoryService
- CallService
- PresenceService
- HardwareService

Khi sửa backend, ưu tiên sử dụng service hiện có thay vì tạo thêm tầng xử lý không cần thiết.

## 7. API

Các API hiện tại là contract nội bộ của ứng dụng.

Không tự ý đổi hoặc xóa API hiện có nếu task không yêu cầu.

Các API chính hiện tại:

- GET /api/departments
- GET /api/endpoints
- GET /api/viewer
- GET /api/history
- GET /api/history/export
- GET /api/calls
- GET /api/presence
- GET /api/hardware

Nếu thay đổi response của API, phải kiểm tra frontend có phụ thuộc vào cấu trúc response đó hay không.

## 8. Frontend

Frontend hiện tại sử dụng:

- HTML
- CSS
- JavaScript

Các file chính nằm trong:

`NurseCall.Web/wwwroot`

Không tự ý chuyển sang React, Vue, Angular hoặc framework frontend khác nếu chưa được thống nhất.

## 9. Bảo mật

Không đưa vào repository:

- password;
- connection string chứa mật khẩu;
- API key;
- token;
- secret;
- thông tin xác thực.

Không hard-code thông tin nhạy cảm vào source code.

## 10. Kiểm tra sau khi thay đổi

Sau khi sửa code:

1. Build project.
2. Kiểm tra lỗi compile.
3. Kiểm tra các API bị ảnh hưởng.
4. Nếu thay đổi frontend, kiểm tra giao diện và JavaScript liên quan.
5. Nếu thay đổi database query, kiểm tra dữ liệu trả về và nguy cơ duplicate.

Không kết luận task hoàn thành chỉ dựa trên việc code đã được sửa.

## 11. Tài liệu quyết định

Nếu trong quá trình làm việc có một quyết định kỹ thuật quan trọng, phải cập nhật:

`docs/DECISIONS.md`

Mục tiêu là để các phiên làm việc sau của ChatGPT hoặc Codex không phải quyết định lại những vấn đề đã thống nhất.

## 12. Khi yêu cầu chưa rõ

Nếu yêu cầu có nhiều cách triển khai và việc lựa chọn ảnh hưởng đến kiến trúc hoặc dữ liệu:

- Không tự ý chọn phương án có ảnh hưởng lớn.
- Nêu các phương án.
- Giải thích ngắn gọn ưu/nhược điểm.
- Chờ thống nhất trước khi thực hiện thay đổi lớn.

## 13. Ngôn ngữ

Tài liệu dự án có thể viết bằng tiếng Việt.

Tên class, method, property, API, database table, field và các technical identifier phải giữ nguyên theo code thực tế.

Khi trao đổi với người dùng, ưu tiên tiếng Việt.

## 14. Quy tắc Git

- Không tự ý tạo branch mới nếu người dùng chưa yêu cầu.
- Không tự ý commit nếu người dùng chưa yêu cầu.
- Không tự ý push lên remote nếu người dùng chưa yêu cầu.
- Không tự ý amend hoặc sửa các commit đã tồn tại.
- Sau khi hoàn thành task, phải kiểm tra git status.
- Phải báo rõ những file đã thay đổi.
- Phải báo rõ kết quả build/test.
- Khi có thay đổi ngoài phạm vi task, phải thông báo trước.

## 15. Database an toàn

- Không tự ý INSERT, UPDATE hoặc DELETE dữ liệu Nurse Call.
- Không tự ý ALTER, DROP hoặc thay đổi schema database.
- Các truy vấn database trong quá trình phát triển phải ưu tiên SELECT.
- Không chạy script thay đổi database production nếu chưa có sự xác nhận rõ ràng của người dùng.
- Không tự ý thay đổi connection string hoặc thông tin kết nối database.

## 16. Tài liệu CODACO là nguồn tham chiếu đã xác minh

Khi task liên quan đến hệ thống Nurse Call CODACO:

- `docs/CODACO_REVERSE_ENGINEERING.md` ghi lại các kết quả reverse engineering đã xác định.
- `docs/DATABASE.md` ghi lại cấu trúc và quy tắc sử dụng database CodacoNC.
- Không tự ý thay đổi hoặc phủ nhận các thông tin đã được xác minh trong hai tài liệu này chỉ dựa trên suy đoán.
- Nếu phát hiện thông tin mới mâu thuẫn với tài liệu, phải kiểm tra nguồn thực tế và báo cáo sự khác biệt trước khi sửa tài liệu.
- Khi một hành vi mới của NCViewer hoặc một đặc điểm mới của database được xác minh, cập nhật tài liệu trước hoặc cùng với thay đổi code liên quan.

## 17. Phân biệt kiến trúc hiện tại và đề xuất tương lai

Codex phải phân biệt rõ:

- kiến trúc WebViewer hiện tại đang chạy;
- các ý tưởng hoặc đề xuất kiến trúc trong tương lai.

Không được coi một phương án chưa triển khai là thành phần đã tồn tại trong project.

Không tự ý thay đổi kiến trúc hiện tại chỉ vì phát hiện một phương án khác có vẻ tốt hơn.

Nếu task yêu cầu thay đổi kiến trúc, phải:

1. Phân tích kiến trúc hiện tại.
2. Đề xuất phương án.
3. Đánh giá ảnh hưởng.
4. Chờ thống nhất trước khi triển khai.