using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocManagement.Api.Migrations
{
    public partial class UpdateUserUpdateDescription : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "user.update",
                column: "Description",
                value: "Change users’ names and email addresses, and deactivate or reactivate accounts other than Superusers. Editing a Superuser or changing a role or customer assignment requires role management.");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Key",
                keyValue: "user.update",
                column: "Description",
                value: "Change users’ names and email addresses. Editing a Superuser or changing a role or customer assignment requires role management.");
        }
    }
}
