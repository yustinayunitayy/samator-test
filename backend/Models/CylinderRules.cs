using System.Text.RegularExpressions;

namespace CylinderApi.Models;

public static class CylinderRules
{
    // Additional Instruction Rules
    public static readonly Regex SerialNumberPattern = new("^CYL-[0-9]{6}$");
    public static readonly string[] GasTypes = ["Oxygen", "Nitrogen", "Argon", "Carbon Dioxide", "Acetylene", "Hydrogen"];
    private static readonly Dictionary<CylinderStatus, CylinderStatus[]> AllowedTransitions = new()
    {
        [CylinderStatus.Empty] = new[] { CylinderStatus.Filled, CylinderStatus.InMaintenance, CylinderStatus.Retired },
        [CylinderStatus.Filled] = new[] { CylinderStatus.Delivered, CylinderStatus.InMaintenance, CylinderStatus.Retired },
        [CylinderStatus.Delivered] = new[] { CylinderStatus.Empty },
        [CylinderStatus.InMaintenance] = new[] { CylinderStatus.Empty, CylinderStatus.Retired },
        [CylinderStatus.Retired] = Array.Empty<CylinderStatus>(),
    };
    public const int CustomerNameMaxLength = 120;

    // Rules to anticipate the Problem Background (Data Formatting Cleaning)
    public static string CleanSerialNum(string? value) => (value ?? string.Empty).Trim().ToUpperInvariant();
    public static bool IsValidSerial(string normalizedSerial) => SerialNumberPattern.IsMatch(normalizedSerial);
    public static string? NormalizeGasType(string? value) => GasTypes.FirstOrDefault(g => string.Equals(g, value?.Trim(), StringComparison.OrdinalIgnoreCase));
    public static bool TryParseStatus(string? value, out CylinderStatus status)
    {
        status = default;
        var name = Enum.GetNames<CylinderStatus>().FirstOrDefault(n => string.Equals(n, value?.Trim(), StringComparison.OrdinalIgnoreCase));
        if (name is null)
            return false;
        status = Enum.Parse<CylinderStatus>(name);
        return true;
    }

    public static string? NormalizeCustomerName(string? value)
    {
        var trimmed = value?.Trim().Normalize();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    public static bool CanTransition(CylinderStatus from, CylinderStatus to) => AllowedTransitions[from].Contains(to);
}