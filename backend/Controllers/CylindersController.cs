using CylinderApi.Data;
using CylinderApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CylinderApi.Controllers;

[ApiController]
[Route("api/cylinders")]
public class CylindersController : ControllerBase
{
    private const int MaxPageSize = 50;
    private readonly AppDbContext _db;

    public CylindersController(AppDbContext db)
    {
        _db = db;
    }

    // Fetch Data Cylinders
    [HttpGet]
    public async Task<ActionResult<PagedResult<Cylinder>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1)
            ModelState.AddModelError("page", "Page must be 1 or greater.");
        if (pageSize < 1 || pageSize > MaxPageSize)
            ModelState.AddModelError("pageSize", $"Page size must be between 1 and {MaxPageSize}.");

        CylinderStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (CylinderRules.TryParseStatus(status, out var parsedStatus))
                statusFilter = parsedStatus;
            else
                ModelState.AddModelError("status", $"Status '{status}' is not recognized.");
        }

        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var query = _db.Cylinders.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().Normalize().ToUpperInvariant();
            query = query.Where(c => c.SearchKey.Contains(term));
        }

        if (statusFilter is CylinderStatus wantedStatus)
            query = query.Where(c => c.Status == wantedStatus);

        var totalCount = await query.CountAsync();
        var skip = (long)(page - 1) * pageSize;
        var items = skip >= totalCount
            ? new List<Cylinder>()
            : await query
                .OrderByDescending(c => c.LastUpdated)
                .ThenBy(c => c.Id)
                .Skip((int)skip)
                .Take(pageSize)
                .ToListAsync();

        return Ok(new PagedResult<Cylinder>(items, page, pageSize, totalCount));
    }

    // Fetch Each Cylinders Data
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Cylinder>> GetById(int id)
    {
        var cylinder = await _db.Cylinders.FindAsync(id);
        if (cylinder is null)
            return NotFoundProblem(id);

        return Ok(cylinder);
    }

    // Create New Data
    [HttpPost]
    public async Task<ActionResult<Cylinder>> Create(CylinderDataRequest request)
    {
        var (serial, gasType) = ValidateRequest(request);
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (await _db.Cylinders.AnyAsync(c => c.SerialNumber == serial))
            return DuplicateSerialProblem(serial);

        var cylinder = new Cylinder
        {
            SerialNumber = serial,
            GasType = gasType!,
            Status = CylinderStatus.Empty,
            CustomerName = null,
        };

        _db.Cylinders.Add(cylinder);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = cylinder.Id }, cylinder);
    }

    // Update Data 
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Cylinder>> Update(int id, CylinderDataRequest request)
    {
        var cylinder = await _db.Cylinders.FindAsync(id);
        if (cylinder is null)
            return NotFoundProblem(id);

        var (serial, gasType) = ValidateRequest(request);
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (await _db.Cylinders.AnyAsync(c => c.SerialNumber == serial && c.Id != id))
            return DuplicateSerialProblem(serial);

        cylinder.SerialNumber = serial;
        cylinder.GasType = gasType!;
        await _db.SaveChangesAsync();

        return Ok(cylinder);
    }

    // Update Status
    [HttpPost("{id:int}/status")]
    public async Task<ActionResult<Cylinder>> ChangeStatus(int id, StatusChangesRequest request)
    {
        var cylinder = await _db.Cylinders.FindAsync(id);
        if (cylinder is null)
            return NotFoundProblem(id);

        if (!CylinderRules.TryParseStatus(request.Status, out var newStatus))
        {
            ModelState.AddModelError("status", $"Status '{request.Status}' is not recognized.");
            return ValidationProblem(ModelState);
        }

        if (!CylinderRules.CanTransition(cylinder.Status, newStatus))
        {
            ModelState.AddModelError("status", $"Transition from {cylinder.Status} to {newStatus} is not allowed.");
            return ValidationProblem(ModelState);
        }

        string? customerName = null;
        if (newStatus == CylinderStatus.Delivered)
        {
            customerName = CylinderRules.NormalizeCustomerName(request.CustomerName);
            if (customerName is null)
                ModelState.AddModelError("customerName", "Customer name is required when the status is Delivered.");
            else if (customerName.Length > CylinderRules.CustomerNameMaxLength)
                ModelState.AddModelError("customerName", $"Customer name must not exceed {CylinderRules.CustomerNameMaxLength} characters.");

            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);
        }

        cylinder.Status = newStatus;
        cylinder.CustomerName = customerName;
        await _db.SaveChangesAsync();

        return Ok(cylinder);
    }

    // Helpers
    private (string Serial, string? GasType) ValidateRequest(CylinderDataRequest request)
    {
        var serial = CylinderRules.CleanSerialNum(request.SerialNumber);
        if (serial.Length == 0)
            ModelState.AddModelError("serialNumber", "Serial number is required.");
        else if (!CylinderRules.IsValidSerial(serial))
            ModelState.AddModelError("serialNumber", "Serial number must follow the format CYL- followed by 6 digits (e.g. CYL-000123).");

        var gasType = CylinderRules.NormalizeGasType(request.GasType);
        if (gasType is null)
            ModelState.AddModelError("gasType", $"Gas type must be one of: {string.Join(", ", CylinderRules.GasTypes)}.");

        return (serial, gasType);
    }

    private ObjectResult NotFoundProblem(int id) =>
        Problem(statusCode: StatusCodes.Status404NotFound, title: $"Cylinder with id {id} was not found.");

    private ObjectResult DuplicateSerialProblem(string serial) =>
        Problem(statusCode: StatusCodes.Status409Conflict, title: $"Serial number {serial} is already registered.");
}