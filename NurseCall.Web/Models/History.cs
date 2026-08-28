namespace NurseCall.Web.Models;

public class History
{
    public int? IdRecord { get; set; }

    public int? IdSegment { get; set; }

    public int? IdDepartment { get; set; }

    public int? Room { get; set; }

    public int? Bed { get; set; }

    public int? TypeOfCall { get; set; }

    public int? TypeOfPresence { get; set; }

    public int? IdPatient { get; set; }

    public string? TextA { get; set; }

    public string? TextB { get; set; }

    public string? StartDate { get; set; }

    public string? StartTime { get; set; }

    public string? StopDate { get; set; }

    public string? StopTime { get; set; }
}