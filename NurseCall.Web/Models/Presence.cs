namespace NurseCall.Web.Models;

public class Presence
{
    public int? IdSegment { get; set; }
    public int? IdDepartment { get; set; }
    public int? Room { get; set; }
    public int? Bed { get; set; }
    public int? TypeOfPresence { get; set; }
    public string? IdCard { get; set; }
    public DateTime? StartDate { get; set; }
    public TimeSpan? StartTime { get; set; }
}
