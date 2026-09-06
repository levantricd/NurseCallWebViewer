# CODACO Nurse Call - Reverse Engineering

## 1. Mục đích

Tài liệu này ghi lại các kết quả đã tìm hiểu và phân tích hệ thống Nurse Call của CODACO để phục vụ việc xây dựng WebViewer.

Mục tiêu của việc reverse engineering:

- Hiểu cấu trúc hoạt động của hệ thống Nurse Call hiện tại.
- Hiểu cách NCViewer lấy dữ liệu.
- Hiểu cấu trúc database CodacoNC.
- Xác định ý nghĩa các bảng và trường dữ liệu.
- Xác định cách WebViewer nên đọc và hiển thị dữ liệu.
- Giữ nguyên hệ thống Nurse Call hiện tại, không can thiệp vào hoạt động của hệ thống.

WebViewer được xây dựng theo hướng **read-only** đối với database CODACO.

---

# 2. Hệ thống CODACO hiện tại

Hệ thống hiện tại gồm các thành phần chính:

- Nurse Call Monitor / NCViewer
- Nurse Call Admin
- CODACO SQL Server
- Các thiết bị Nurse Call tại phòng bệnh

Thông tin phần mềm đã xác định:

- NCViewer: version 1.29
- Nurse Call Admin: version 5.8
- NCViewer là ứng dụng native Windows 32-bit.
- Ứng dụng được xây dựng bằng Delphi/VCL.
- NCViewer sử dụng `libmysql.dll` để kết nối MySQL.

Database server hiện tại:

- IP: `172.16.0.9`
- Port: `3306`
- Database: `CodacoNC`
- MySQL: `5.5.60`

WebViewer không thay thế hoặc điều khiển trực tiếp các thiết bị Nurse Call.

WebViewer chỉ đọc dữ liệu để hiển thị trên nền web.

---

# 3. Các chức năng phát hiện trong NCViewer

Qua phân tích giao diện và chuỗi trong NCViewer, các nhóm chức năng chính gồm:

- Ward
- Call
- Presence
- History
- Settings
- Program settings
- Events history
- Ward history
- Room history
- Bed history
- Event history
- Calling place history
- Rooms only
- Room and call place
- Patient admission/release
- Old history
- Backup/Restore history
- Excel/txt export
- History viewer
- Show events
- Show no presence
- Hiển thị trạng thái thiết bị
- Hiển thị thông tin phần cứng
- Theo dõi trạng thái SQL server
- Cấu hình server
- Cấu hình IP
- Cấu hình ward
- Nhóm ward
- Lọc lịch sử
- Export lịch sử

Một số chức năng trong NCViewer có khả năng ghi dữ liệu xuống database.

Tuy nhiên WebViewer **không thực hiện các thao tác ghi đó**.

---

# 4. Database CodacoNC

Database được xác định có 12 bảng:

1. `Calls`
2. `CardUsers`
3. `DepIntegrations`
4. `Departments`
5. `EndPoints`
6. `History`
7. `HistoryCache`
8. `IncomePatients`
9. `Patients`
10. `Presence`
11. `SysInfo`
12. `HardwareState`

Các bảng có vai trò khác nhau trong hệ thống.

Một số bảng là dữ liệu trạng thái hiện tại, trong khi `History` lưu lịch sử sự kiện.

---

# 5. Calls

Bảng `Calls` chứa các cuộc gọi đang hoạt động.

Các trường quan trọng:

- `idSegment`
- `idDepartment`
- `Room`
- `Bed`
- `TypeOfCall`
- `OrderIndex`
- `Priority`
- `CallerIp`
- `CallerTextA`
- `CallerTextB`
- `CallerExtBed`
- `PriorityCare`
- `NeatATOM_Event`
- `NeatATOM_Id`
- `AccesorEvent`
- `AccesorButtonId`

### TypeOfCall

Các loại cuộc gọi đã xác định:

| TypeOfCall | Ý nghĩa |
|---:|---|
| 1 | Gọi điều dưỡng 1 |
| 2 | Gọi điều dưỡng 2 |
| 3 | Gọi phòng |
| 4 | Cấp cứu bệnh nhân |
| 5 | Cấp cứu |
| 6 | Gọi điều dưỡng khẩn |
| 7 | Gọi dịch vụ |
| 8 | Báo động |
| 9 | Gọi bác sĩ |
| 10 | Code Blue |
| 24 | Ngắt cuộc gọi |

Các giá trị khác có thể tồn tại trong hệ thống Admin nhưng chưa được xác định là loại cuộc gọi chính trong WebViewer.

