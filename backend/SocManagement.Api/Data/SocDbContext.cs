using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Models;

namespace SocManagement.Api.Data;

public class SocDbContext(DbContextOptions<SocDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Communication> Communications => Set<Communication>();
    public DbSet<TicketHistory> TicketHistories => Set<TicketHistory>();
    public DbSet<SLA> Slas => Set<SLA>();
    public DbSet<RetentionPolicy> RetentionPolicies => Set<RetentionPolicy>();
    

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

