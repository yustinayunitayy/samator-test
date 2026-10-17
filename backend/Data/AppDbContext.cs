using CylinderApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CylinderApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Cylinder> Cylinders => Set<Cylinder>();

    // Table Rules
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var cylinder = modelBuilder.Entity<Cylinder>();
        cylinder.HasIndex(c => c.SerialNumber).IsUnique();
        cylinder.Property(c => c.Status).HasConversion<string>();
        cylinder.Property(c => c.LastUpdated).HasConversion(v=>v, v=>DateTime.SpecifyKind(v,DateTimeKind.Utc));
    }
    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyServerRules();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ApplyServerRules();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ApplyServerRules()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<Cylinder>())
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified))
                continue;

            if (entry.State == EntityState.Modified || entry.Entity.LastUpdated == default)
                entry.Entity.LastUpdated = now;

            entry.Entity.SearchKey = $"{entry.Entity.SerialNumber} {entry.Entity.CustomerName}".Normalize().ToUpperInvariant();
        }
    }
}