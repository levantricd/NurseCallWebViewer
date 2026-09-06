---

# `docs/DATABASE.md`

```markdown
# CODACO Nurse Call Database

## 1. Tổng quan

Database của hệ thống Nurse Call CODACO có tên:

```text
CodacoNC

Database server hiện tại:

172.16.0.9:3306

Phiên bản MySQL đã xác định:

5.5.60

Database đang được hệ thống Nurse Call sử dụng trong thực tế.

WebViewer chỉ được phép đọc dữ liệu từ database này.

2. Nguyên tắc an toàn

Database CODACO là database của hệ thống đang vận hành.

WebViewer phải hoạt động theo nguyên tắc:

READ ONLY

Không được thực hiện:

INSERT
UPDATE
DELETE
ALTER
DROP
CREATE
TRUNCATE

Không thay đổi:

Schema.
Table.
Index.
Data.
User.
Permission.
Configuration.

WebViewer không được gửi lệnh điều khiển đến thiết bị Nurse Call thông qua database.

3. Các bảng

Database CodacoNC có 12 bảng:

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
4. Calls

Mục đích:

Chứa các cuộc gọi đang hoạt động.

Các trường quan trọng:

idSegment
idDepartment
Room
Bed
TypeOfCall
OrderIndex
Priority
CallerIp
CallerTextA
CallerTextB
CallerExtBed
PriorityCare
NeatATOM_Event
NeatATOM_Id
AccesorEvent
AccesorButtonId
TypeOfCall
Giá trị	Ý nghĩa
1	Gọi điều dưỡng 1
2	Gọi điều dưỡng 2
3	Gọi phòng
4	Cấp cứu bệnh nhân
5	Cấp cứu
6	Gọi điều dưỡng khẩn
7	Gọi dịch vụ
8	Báo động
9	Gọi bác sĩ
10	Code Blue
24	Ngắt cuộc gọi

Tên trường chính xác:

AccesorButtonId

Không sử dụng tên ButtonId.

5. Departments

Mục đích:

Lưu danh sách khoa.

Các trường:

idSegment
idDepartment
Name
ShortName
CountEndPoints

Một khoa được định danh bởi:

idSegment + idDepartment

Không coi idDepartment là khóa định danh duy nhất trên toàn hệ thống.

Snapshot:

idSegment	idDepartment	Name	CountEndPoints
7	7	KHOA_Y_HOC-CO-TRUYEN	5
6	6	KHOA_NOI	6
5	5	KHOA_NHI	7
2	2	KHOA_PHAU_THUAT	6
6. EndPoints

Mục đích:

Lưu các thiết bị Nurse Call.

Các trường:

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
Quy tắc thống kê thiết bị

Khi cần đếm thiết bị:

EndPoints

là nguồn chính.

Không JOIN với Patients chỉ để đếm thiết bị.

Việc JOIN như vậy trước đây đã gây ra dữ liệu phòng bị trùng trong WebViewer.

7. Patients

Mục đích:

Thông tin bệnh nhân và trạng thái giường.

Các trường:

idSegment
idDepartment
Room
Bed
idPatient
idNeat
WirelessButtonLowBat
WirelessButtonType
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

Patients có thể được sử dụng khi WebViewer cần hiển thị thông tin bệnh nhân.

Không sử dụng bảng này thay cho EndPoints để thống kê thiết bị.

8. Presence

Mục đích:

Lưu trạng thái hiện diện.

Các trường:

idSegment
idDepartment
Room
Bed
TypeOfPresence
IDCard
StartDate
StartTime

Mapping:

TypeOfPresence	Ý nghĩa
1	Điều dưỡng
2	Điều dưỡng
3	Bác sĩ / Blue
9. History

Mục đích:

Lưu lịch sử các sự kiện.

Các trường chính:

idRecord
idSegment
idDepartment
Room
Bed
TypeOfCall
TypeOfPresence
idPatient
TextA
TextB
IDCard
StartDate
StartTime
StopDate
StopTime
NeatATOM_*
Accesor*

idRecord là khóa chính auto increment.

History grouping

Các sự kiện liên quan đến giường:

TypeOfCall IN (1, 2, 4, 10, 24)
OR TypeOfPresence > 0

Các sự kiện liên quan đến phòng:

TypeOfCall = 3
OR TypeOfCall BETWEEN 5 AND 9
OR TypeOfPresence > 0

WebViewer sử dụng History cho:

Lịch sử cuộc gọi.
Lịch sử hiện diện.
Lọc lịch sử.
Hiển thị lịch sử.
Xuất Excel.
10. HistoryCache

Mục đích:

Cache các sự kiện lịch sử.

Cấu trúc dữ liệu tương tự History.

Bảng này có engine:

MEMORY

trong hệ thống CODACO hiện tại.

Không sử dụng HistoryCache thay cho History khi cần truy vấn lịch sử đầy đủ.

11. HardwareState

Mục đích:

Trạng thái phần cứng.

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
Định danh phòng

