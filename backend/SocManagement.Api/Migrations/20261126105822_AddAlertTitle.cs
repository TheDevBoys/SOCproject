using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Alerts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "Alerts");
        }
    }
}
