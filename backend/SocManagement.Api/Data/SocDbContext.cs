using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Models;

namespace SocManagement.Api.Data;

public class SocDbContext(DbContextOptions<SocDbContext> options) : DbContext(options), IDataProtectionKeyContext
{
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Communication> Communications => Set<Communication>();
    public DbSet<TicketHistory> TicketHistories => Set<TicketHistory>();
    public DbSet<SLA> Slas => Set<SLA>();
    public DbSet<RetentionPolicy> RetentionPolicies => Set<RetentionPolicy>();
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

            entity.Property(u => u.Role).HasMaxLength(20);
            entity.HasOne(u => u.AccessRole).WithMany()
                .HasForeignKey(u => u.Role).OnDelete(DeleteBehavior.Restrict);
            entity.HasMany(u => u.DirectPermissions).WithMany()
                .UsingEntity("UserPermissions");

            entity.Property(u => u.Status)
                .HasConversion<string>()
                .HasMaxLength(20);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(role => role.Name);
            entity.Property(role => role.Name).HasMaxLength(20);
            entity.HasMany(role => role.Permissions).WithMany()
                .UsingEntity("RolePermissions");
            entity.HasData(Enum.GetNames<SocManagement.Api.Enums.UserRole>()
                .Append("TicketIntakeOfficer").Select(name => new Role { Name = name }));
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(permission => permission.Key);
            entity.Property(permission => permission.Key).HasMaxLength(64);
            entity.HasData(Auth.Permissions.All.Select(key => new Permission { Key = key }));
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
    }

}