Khi truy vấn HardwareState của một phòng phải sử dụng:

idSegment
+ idDepartment
+ Room

Không chỉ:

Room

vì nhiều khoa có thể có cùng số phòng.

12. SysInfo

Mục đích:

Thông tin trạng thái hệ thống CODACO.

Các trường:

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

Có thể sử dụng để hiển thị trạng thái hệ thống trên WebViewer.

13. CardUsers

Mục đích:

Thông tin người dùng/thẻ.

Trong snapshot đã kiểm tra:

0 rows
14. DepIntegrations

Mục đích:

Thông tin tích hợp theo khoa.

Trong snapshot đã kiểm tra:

0 rows
15. IncomePatients

Mục đích:

Thông tin liên quan đến tiếp nhận bệnh nhân.

Trong snapshot đã kiểm tra:

0 rows
16. Database snapshot

Snapshot dữ liệu tại thời điểm kiểm tra:

Table	Rows
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

Đây là số liệu tại thời điểm kiểm tra, không phải giá trị cố định.

17. Quan hệ định danh
Khoa
idSegment + idDepartment
Phòng
idSegment + idDepartment + Room
Giường
idSegment + idDepartment + Room + Bed

Đây là quy tắc quan trọng khi viết query cho WebViewer.

Không nên sử dụng riêng:

Room

hoặc:

idDepartment

để định danh dữ liệu.

18. Ví dụ phòng 4

Một phòng đã được kiểm tra:

idSegment = 2
idDepartment = 2
Room = 4

Có 2 EndPoints.

Bed 1
MAC = BC-41-00-00-F4-F4
Type = 4
TypeName = RT-07D IP
PbxId = 0200421
State = 1
ErrorCode = 0
Bed 2
MAC = BC-41-00-00-F4-89
Type = 1
TypeName = RT-07 IP
PbxId = 0200422
State = 1
ErrorCode = 0

HardwareState:

Position 1
ElementName = RT-07D IP
IpAddr = 172.16.51.10
ErrorState = 0

Position 2
ElementName = RT-07 IP
IpAddr = 172.16.51.15
ErrorState = 0

Ngoài ra có:

Room = 0
ElementName = MT-07IP
IpAddr = 172.16.2.2
ErrorState = 403
19. Storage engine

Trong database CODACO hiện tại:

Calls: MEMORY
DepIntegrations: MEMORY
EndPoints: MEMORY
HistoryCache: MEMORY
IncomePatients: MEMORY
Patients: MEMORY
Presence: MEMORY
SysInfo: MEMORY

Các bảng khác được xác định là MyISAM.

Đặc biệt:

History = MyISAM
Departments = MyISAM
HardwareState = MyISAM
CardUsers = MyISAM

Không thay đổi storage engine của database CODACO.

20. WebViewer database access

Kiến trúc hiện tại:

┌──────────────────────┐
│ CODACO Nurse Call    │
│ MySQL 5.5            │
│ 172.16.0.9           │
│ CodacoNC             │
└──────────┬───────────┘
           │
           │ SELECT
           ▼
┌──────────────────────┐
│ ASP.NET Core         │
│ NurseCall WebViewer  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Browser              │
│ Web interface        │
└──────────────────────┘

WebViewer không phải là thành phần điều khiển hệ thống CODACO.

WebViewer chỉ sử dụng dữ liệu để:

Hiển thị.
Tìm kiếm.
Lọc.
Thống kê.
Xem lịch sử.
Xuất báo cáo.
21. Quy tắc query

Khi viết query cho WebViewer:

Phải
Sử dụng SELECT.
Xác định rõ trường cần lấy.
Giới hạn dữ liệu khi cần.
Dùng đúng khóa định danh.
Giữ nguyên tên trường database.
Không được
Ghi dữ liệu.
Thay đổi cấu trúc.
Thay đổi cấu hình database.
Tự tạo quan hệ không được xác nhận.
Tự suy đoán ý nghĩa của trường chưa được xác định.
22. Các lưu ý quan trọng
1. AccesorButtonId

Tên chính xác:

AccesorButtonId

Không phải:

ButtonId
2. Department identity

Không dùng riêng:

idDepartment

Dùng:

idSegment + idDepartment
3. Room identity

Không dùng riêng:

Room

Dùng:

idSegment + idDepartment + Room
4. Device count

Nguồn chính:

EndPoints

Không JOIN Patients chỉ để đếm thiết bị.

5. Read-only

WebViewer không được thay đổi database CODACO.

23. Trạng thái tài liệu

Tài liệu được xây dựng từ:

Database structure dump.
Database data dump.
Dữ liệu kiểm tra trực tiếp từ hệ thống CODACO.
Phân tích NCViewer.
Quá trình phát triển và kiểm thử WebViewer.

Schema hoặc hành vi chưa được xác minh phải được coi là chưa xác định, không tự suy đoán.

Khi phát hiện thêm thông tin về database, cập nhật tài liệu này trước khi dựa vào thông tin đó để thực hiện các thay đổi lớn trong WebViewer.