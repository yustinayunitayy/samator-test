using System.Text.Json.Serialization;

namespace CylinderApi.Models;

public class Cylinder
{
    public int Id { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string GasType { get; set; } = string.Empty;
    public CylinderStatus Status { get; set; }
    public string? CustomerName { get; set; }
    public DateTime LastUpdated { get; set; }

    [JsonIgnore]
    public string SearchKey { get; set; } = string.Empty;
}

public enum CylinderStatus
{
    Empty, Filled, Delivered, InMaintenance, Retired
}