using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Models;

namespace SocManagement.Api.Data;

public class SocDbContext(DbContextOptions<SocDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.Email)
                .HasMaxLength(254)
                .IsRequired();

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.Name)
                .HasMaxLength(100);

            entity.Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(u => u.Status)
                .HasConversion<string>()
                .HasMaxLength(20);
                
            entity.HasData(SeedUsers.GetUsers());  
        });
    }

}

