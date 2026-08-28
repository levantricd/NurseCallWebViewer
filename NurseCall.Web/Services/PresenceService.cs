using NurseCall.Web.Data;
using NurseCall.Web.Models;

namespace NurseCall.Web.Services;

public class PresenceService
{
    private readonly CodacoDb _db;

    public PresenceService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<List<Presence>> GetActiveAsync()
    {
        const string sql = """
            SELECT
                idSegment,
                idDepartment,
                Room,
                Bed,
                TypeOfPresence,
                IDCard,
                StartDate,
                StartTime
            FROM Presence
            ORDER BY
                idSegment,
                idDepartment,
                Room,
                Bed;
            """;

        var output = await _db.QueryAsync(sql);

        var lines = output
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

        var result = new List<Presence>();

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

            result.Add(new Presence
            {
                IdSegment = GetInt(Get("idSegment")),
                IdDepartment = GetInt(Get("idDepartment")),
                Room = GetInt(Get("Room")),
                Bed = GetInt(Get("Bed")),
                TypeOfPresence = GetInt(Get("TypeOfPresence")),
                IdCard = Get("IDCard"),
                StartDate = GetDate(Get("StartDate")),
                StartTime = GetTime(Get("StartTime"))
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

    private static DateTime? GetDate(string value)
    {
        return DateTime.TryParse(value, out var result)
            ? result.Date
            : null;
    }

    private static TimeSpan? GetTime(string value)
    {
        return TimeSpan.TryParse(value, out var result)
            ? result
            : null;
    }
}