**Lưu ý quan trọng:**

Tên trường trong database là:

`AccesorButtonId`

Không phải `ButtonId`.

---

# 6. Presence

Bảng `Presence` thể hiện trạng thái hiện diện tại phòng/giường.

Các trường chính:

- `idSegment`
- `idDepartment`
- `Room`
- `Bed`
- `TypeOfPresence`
- `IDCard`
- `StartDate`
- `StartTime`

Mapping hiện tại:

| TypeOfPresence | Ý nghĩa |
|---:|---|
| 1 | Điều dưỡng |
| 2 | Điều dưỡng |
| 3 | Bác sĩ / Blue |

---

# 7. History

`History` là bảng lịch sử sự kiện Nurse Call.

Các trường quan trọng:

- `idRecord`
- `idSegment`
- `idDepartment`
- `Room`
- `Bed`
- `TypeOfCall`
- `TypeOfPresence`
- `idPatient`
- `TextA`
- `TextB`
- `IDCard`
- `StartDate`
- `StartTime`
- `StopDate`
- `StopTime`
- `NeatATOM_*`
- `Accesor*`

`idRecord` là khóa chính và tăng tự động.

History được sử dụng để:

- Xem lịch sử cuộc gọi.
- Xem lịch sử hiện diện.
- Lọc theo khoa.
- Lọc theo phòng.
- Lọc theo giường.
- Lọc theo thời gian.
- Xuất dữ liệu.

WebViewer hiện hỗ trợ xuất lịch sử ra Excel.

---

# 8. Logic nhóm History

Trong NCViewer đã xác định hai nhóm xử lý lịch sử.

### Nhóm liên quan đến giường

Các sự kiện:

```text
TypeOfCall IN (1, 2, 4, 10, 24)
OR TypeOfPresence > 0
```

### Nhóm liên quan đến phòng

Các sự kiện:

```text
TypeOfCall = 3
OR TypeOfCall BETWEEN 5 AND 9
OR TypeOfPresence > 0
```

Logic này được sử dụng làm cơ sở để hiểu cách NCViewer phân loại dữ liệu.

# 9. Departments

Bảng Departments chứa thông tin khoa.

Các trường:

idSegment
idDepartment
Name
ShortName
CountEndPoints

Một khoa được xác định bởi tổ hợp:

idSegment + idDepartment

Không nên chỉ sử dụng idDepartment để xác định duy nhất một khoa.

Snapshot đã quan sát:

idSegment	idDepartment	Name	EndPoints
7	7	KHOA_Y_HOC-CO-TRUYEN	5
6	6	KHOA_NOI	6
5	5	KHOA_NHI	7
2	2	KHOA_PHAU_THUAT	6

Tổng cộng:

4 khoa
24 EndPoints

# 10. EndPoints

EndPoints chứa các thiết bị/đầu cuối Nurse Call.

Các trường quan trọng:

idSegment
idDepartment
Room
Bed
idPatient
NeatDPOS_Address
TextA
TextB
ExtBedsCount
MAC
Type
TypeName
Module
ModuleName
PbxId
State
ErrorCode
Quy tắc quan trọng

Khi cần thống kê số lượng thiết bị, sử dụng EndPoints.

Không JOIN EndPoints với Patients chỉ để đếm thiết bị.

Trong quá trình phát triển WebViewer, JOIN với Patients đã từng gây ra tình trạng phòng bị hiển thị trùng.

# 11. Patients

Patients chứa thông tin bệnh nhân gắn với các phòng/giường.

Các trường chính:

idSegment
idDepartment
Room
Bed
idPatient
idNeat
idAccesor
TextA
TextB
DefaultTextA
DefaultTextB
BedFree
PriorityCare
MAC
Terminal
TerminalName
TerminalConnected

Bảng này có thể được sử dụng khi cần hiển thị thông tin bệnh nhân.

Tuy nhiên không sử dụng Patients làm nguồn chính để đếm EndPoints.

# 12. HardwareState

HardwareState chứa trạng thái phần cứng.

Các trường:

idSegment
idDepartment
Room
Position
ElementName
MacAddr
IpAddr
ErrorState
Timestamp

Khi truy vấn trạng thái phần cứng của một phòng, phải xác định đầy đủ:

idSegment
+ idDepartment
+ Room

Không chỉ lọc theo Room.

# 13. SysInfo

SysInfo chứa thông tin hệ thống CODACO.

Các trường đáng chú ý:

idSegment
idPrimaryDepartment
ActualDate
ActualTime
SegmentMaster
Name
IPAddress
MtErrorCode
NightModeActive
RunTime
Language
Firmware

