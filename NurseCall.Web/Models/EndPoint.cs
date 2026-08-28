namespace NurseCall.Web.Models;

public class EndPoint
{
    public int IdSegment { get; set; }
    public int IdDepartment { get; set; }
    public int Room { get; set; }
    public int Bed { get; set; }
    public int? IdPatient { get; set; }
    public int NeatDPOSAddress { get; set; }
    public string? TextA { get; set; }
    public string? TextB { get; set; }
    public int? ExtBedsCount { get; set; }
    public string? Mac { get; set; }
    public int? Type { get; set; }
    public string? TypeName { get; set; }
    public int? Module { get; set; }
    public string? ModuleName { get; set; }
    public string? PbxId { get; set; }
    public int? State { get; set; }
    public int? ErrorCode { get; set; }
}
