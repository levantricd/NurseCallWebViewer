using ClosedXML.Excel;
using NurseCall.Web.Data;
using NurseCall.Web.Models;

namespace NurseCall.Web.Services;

public class HistoryService
{
    private readonly CodacoDb _db;

    public HistoryService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<List<History>> GetRecentAsync(int limit = 50)
    {
        limit = Math.Clamp(limit, 1, 200);

        var sql = $"""
            SELECT
                idRecord,
                idSegment,
                idDepartment,
                Room,
                Bed,
                TypeOfCall,
                TypeOfPresence,
                idPatient,
                TextA,
                TextB,
                StartDate,
                StartTime,
                StopDate,
                StopTime
            FROM History
            ORDER BY StartDate DESC, StartTime DESC
            LIMIT {limit};
            """;

        return await ExecuteQueryAsync(sql);
    }

    public async Task<List<History>> GetFilteredAsync(
        int? idSegment = null,
        int? idDepartment = null,
        int? room = null,
        string? fromDate = null,
        string? toDate = null,
        int limit = 10000)
    {
        limit = Math.Clamp(limit, 1, 50000);

        var conditions = new List<string>();

        if (idSegment.HasValue)
            conditions.Add($"idSegment = {idSegment.Value}");

        if (idDepartment.HasValue)
            conditions.Add($"idDepartment = {idDepartment.Value}");

        if (room.HasValue)
            conditions.Add($"Room = {room.Value}");

        if (!string.IsNullOrWhiteSpace(fromDate) &&
            DateTime.TryParse(fromDate, out var parsedFromDate))
        {
            conditions.Add(
                $"StartDate >= '{parsedFromDate:yyyy-MM-dd}'");
        }

        if (!string.IsNullOrWhiteSpace(toDate) &&
            DateTime.TryParse(toDate, out var parsedToDate))
        {
            conditions.Add(
                $"StartDate <= '{parsedToDate:yyyy-MM-dd}'");
        }

        var whereClause =
            conditions.Count > 0
                ? "WHERE " + string.Join(" AND ", conditions)
                : "";

        var sql = $"""
            SELECT
                idRecord,
                idSegment,
                idDepartment,
                Room,
                Bed,
                TypeOfCall,
                TypeOfPresence,
                idPatient,
                TextA,
                TextB,
                StartDate,
                StartTime,
                StopDate,
                StopTime
            FROM History
            {whereClause}
            ORDER BY StartDate DESC, StartTime DESC
            LIMIT {limit};
            """;

        return await ExecuteQueryAsync(sql);
    }

    public async Task<byte[]> ExportExcelAsync(
        int? idSegment = null,
        int? idDepartment = null,
        int? room = null,
        string? fromDate = null,
        string? toDate = null)
    {
        var records = await GetFilteredAsync(
            idSegment,
            idDepartment,
            room,
            fromDate,
            toDate,
            50000);

        using var workbook = new XLWorkbook();

        var worksheet =
            workbook.Worksheets.Add("Lịch sử cuộc gọi");

        var headers = new[]
        {
            "ID",
            "Segment",
            "Khoa",
            "Phòng",
            "Giường",
            "Loại cuộc gọi",
            "Hiện diện",
            "ID bệnh nhân",
            "Nội dung A",
            "Nội dung B",
            "Ngày bắt đầu",
            "Giờ bắt đầu",
            "Ngày kết thúc",
            "Giờ kết thúc",
            "Thời gian"
        };

        for (var i = 0; i < headers.Length; i++)
        {
            worksheet.Cell(1, i + 1).Value = headers[i];
        }

        var headerRange =
            worksheet.Range(
                1,
                1,
                1,
                headers.Length);

        headerRange.Style.Font.Bold = true;
        headerRange.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        var row = 2;

        foreach (var record in records)
        {
            worksheet.Cell(row, 1).Value =
                record.IdRecord ?? 0;

            worksheet.Cell(row, 2).Value =
                record.IdSegment ?? 0;

            worksheet.Cell(row, 3).Value =
                record.IdDepartment ?? 0;

            worksheet.Cell(row, 4).Value =
                record.Room ?? 0;

            worksheet.Cell(row, 5).Value =
                record.Bed ?? 0;

            worksheet.Cell(row, 6).Value =
                GetCallTypeName(record.TypeOfCall);

            worksheet.Cell(row, 7).Value =
                GetPresenceName(record.TypeOfPresence);

            worksheet.Cell(row, 8).Value =
                record.IdPatient ?? 0;

            worksheet.Cell(row, 9).Value =
                record.TextA ?? "";

            worksheet.Cell(row, 10).Value =
                record.TextB ?? "";

            worksheet.Cell(row, 11).Value =
                record.StartDate ?? "";

            worksheet.Cell(row, 12).Value =
                record.StartTime ?? "";

            worksheet.Cell(row, 13).Value =
                record.StopDate ?? "";

            worksheet.Cell(row, 14).Value =
                record.StopTime ?? "";

            worksheet.Cell(row, 15).Value =
                CalculateDuration(
                    record.StartDate,
                    record.StartTime,
                    record.StopDate,
                    record.StopTime);

            row++;
        }

        worksheet.Columns().AdjustToContents();

        worksheet.SheetView.FreezeRows(1);

        using var stream = new MemoryStream();

        workbook.SaveAs(stream);

        return stream.ToArray();
    }

