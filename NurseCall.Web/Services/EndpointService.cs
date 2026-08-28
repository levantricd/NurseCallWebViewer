using NurseCall.Web.Data;

namespace NurseCall.Web.Services;

public class EndpointService
{
    private readonly CodacoDb _db;

    public EndpointService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<List<Dictionary<string, string?>>> GetAllAsync()
    {
        const string sql = """
            SELECT
                idSegment,
                idDepartment,
                Room,
                Bed,
                idPatient,
                NeatDPOS_Address,
                TextA,
                TextB,
                ExtBedsCount,
                MAC,
                Type,
                TypeName,
                Module,
                ModuleName,
                PbxId,
                State,
                ErrorCode
            FROM EndPoints
            ORDER BY idSegment, idDepartment, Room, Bed;
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
