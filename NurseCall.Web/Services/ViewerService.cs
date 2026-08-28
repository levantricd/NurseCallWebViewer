using NurseCall.Web.Data;

namespace NurseCall.Web.Services;

public class ViewerService
{
    private readonly CodacoDb _db;

    public ViewerService(CodacoDb db)
    {
        _db = db;
    }

    public async Task<string> GetRawSnapshotAsync()
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

        return await _db.QueryAsync(sql);
    }
}
