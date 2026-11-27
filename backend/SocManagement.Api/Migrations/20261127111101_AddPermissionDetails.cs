using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocManagement.Api.Migrations
{
    public partial class AddPermissionDetails : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Permissions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsAssignable",
                table: "Permissions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Permissions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "customer.create",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "Create customer records.", true, "Create customers" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "customer.read",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "View the customer list and individual customer details.", true, "View customers" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "ticket.create",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "Create tickets for existing customers and optionally assign them to an existing user.", true, "Create tickets" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "ticket.read",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "View the ticket list and individual ticket details.", true, "View tickets" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "user.create",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "Create user accounts directly. Without role management, you can only assign Tier 1 and must have all its permissions.", true, "Create users" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "user.delete",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "Delete other users’ accounts, except Superusers and users with assigned tickets, ticket messages or ticket history.", true, "Delete users" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "user.invite",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "Send account invitations by email. Without role management, you can only assign Tier 1 and must have all its permissions.", true, "Invite users" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "user.read",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "View the user list and other users’ account details.", true, "View users" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "user.update",
                columns: new[] { "Description", "IsAssignable", "Name" },
                values: new object[] { "Change users’ names and email addresses. Editing a Superuser or changing a role or customer assignment requires role management.", true, "Edit users" });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Key", "Description", "IsAssignable", "Name" },
                values: new object[] { "role.manage", "Create roles, edit role names and permissions, assign roles and direct permissions to users, and manage user access to customers. Reserved for Superusers.", false, "Manage roles" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "role.manage");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "IsAssignable",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Permissions");
        }
    }
}
