namespace NurseCall.Web.Models;

public class HardwareState
{
    public int IdSegment { get; set; }
    public int IdDepartment { get; set; }
    public int Room { get; set; }
    public int Position { get; set; }
    public string? ElementName { get; set; }
    public string? MacAddr { get; set; }
    public string? IpAddr { get; set; }
    public int ErrorState { get; set; }
    public DateTime Timestamp { get; set; }
}
