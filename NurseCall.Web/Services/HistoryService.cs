using NurseCall.Web.Data;

namespace NurseCall.Web.Services;

public class HistoryService
{
    private readonly CodacoDb _db;

    public HistoryService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<List<Dictionary<string, string?>>> GetRecentAsync(int limit = 50)
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

        var result = new List<Dictionary<string, string?>>();

        var lines = output
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

        if (lines.Length <= 1)
            return result;

        var headers = lines[0].Split('\t');

        foreach (var line in lines.Skip(1))
        {
            var columns = line.Split('\t');
            var row = new Dictionary<string, string?>();

            for (var i = 0; i < headers.Length; i++)
            {
                row[headers[i]] =
                    i < columns.Length && columns[i] != "\\N"
                        ? columns[i]
                        : null;
            }

            result.Add(row);
        }

        return result;
    }
}
