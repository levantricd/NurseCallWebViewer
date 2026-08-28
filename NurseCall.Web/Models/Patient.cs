namespace NurseCall.Web.Models;

public class Patient
{
    public int IdSegment { get; set; }
    public int IdDepartment { get; set; }
    public int Room { get; set; }
    public int Bed { get; set; }
    public int? IdPatient { get; set; }
    public int IdNeat { get; set; }
    public int WirelessButtonLowBat { get; set; }
    public int WirelessButtonType { get; set; }
    public int IdAccesor { get; set; }
    public string? TextA { get; set; }
    public string? TextB { get; set; }
    public string? DefaultTextA { get; set; }
    public string? DefaultTextB { get; set; }
    public int? BedFree { get; set; }
    public int? PriorityCare { get; set; }
    public string? Mac { get; set; }
    public int? Terminal { get; set; }
    public string? TerminalName { get; set; }
    public int TerminalConnected { get; set; }
}
