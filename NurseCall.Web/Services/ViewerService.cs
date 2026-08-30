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
                e.ErrorCode,

                p.TextA AS PatientTextA,
                p.TextB AS PatientTextB,
                p.BedFree,
                p.PriorityCare,
                p.Terminal,
                p.TerminalName,
                p.TerminalConnected,
                p.WirelessButtonLowBat,
                p.WirelessButtonType,
                p.IdNeat,
                p.IdAccesor

            FROM Departments d

            LEFT JOIN EndPoints e
                ON e.idSegment = d.idSegment
                AND e.idDepartment = d.idDepartment

            LEFT JOIN Patients p
                ON p.MAC = e.MAC

            ORDER BY
                d.idSegment,
                d.idDepartment,
                e.Room,
                e.Bed;
            """;

        var output = await _db.QueryAsync(sql);

        var lines = output
            .Split(
                new[] { '\r', '\n' },
                StringSplitOptions.RemoveEmptyEntries);

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

            department.Endpoints.Add(new ViewerEndpoint
            {
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
                ErrorCode = GetNullableInt(Get("ErrorCode")),

                // Patient
                PatientTextA = Get("PatientTextA"),
                PatientTextB = Get("PatientTextB"),

                BedFree = GetNullableInt(Get("BedFree")),
                PriorityCare = GetNullableInt(Get("PriorityCare")),

                Terminal = GetNullableInt(Get("Terminal")),
                TerminalName = Get("TerminalName"),
                TerminalConnected =
                    GetNullableInt(Get("TerminalConnected")),

                WirelessButtonLowBat =
                    GetNullableInt(Get("WirelessButtonLowBat")),

                WirelessButtonType =
                    GetNullableInt(Get("WirelessButtonType")),

                IdNeat = GetNullableInt(Get("IdNeat")),
                IdAccesor = GetNullableInt(Get("IdAccesor"))
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


    // =========================
    // PATIENT
    // =========================

    public string? PatientTextA { get; set; }

    public string? PatientTextB { get; set; }

    public int? BedFree { get; set; }

    public int? PriorityCare { get; set; }


    // =========================
    // TERMINAL
    // =========================

    public int? Terminal { get; set; }

    public string? TerminalName { get; set; }

    public int? TerminalConnected { get; set; }


    // =========================
    // WIRELESS BUTTON
    // =========================

    public int? WirelessButtonLowBat { get; set; }

    public int? WirelessButtonType { get; set; }


    // =========================
    // HARDWARE IDENTIFIERS
    // =========================

    public int? IdNeat { get; set; }

    public int? IdAccesor { get; set; }
}