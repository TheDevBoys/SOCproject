using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameTenantAccessToCustomerAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TenantAccesses_Customers_CustomerId",
                table: "TenantAccesses");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantAccesses_Users_UserId",
                table: "TenantAccesses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TenantAccesses",
                table: "TenantAccesses");

            migrationBuilder.RenameTable(
                name: "TenantAccesses",
                newName: "CustomerAccesses");

            migrationBuilder.RenameIndex(
                name: "IX_TenantAccesses_CustomerId",
                table: "CustomerAccesses",
                newName: "IX_CustomerAccesses_CustomerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CustomerAccesses",
                table: "CustomerAccesses",
                columns: new[] { "UserId", "CustomerId" });

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerAccesses_Customers_CustomerId",
                table: "CustomerAccesses",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerAccesses_Users_UserId",
                table: "CustomerAccesses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerAccesses_Customers_CustomerId",
                table: "CustomerAccesses");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerAccesses_Users_UserId",
                table: "CustomerAccesses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CustomerAccesses",
                table: "CustomerAccesses");

            migrationBuilder.RenameTable(
                name: "CustomerAccesses",
                newName: "TenantAccesses");

            migrationBuilder.RenameIndex(
                name: "IX_CustomerAccesses_CustomerId",
                table: "TenantAccesses",
                newName: "IX_TenantAccesses_CustomerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TenantAccesses",
                table: "TenantAccesses",
                columns: new[] { "UserId", "CustomerId" });

            migrationBuilder.AddForeignKey(
                name: "FK_TenantAccesses_Customers_CustomerId",
                table: "TenantAccesses",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TenantAccesses_Users_UserId",
                table: "TenantAccesses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
