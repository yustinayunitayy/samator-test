namespace CylinderApi.Models;

public record CylinderDataRequest(string? SerialNumber, string? GasType);
public record StatusChangesRequest(string? Status, string? CustomerName);
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);
public record IdleCylinder(int Id, string SerialNumber, string Status, int IdleDays);
public record CylinderSummary(
    int Total,
    int Active,
    int ActiveCustomers,
    int Utilization,
    int IdleCount,
    Dictionary<string, int> ByStatus,
    Dictionary<string, int> ByGasType,
    Dictionary<string, int> MovementByMonth,
    List<IdleCylinder> IdleCylinders);