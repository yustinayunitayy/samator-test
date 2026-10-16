using System.Text.Json;
using CylinderApi.Models;

namespace CylinderApi.Data;

public static class SeedData
{
    public static void Seed(AppDbContext db, string jsonPath, ILogger logger)
    {
        // Skip seeding if the database already contains data or the seed file is missing
        if (db.Cylinders.Any() || !File.Exists(jsonPath))
            return;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var records = JsonSerializer.Deserialize<List<SeedRecord>>(File.ReadAllText(jsonPath), options)
                      ?? new List<SeedRecord>();
        var seenSerials = new HashSet<string>();

        foreach (var r in records)
        {
            var serial = CylinderRules.CleanSerialNum(r.SerialNumber);
            var gasType = CylinderRules.NormalizeGasType(r.GasType);
            CylinderStatus status = default;

            // Invalid Seeding Reason
            var reason =
                !CylinderRules.IsValidSerial(serial) ? "invalid serial number format" :
                gasType is null ? $"unrecognized gas type '{r.GasType}'" :
                !CylinderRules.TryParseStatus(r.Status, out status) ? $"unrecognized status '{r.Status}'" :
                !seenSerials.Add(serial) ? "duplicate serial number" :
                null;

            if (reason is not null)
            {
                logger.LogWarning("Skipped record {Serial}: {Reason}.", r.SerialNumber, reason);
                continue;
            }

            // Customer name is only retained for Delivered cylinders (Rules in Additional Instruction)
            var customerName = status == CylinderStatus.Delivered
                ? CylinderRules.NormalizeCustomerName(r.CustomerName)
                : null;

            if (status == CylinderStatus.Delivered && customerName is null)
                logger.LogWarning("Imported record {Serial} with status Delivered but no customer name.", serial);

            db.Cylinders.Add(new Cylinder
            {
                SerialNumber = serial,
                GasType = gasType!,
                Status = status,
                CustomerName = customerName,
                LastUpdated = r.LastUpdated?.ToUniversalTime() ?? DateTime.UtcNow,
            });
        }

        db.SaveChanges();
        logger.LogInformation("Seeding completed: {Count} of {Total} records imported.", db.Cylinders.Count(), records.Count);
    }

    // Raw record shape from the JSON file
    private record SeedRecord(string? SerialNumber, string? GasType, string? Status, string? CustomerName, DateTime? LastUpdated);
}