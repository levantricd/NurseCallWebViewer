using NurseCall.Web.Data;
using NurseCall.Web.Models;

namespace NurseCall.Web.Services;

public class HardwareService
{
    private readonly CodacoDb _db;

    public HardwareService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<List<HardwareState>> GetAllAsync()
    {
        const string sql = """
            SELECT
                idSegment,
                idDepartment,
                Room,
                Position,
                ElementName,
                MacAddr,
                IpAddr,
                ErrorState,
                Timestamp
            FROM HardwareState
            ORDER BY
                idSegment,
                idDepartment,
                Room,
                Position;
            """;

        var output = await _db.QueryAsync(sql);

        var lines = output
            .Split(
                new[] { '\r', '\n' },
                StringSplitOptions.RemoveEmptyEntries);

        var result = new List<HardwareState>();

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

            if (!int.TryParse(Get("Room"), out var room))
                continue;

            var state = new HardwareState
            {
                IdSegment = idSegment,
                IdDepartment = idDepartment,
                Room = room,

                Position = GetInt(Get("Position")),

                ElementName = Get("ElementName"),
                MacAddr = Get("MacAddr"),
                IpAddr = Get("IpAddr"),

                ErrorState = GetInt(Get("ErrorState")),

                Timestamp = GetDateTime(Get("Timestamp"))
            };

            result.Add(state);
        }

        return result;
    }

    private static int GetInt(string value)
    {
        return int.TryParse(value, out var result)
            ? result
            : 0;
    }

    private static DateTime GetDateTime(string value)
    {
        return DateTime.TryParse(value, out var result)
            ? result
            : DateTime.MinValue;
    }
}