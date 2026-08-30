using NurseCall.Web.Data;

namespace NurseCall.Web.Services;

public class ViewerService
{
    private readonly CodacoDb _db;

    public ViewerService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<List<ViewerDepartment>> GetAsync()
    {
        const string endpointSql = """
            SELECT
                d.idSegment,
                d.idDepartment,
                d.Name AS DepartmentName,
                d.ShortName,

                e.Room,
                e.Bed,
                e.idPatient,
                e.ExtBedsCount,
                e.MAC,
                e.Type,
                e.TypeName,
                e.Module,
                e.ModuleName,
                e.PbxId,
                e.State,
                e.ErrorCode

            FROM Departments d

            LEFT JOIN EndPoints e
                ON e.idSegment = d.idSegment
                AND e.idDepartment = d.idDepartment

            ORDER BY
                d.idSegment,
                d.idDepartment,
                e.Room,
                e.Bed;
            """;

        var endpointOutput = await _db.QueryAsync(endpointSql);

        var endpointLines = endpointOutput
            .Split(
                new[] { '\r', '\n' },
                StringSplitOptions.RemoveEmptyEntries);

        var result = new List<ViewerDepartment>();

        if (endpointLines.Length <= 1)
            return result;

        var endpointHeaders = endpointLines[0].Split('\t');

        foreach (var line in endpointLines.Skip(1))
        {
            var columns = line.Split('\t');

            string Get(string name)
            {
                var index = Array.IndexOf(endpointHeaders, name);

                if (index < 0 || index >= columns.Length)
                    return "";

                return columns[index] == "\\N"
                    ? ""
                    : columns[index];
            }

            if (!int.TryParse(Get("idSegment"), out var idSegment))
                continue;

            if (!int.TryParse(Get("idDepartment"), out var idDepartment))
                continue;

            var department = result.FirstOrDefault(x =>
                x.IdSegment == idSegment &&
                x.IdDepartment == idDepartment);

            if (department == null)
            {
                department = new ViewerDepartment
                {
                    IdSegment = idSegment,
                    IdDepartment = idDepartment,
                    Name = Get("DepartmentName"),
                    ShortName = Get("ShortName")
                };

                result.Add(department);
            }

            if (!int.TryParse(Get("Room"), out var room))
                continue;

            /*
             * QUAN TRỌNG:
             *
             * EndPoints là nguồn xác định số lượng thiết bị.
             * Không được JOIN Patients ở đây vì Patients có thể
             * chứa nhiều record cho cùng một MAC.
             */
            department.Endpoints.Add(new ViewerEndpoint
            {
                IdSegment = idSegment,
                IdDepartment = idDepartment,

                Room = room,
                Bed = GetInt(Get("Bed")),

                IdPatient = GetNullableInt(Get("idPatient")),
                ExtBedsCount = GetNullableInt(Get("ExtBedsCount")),

                Mac = Get("MAC"),

                Type = GetNullableInt(Get("Type")),
                TypeName = Get("TypeName"),

                Module = GetNullableInt(Get("Module")),
                ModuleName = Get("ModuleName"),

                PbxId = Get("PbxId"),

                State = GetNullableInt(Get("State")),
                ErrorCode = GetNullableInt(Get("ErrorCode"))
            });
        }

        return result;
    }

    private static int GetInt(string value)
    {
        return int.TryParse(value, out var result)
            ? result
            : 0;
    }

    private static int? GetNullableInt(string value)
    {
        return int.TryParse(value, out var result)
            ? result
            : null;
    }
}


// ================================================================
// DEPARTMENT
// ================================================================

public class ViewerDepartment
{
    public int IdSegment { get; set; }

    public int IdDepartment { get; set; }

    public string? Name { get; set; }

    public string? ShortName { get; set; }

    public List<ViewerEndpoint> Endpoints { get; set; } = new();
}


// ================================================================
// ENDPOINT
// ================================================================

public class ViewerEndpoint
{
    public int IdSegment { get; set; }

    public int IdDepartment { get; set; }

    public int Room { get; set; }

    public int Bed { get; set; }

    public int? IdPatient { get; set; }

    public int? ExtBedsCount { get; set; }

    public string? Mac { get; set; }

    public int? Type { get; set; }

    public string? TypeName { get; set; }

    public int? Module { get; set; }

    public string? ModuleName { get; set; }

    public string? PbxId { get; set; }

    public int? State { get; set; }

    public int? ErrorCode { get; set; }
}