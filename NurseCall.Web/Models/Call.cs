namespace NurseCall.Web.Models;

public class Call
{
    public int? IdSegment { get; set; }
    public int? IdDepartment { get; set; }
    public int? Room { get; set; }
    public int? Bed { get; set; }
    public int? TypeOfCall { get; set; }
    public int? OrderIndex { get; set; }
    public int? Priority { get; set; }
    public string? CallerIp { get; set; }
    public string? CallerTextA { get; set; }
    public string? CallerTextB { get; set; }
    public int? CallerExtBed { get; set; }
    public int? PriorityCare { get; set; }
    public int NeatATOMEvent { get; set; }
    public int NeatATOMId { get; set; }
    public int AccesorEvent { get; set; }
    public int AccesorButtonId { get; set; }
}
