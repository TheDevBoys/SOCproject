using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Models;

namespace SocManagement.Api.Data;

public class SocDbContext(DbContextOptions<SocDbContext> options) : DbContext(options), IDataProtectionKeyContext
{
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Communication> Communications => Set<Communication>();
    public DbSet<TicketHistory> TicketHistories => Set<TicketHistory>();
    public DbSet<SLA> Slas => Set<SLA>();
    public DbSet<RetentionPolicy> RetentionPolicies => Set<RetentionPolicy>();
    public DbSet<CustomerAccess> CustomerAccesses => Set<CustomerAccess>();
    public DbSet<UserInvitation> UserInvitations => Set<UserInvitation>();
    

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

            entity.Property(u => u.MfaSecret)
                .HasMaxLength(512);

            entity.Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(u => u.Status)
                .HasConversion<string>()
                .HasMaxLength(20);
                
            // Klantgebruiker -> klant. Restrict: een klant met accounts kan niet zomaar
            // verwijderd worden, en voorkomt meerdere cascade-paden naar CustomerAccesses.
            entity.HasOne(u => u.Customer)
                .WithMany(c => c.Users)
                .HasForeignKey(u => u.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserInvitation>(entity =>
        {
            entity.Property(i => i.TokenHash)
                .HasMaxLength(64)
                .IsRequired();

            entity.HasIndex(i => i.TokenHash)
                .IsUnique();

            entity.HasOne(i => i.User)
                .WithMany()
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CustomerAccess>(entity =>
        {
            entity.HasKey(t => new { t.UserId, t.CustomerId });

            entity.HasOne(t => t.User)
                .WithMany(u => u.CustomerAccesses)
                .HasForeignKey(t => t.UserId);

            entity.HasOne(t => t.Customer)
                .WithMany(c => c.CustomerAccesses)
                .HasForeignKey(t => t.CustomerId);
        });
    }

}