    private async Task<List<History>> ExecuteQueryAsync(
        string sql)
    {
        var output = await _db.QueryAsync(sql);

        var result = new List<History>();

        var lines = output
            .Split(
                new[] { '\r', '\n' },
                StringSplitOptions.RemoveEmptyEntries);

        if (lines.Length <= 1)
            return result;

        var headers = lines[0].Split('\t');

        foreach (var line in lines.Skip(1))
        {
            var columns = line.Split('\t');

            string Get(string name)
            {
                var index =
                    Array.IndexOf(headers, name);

                if (index < 0 ||
                    index >= columns.Length)
                {
                    return "";
                }

                return columns[index] == "\\N"
                    ? ""
                    : columns[index];
            }

            result.Add(new History
            {
                IdRecord =
                    GetInt(Get("idRecord")),

                IdSegment =
                    GetInt(Get("idSegment")),

                IdDepartment =
                    GetInt(Get("idDepartment")),

                Room =
                    GetInt(Get("Room")),

                Bed =
                    GetInt(Get("Bed")),

                TypeOfCall =
                    GetInt(Get("TypeOfCall")),

                TypeOfPresence =
                    GetInt(Get("TypeOfPresence")),

                IdPatient =
                    GetInt(Get("idPatient")),

                TextA =
                    Get("TextA"),

                TextB =
                    Get("TextB"),

                StartDate =
                    Get("StartDate"),

                StartTime =
                    Get("StartTime"),

                StopDate =
                    Get("StopDate"),

                StopTime =
                    Get("StopTime")
            });
        }

        return result;
    }

    private static int? GetInt(string value)
    {
        return int.TryParse(
            value,
            out var result)
            ? result
            : null;
    }

    private static string GetCallTypeName(
        int? typeOfCall)
    {
        return typeOfCall switch
        {
            1 => "Voice call 1",
            2 => "Voice call 2",
            3 => "Room call",
            4 => "Patient emergency",
            5 => "Emergency",
            6 => "Nurse emergency",
            7 => "Service",
            8 => "Alarm",
            9 => "Doctor",
            10 => "Blue code",
            24 => "Disconnect",
            _ => typeOfCall?.ToString() ?? ""
        };
    }

    private static string GetPresenceName(
        int? typeOfPresence)
    {
        return typeOfPresence switch
        {
            1 => "Điều dưỡng",
            2 => "Điều dưỡng",
            3 => "Bác sĩ",
            _ => typeOfPresence?.ToString() ?? ""
        };
    }

    private static string CalculateDuration(
        string? startDate,
        string? startTime,
        string? stopDate,
        string? stopTime)
    {
        if (string.IsNullOrWhiteSpace(startDate) ||
            string.IsNullOrWhiteSpace(startTime) ||
            string.IsNullOrWhiteSpace(stopDate) ||
            string.IsNullOrWhiteSpace(stopTime))
        {
            return "";
        }

        if (!DateTime.TryParse(
                $"{startDate} {startTime}",
                out var start))
        {
            return "";
        }

        if (!DateTime.TryParse(
                $"{stopDate} {stopTime}",
                out var stop))
        {
            return "";
        }

        var seconds = Math.Max(
            0,
            (int)(stop - start).TotalSeconds);

        var minutes = seconds / 60;
        var remainingSeconds = seconds % 60;

        if (minutes == 0)
            return $"{remainingSeconds}s";

        return $"{minutes}m {remainingSeconds}s";
    }
}