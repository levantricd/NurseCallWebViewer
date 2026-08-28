using NurseCall.Web.Data;
using NurseCall.Web.Models;

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
        const string sql = """
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

        var output = await _db.QueryAsync(sql);

        var lines = output
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

        var result = new List<ViewerDepartment>();

        if (lines.Length <= 1)
            return result;

        var headers = lines[0].Split('\t');

        foreach (var line in lines.Skip(1))
        {
            var columns = line.Split('\t');

            string Get(string name)
            {
                var index = Array.IndexOf(headers, name);

                if (index < 0 || index >= columns.Length)
                    return "";

                return columns[index] == "\\N"
                    ? ""
                    : columns[index];
            }

            var idSegment = int.Parse(Get("idSegment"));
            var idDepartment = int.Parse(Get("idDepartment"));

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

            if (!string.IsNullOrWhiteSpace(Get("Room")))
            {
                department.Endpoints.Add(new ViewerEndpoint
                {
                    Room = int.Parse(Get("Room")),
                    Bed = int.Parse(Get("Bed")),
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
        }

        return result;
    }

    private static int? GetNullableInt(string value)
    {
        return int.TryParse(value, out var result)
            ? result
            : null;
    }
}

public class ViewerDepartment
{
    public int IdSegment { get; set; }
    public int IdDepartment { get; set; }
    public string? Name { get; set; }
    public string? ShortName { get; set; }
    public List<ViewerEndpoint> Endpoints { get; set; } = new();
}

public class ViewerEndpoint
{
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