using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SocManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedTestUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CustomerAccess", "Email", "FailedLoginAttempts", "LastSignIn", "LockedUntil", "MfaEnabled", "Name", "PasswordHash", "Role", "Status" },
                values: new object[,]
                {
                    { new Guid("41d1e697-839a-4b88-a502-41a09fdf36c3"), "2 customers", "n.prins@soc.nl", 0, null, null, false, "N. Prins", "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==", "ForensicAnalyst", "Invited" },
                    { new Guid("4d7bc960-9820-4809-ab0e-eecc0619381d"), "31 customers", "l.smit@soc.nl", 0, new DateTime(2026, 10, 5, 17, 48, 0, 0, DateTimeKind.Utc), null, true, "L. Smit", "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==", "Tier3", "Active" },
                    { new Guid("7d26ff69-db3e-4b3b-8e4f-7f1abb78ba05"), "3 customers", "a.mulder@soc.nl", 0, new DateTime(2026, 10, 5, 16, 12, 0, 0, DateTimeKind.Utc), null, true, "A. Mulder", "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==", "AccountManager", "Active" },
                    { new Guid("a4c85f52-e4b9-4759-86ac-08d43e2ced7d"), "22 customers", "r.visser@soc.nl", 0, new DateTime(2026, 10, 6, 8, 15, 0, 0, DateTimeKind.Utc), null, true, "R. Visser", "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==", "Tier2", "Active" },
                    { new Guid("cd1f2a56-fbf4-48b0-ae43-c99c104dc025"), "On request, logged", "k.hendriks@soc.nl", 0, new DateTime(2026, 10, 6, 8, 30, 0, 0, DateTimeKind.Utc), null, true, "K. Hendriks", "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==", "Superuser", "Active" },
                    { new Guid("cff2ace7-00ab-487d-b2eb-d3681e89862f"), "14 customers", "m.jansen@soc.nl", 0, new DateTime(2026, 10, 6, 8, 2, 0, 0, DateTimeKind.Utc), null, true, "M. Jansen", "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==", "Tier1", "Active" },
                    { new Guid("d6596d4a-33dd-4b5c-8d8a-7a148ebbde8a"), "14 customers", "s.bakker@soc.nl", 0, new DateTime(2026, 10, 6, 7, 58, 0, 0, DateTimeKind.Utc), null, true, "S. Bakker", "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==", "Tier1", "Active" },
                    { new Guid("f089b422-d95e-45c4-a65e-03e8c83dfca6"), "On request", "p.dewit@soc.nl", 0, new DateTime(2026, 10, 6, 9, 1, 0, 0, DateTimeKind.Utc), null, true, "P. de Wit", "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==", "Engineer", "Active" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("41d1e697-839a-4b88-a502-41a09fdf36c3"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("4d7bc960-9820-4809-ab0e-eecc0619381d"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("7d26ff69-db3e-4b3b-8e4f-7f1abb78ba05"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a4c85f52-e4b9-4759-86ac-08d43e2ced7d"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("cd1f2a56-fbf4-48b0-ae43-c99c104dc025"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("cff2ace7-00ab-487d-b2eb-d3681e89862f"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("d6596d4a-33dd-4b5c-8d8a-7a148ebbde8a"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("f089b422-d95e-45c4-a65e-03e8c83dfca6"));
        }
    }
}
