using NurseCall.Web.Data;
using NurseCall.Web.Models;

namespace NurseCall.Web.Services;

public class DepartmentService
{
    private readonly CodacoDb _db;

    public DepartmentService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<List<Department>> GetAllAsync()
    {
        const string sql = """
            SELECT
                idSegment,
                idDepartment,
                Name,
                ShortName,
                CountEndPoints
            FROM Departments
            ORDER BY idSegment, idDepartment;
            """;

        var output = await _db.QueryAsync(sql);

        var result = new List<Department>();

        var lines = output
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

        if (lines.Length <= 1)
            return result;

        foreach (var line in lines.Skip(1))
        {
            var columns = line.Split('\t');

            if (columns.Length < 5)
                continue;

            result.Add(new Department
            {
                IdSegment = int.Parse(columns[0]),
                IdDepartment = int.Parse(columns[1]),
                Name = string.IsNullOrEmpty(columns[2]) ? null : columns[2],
                ShortName = string.IsNullOrEmpty(columns[3]) ? null : columns[3],
                CountEndPoints = string.IsNullOrEmpty(columns[4])
                    ? null
                    : int.Parse(columns[4])
            });
        }

        return result;
    }
}
