namespace NurseCall.Web.Models;

public class History
{
    public int IdRecord { get; set; }
    public int? IdSegment { get; set; }
    public int? IdDepartment { get; set; }
    public int? Room { get; set; }
    public int? Bed { get; set; }
    public int? TypeOfCall { get; set; }
    public int? TypeOfPresence { get; set; }
    public int? IdPatient { get; set; }
    public string? TextA { get; set; }
    public string? TextB { get; set; }
    public string? IdCard { get; set; }
    public DateTime? StartDate { get; set; }
    public TimeSpan? StartTime { get; set; }
    public DateTime? StopDate { get; set; }
    public TimeSpan? StopTime { get; set; }
    public int NeatATOMEvent { get; set; }
    public int NeatATOMId { get; set; }
    public int NeatATOMRoom { get; set; }
    public int NeatATOMBed { get; set; }
    public string? NeatATOMInfo { get; set; }
    public int AccesorEvent { get; set; }
    public int AccesorButtonId { get; set; }
    public int AccesorRoom { get; set; }
    public int AccesorBed { get; set; }
    public string? AccesorInfo { get; set; }
}
