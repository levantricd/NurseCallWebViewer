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

        var output = await _db.QueryAsync(sql);

        var result = new List<History>();

        var lines = output
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

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

            result.Add(new History
            {
                IdRecord = GetInt(Get("idRecord")),
                IdSegment = GetInt(Get("idSegment")),
                IdDepartment = GetInt(Get("idDepartment")),
                Room = GetInt(Get("Room")),
                Bed = GetInt(Get("Bed")),
                TypeOfCall = GetInt(Get("TypeOfCall")),
                TypeOfPresence = GetInt(Get("TypeOfPresence")),
                IdPatient = GetInt(Get("idPatient")),
                TextA = Get("TextA"),
                TextB = Get("TextB"),
                StartDate = Get("StartDate"),
                StartTime = Get("StartTime"),
                StopDate = Get("StopDate"),
                StopTime = Get("StopTime")
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