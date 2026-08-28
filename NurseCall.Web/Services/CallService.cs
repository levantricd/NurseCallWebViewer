using NurseCall.Web.Data;
using NurseCall.Web.Models;

namespace NurseCall.Web.Services;

public class CallService
{
    private readonly CodacoDb _db;

    public CallService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<List<Call>> GetActiveAsync()
    {
        const string sql = """
            SELECT
                idSegment,
                idDepartment,
                Room,
                Bed,
                TypeOfCall,
                OrderIndex,
                Priority,
                CallerIp,
                CallerTextA,
                CallerTextB,
                CallerExtBed,
                PriorityCare,
                NeatATOM_Event,
                NeatATOM_Id,
                AccesorEvent,
                AccesorButtonId
            FROM Calls
            ORDER BY
                Priority DESC,
                OrderIndex ASC;
            """;

        var output = await _db.QueryAsync(sql);

        var lines = output
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

        var result = new List<Call>();

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

            result.Add(new Call
            {
                IdSegment = GetInt(Get("idSegment")),
                IdDepartment = GetInt(Get("idDepartment")),
                Room = GetInt(Get("Room")),
                Bed = GetInt(Get("Bed")),
                TypeOfCall = GetInt(Get("TypeOfCall")),
                OrderIndex = GetInt(Get("OrderIndex")),
                Priority = GetInt(Get("Priority")),
                CallerIp = Get("CallerIp"),
                CallerTextA = Get("CallerTextA"),
                CallerTextB = Get("CallerTextB"),
                CallerExtBed = GetInt(Get("CallerExtBed")),
                PriorityCare = GetInt(Get("PriorityCare")),
                NeatATOMEvent = GetInt(Get("NeatATOM_Event")) ?? 0,
                NeatATOMId = GetInt(Get("NeatATOM_Id")) ?? 0,
                AccesorEvent = GetInt(Get("AccesorEvent")) ?? 0,
                AccesorButtonId = GetInt(Get("AccesorButtonId")) ?? 0
            });
        }

        return result;
    }

    private static int? GetInt(string value)
    {
        return int.TryParse(value, out var result)
            ? result
            : null;
    }
}