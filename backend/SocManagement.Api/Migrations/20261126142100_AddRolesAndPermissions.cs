using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRolesAndPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Name = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Name);
                });

            migrationBuilder.CreateTable(
                name: "UserPermissions",
                columns: table => new
                {
                    DirectPermissionsKey = table.Column<string>(type: "nvarchar(64)", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissions", x => new { x.DirectPermissionsKey, x.UserId });
                    table.ForeignKey(
                        name: "FK_UserPermissions_Permissions_DirectPermissionsKey",
                        column: x => x.DirectPermissionsKey,
                        principalTable: "Permissions",
                        principalColumn: "Key",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    PermissionsKey = table.Column<string>(type: "nvarchar(64)", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(20)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => new { x.PermissionsKey, x.RoleName });
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionsKey",
                        column: x => x.PermissionsKey,
                        principalTable: "Permissions",
                        principalColumn: "Key",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleName",
                        column: x => x.RoleName,
                        principalTable: "Roles",
                        principalColumn: "Name",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                column: "Key",
                values: new object[]
                {
                    "customer.create",
                    "customer.read",
                    "ticket.create",
                    "ticket.read",
                    "user.create",
                    "user.delete",
                    "user.invite",
                    "user.read",
                    "user.update"
                });

            migrationBuilder.InsertData(
                table: "Roles",
                column: "Name",
                values: new object[]
                {
                    "AccountManager",
                    "Customer",
                    "Engineer",
                    "ForensicAnalyst",
                    "Superuser",
                    "TicketIntakeOfficer",
                    "Tier1",
                    "Tier2",
                    "Tier3"
                });

            migrationBuilder.Sql("""
                INSERT INTO [Roles] ([Name])
                SELECT DISTINCT [Role] FROM [Users] AS users
                WHERE NOT EXISTS (SELECT 1 FROM [Roles] AS roles WHERE roles.[Name] = users.[Role]);
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role",
                table: "Users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleName",
                table: "RolePermissions",
                column: "RoleName");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId",
                table: "UserPermissions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_Role",
                table: "Users",
                column: "Role",
                principalTable: "Roles",
                principalColumn: "Name",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [Users]
                    WHERE [Role] NOT IN (N'Superuser', N'Tier1', N'Tier2', N'Tier3',
                        N'Engineer', N'AccountManager', N'ForensicAnalyst', N'Customer'))
                    THROW 50001, 'Reassign users with custom roles before rolling back.', 1;
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_Role",
                table: "Users");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "UserPermissions");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropIndex(
                name: "IX_Users_Role",
                table: "Users");
        }
    }
}
