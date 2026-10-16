namespace CylinderApi.Models;

public record CylinderDataRequest(string? SerialNumber, string? GasType);
public record StatusChangesRequest(string? Status, string? CustomerName);
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);