Thông tin này có thể được sử dụng để hiển thị trạng thái hệ thống trên WebViewer.

# 14. Các bảng khác
CardUsers

Quản lý thông tin thẻ/người dùng.

DepIntegrations

Thông tin tích hợp theo khoa.

HistoryCache

Cache lịch sử trong bộ nhớ của hệ thống CODACO.

IncomePatients

Thông tin liên quan đến tiếp nhận bệnh nhân.

# 15. Snapshot dữ liệu đã quan sát

Tại thời điểm kiểm tra hệ thống:

Table	Số dòng
Calls	0
CardUsers	0
DepIntegrations	0
Departments	4
EndPoints	24
HardwareState	25
History	923
HistoryCache	39
IncomePatients	0
Patients	65
Presence	0
SysInfo	1

Các giá trị này chỉ là snapshot tại thời điểm kiểm tra và không được xem là số liệu cố định.

# 16. Ví dụ phòng 4

Một ví dụ đã được kiểm tra là:

idSegment = 2
idDepartment = 2
Room = 4

Phòng có 2 EndPoints:

Bed 1
MAC: BC-41-00-00-F4-F4
Type: 4
TypeName: RT-07D IP
PbxId: 0200421
State: 1
ErrorCode: 0
Bed 2
MAC: BC-41-00-00-F4-89
Type: 1
TypeName: RT-07 IP
PbxId: 0200422
State: 1
ErrorCode: 0

HardwareState tương ứng:

Position 1
RT-07D IP
172.16.51.10
ErrorState 0

Position 2
RT-07 IP
172.16.51.15
ErrorState 0

Ngoài ra HardwareState còn có:

Room 0
MT-07IP
172.16.2.2
ErrorState 403

# 17. Nguyên tắc an toàn

Hệ thống CODACO hiện tại là hệ thống đang vận hành.

Do đó WebViewer phải tuân thủ:

Chỉ đọc dữ liệu.
Không INSERT vào database CODACO.
Không UPDATE dữ liệu CODACO.
Không DELETE dữ liệu CODACO.
Không thay đổi schema.
Không thay đổi cấu hình MySQL.
Không thay đổi dữ liệu thiết bị.
Không gửi lệnh điều khiển thiết bị Nurse Call.
Không thực hiện các chức năng quản trị của NCViewer/Admin.

Các chức năng ghi dữ liệu phát hiện trong quá trình reverse engineering chỉ được ghi nhận để hiểu hệ thống, không được đưa vào WebViewer.

# 18. WebViewer

WebViewer là ứng dụng ASP.NET Core được xây dựng để cung cấp giao diện web thay cho việc chỉ sử dụng NCViewer trên Windows.

Các chức năng chính:

Tổng quan.
Cuộc gọi đang hoạt động.
Phòng và giường.
Hiện diện.
Khoa.
Thiết bị.
Lịch sử.
Xuất lịch sử Excel.
Thông tin hệ thống.

WebViewer đọc dữ liệu từ database CODACO và chuyển dữ liệu thành API cho giao diện web.

Kiến trúc hiện tại:

CODACO MySQL
     │
     │ SELECT
     ▼
ASP.NET Core WebViewer
     │
     ▼
Browser

WebViewer không thay đổi hệ thống Nurse Call hiện tại.

# 19. Nguyên tắc phát triển tiếp theo

Khi phát triển WebViewer:

Ưu tiên hiểu đúng dữ liệu hiện có trước khi thay đổi code.
Không tự suy đoán schema.
Không thay đổi database CODACO.
Không thêm chức năng ghi dữ liệu nếu chưa có yêu cầu rõ ràng.
Giữ WebViewer ở chế độ read-only.
Dùng idSegment + idDepartment khi xác định khoa.
Dùng idSegment + idDepartment + Room khi xác định phòng.
Dùng EndPoints làm nguồn chính để thống kê thiết bị.
Giữ nguyên tên trường database, đặc biệt AccesorButtonId.
Khi phát hiện hành vi mới của NCViewer, cập nhật tài liệu reverse engineering trước khi đưa vào code.

# 20. Trạng thái tài liệu

Tài liệu này là kết quả reverse engineering dựa trên:

NCViewer.
Nurse Call Admin.
Database schema.
Database data snapshot.
Kiểm tra trực tiếp dữ liệu hệ thống.
Quá trình phát triển và kiểm thử WebViewer.

Một số hành vi của hệ thống cũ vẫn có thể chưa được xác định đầy đủ.
