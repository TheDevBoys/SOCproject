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
    public DbSet<TenantAccess> TenantAccesses => Set<TenantAccess>();
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

            entity.HasOne(u => u.AccessRole).WithMany()
                .HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.Restrict);
            entity.HasMany(u => u.DirectPermissions).WithMany()
                .UsingEntity("UserPermissions");

            entity.Property(u => u.Status)
                .HasConversion<string>()
                .HasMaxLength(20);
                
            // Klantgebruiker -> klant. Restrict: een klant met accounts kan niet zomaar
            // verwijderd worden, en voorkomt meerdere cascade-paden naar TenantAccesses.
            entity.HasOne(u => u.Customer)
                .WithMany(c => c.Users)
                .HasForeignKey(u => u.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.Property(role => role.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
            entity.Property(role => role.Key).HasMaxLength(20);
            entity.HasIndex(role => role.Key).IsUnique();
            entity.Property(role => role.Name).HasMaxLength(100);
            entity.HasMany(role => role.Permissions).WithMany()
                .UsingEntity("RolePermissions");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(permission => permission.Key);
            entity.Property(permission => permission.Key).HasMaxLength(64);
            entity.Property(permission => permission.Name).HasMaxLength(100);
            entity.Property(permission => permission.Description).HasMaxLength(500);
            entity.HasData(PermissionSeed());
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

        modelBuilder.Entity<TenantAccess>(entity =>
        {
            entity.HasKey(t => new { t.UserId, t.CustomerId });

            entity.HasOne(t => t.User)
                .WithMany(u => u.TenantAccesses)
                .HasForeignKey(t => t.UserId);

            entity.HasOne(t => t.Customer)
                .WithMany(c => c.TenantAccesses)
                .HasForeignKey(t => t.CustomerId);
        });
    }

    private static Permission[] PermissionSeed()
    {
        Permission[] permissions =
        [
            new()
            {
                Key = Auth.Permissions.Roles.Manage,
                Name = "Manage roles",
                Description = "Create roles, edit role names and permissions, assign roles and direct permissions to users, and manage user access to customers. Reserved for Superusers.",
                IsAssignable = false
            },
            new()
            {
                Key = Auth.Permissions.Users.Read,
                Name = "View users",
                Description = "View the user list and other users’ account details."
            },
            new()
            {
                Key = Auth.Permissions.Users.Create,
                Name = "Create users",
                Description = "Create user accounts directly. Without role management, you can only assign Tier 1 and must have all its permissions."
            },
            new()
            {
                Key = Auth.Permissions.Users.Update,
                Name = "Edit users",
                Description = "Change users’ names and email addresses. Editing a Superuser or changing a role or customer assignment requires role management."
            },
            new()
            {
                Key = Auth.Permissions.Users.Delete,
                Name = "Delete users",
                Description = "Delete other users’ accounts, except Superusers and users with assigned tickets, ticket messages or ticket history."
            },
            new()
            {
                Key = Auth.Permissions.Users.Invite,
                Name = "Invite users",
                Description = "Send account invitations by email. Without role management, you can only assign Tier 1 and must have all its permissions."
            },
            new()
            {
                Key = Auth.Permissions.Customers.Read,
                Name = "View customers",
                Description = "View the customer list and individual customer details."
            },
            new()
            {
                Key = Auth.Permissions.Customers.Create,
                Name = "Create customers",
                Description = "Create customer records."
            },
            new()
            {
                Key = Auth.Permissions.Tickets.Read,
                Name = "View tickets",
                Description = "View the ticket list and individual ticket details."
            },
            new()
            {
                Key = Auth.Permissions.Tickets.Create,
                Name = "Create tickets",
                Description = "Create tickets for existing customers and optionally assign them to an existing user."
            }
        ];

        if (!permissions.Select(permission => permission.Key).Order(StringComparer.Ordinal)
                .SequenceEqual(Auth.Permissions.All.Order(StringComparer.Ordinal)))
        {
            throw new InvalidOperationException("Every supported permission needs exactly one seeded definition.");
        }

        return permissions;
    }
}