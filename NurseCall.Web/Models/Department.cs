namespace NurseCall.Web.Models;

public class Department
{
    public int IdSegment { get; set; }
    public int IdDepartment { get; set; }
    public string? Name { get; set; }
    public string? ShortName { get; set; }
    public int? CountEndPoints { get; set; }
}
