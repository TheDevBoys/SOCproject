using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocManagement.Api.Migrations;

public partial class UseRoleId : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE [Roles] ADD [Id] uniqueidentifier NOT NULL
                CONSTRAINT [DF_Roles_Id] DEFAULT NEWSEQUENTIALID();
            ALTER TABLE [Roles] ADD [Key] nvarchar(20) NULL;
            ALTER TABLE [Users] ADD [RoleId] uniqueidentifier NULL;
            ALTER TABLE [RolePermissions] ADD [RoleId] uniqueidentifier NULL;
            """);

        migrationBuilder.Sql("""
            EXEC(N'
                UPDATE [Roles] SET [Key] = [Name];
                UPDATE u SET [RoleId] = r.[Id]
                    FROM [Users] AS u JOIN [Roles] AS r ON r.[Key] = u.[Role];
                UPDATE rp SET [RoleId] = r.[Id]
                    FROM [RolePermissions] AS rp JOIN [Roles] AS r ON r.[Key] = rp.[RoleName];
            ');
            """);

        migrationBuilder.Sql("""
            ALTER TABLE [Users] DROP CONSTRAINT [FK_Users_Roles_Role];
            ALTER TABLE [RolePermissions] DROP CONSTRAINT [FK_RolePermissions_Roles_RoleName];
            DROP INDEX [IX_Users_Role] ON [Users];
            DROP INDEX [IX_RolePermissions_RoleName] ON [RolePermissions];
            ALTER TABLE [RolePermissions] DROP CONSTRAINT [PK_RolePermissions];
            ALTER TABLE [Roles] DROP CONSTRAINT [PK_Roles];

            ALTER TABLE [Roles] ALTER COLUMN [Name] nvarchar(100) NOT NULL;
            ALTER TABLE [Roles] ALTER COLUMN [Key] nvarchar(20) NOT NULL;
            ALTER TABLE [Users] ALTER COLUMN [RoleId] uniqueidentifier NOT NULL;
            ALTER TABLE [RolePermissions] ALTER COLUMN [RoleId] uniqueidentifier NOT NULL;
            ALTER TABLE [Users] DROP COLUMN [Role];
            ALTER TABLE [RolePermissions] DROP COLUMN [RoleName];

            ALTER TABLE [Roles] ADD CONSTRAINT [PK_Roles] PRIMARY KEY ([Id]);
            CREATE UNIQUE INDEX [IX_Roles_Key] ON [Roles] ([Key]);
            ALTER TABLE [RolePermissions] ADD CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([PermissionsKey], [RoleId]);
            CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
            CREATE INDEX [IX_RolePermissions_RoleId] ON [RolePermissions] ([RoleId]);

            ALTER TABLE [Users] ADD CONSTRAINT [FK_Users_Roles_RoleId]
                FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]);
            ALTER TABLE [RolePermissions] ADD CONSTRAINT [FK_RolePermissions_Roles_RoleId]
                FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE [Users] ADD [Role] nvarchar(20) NULL;
            ALTER TABLE [RolePermissions] ADD [RoleName] nvarchar(20) NULL;
            """);

        migrationBuilder.Sql("""
            EXEC(N'
                UPDATE [Roles] SET [Name] = [Key];
                UPDATE u SET [Role] = r.[Key]
                    FROM [Users] AS u JOIN [Roles] AS r ON r.[Id] = u.[RoleId];
                UPDATE rp SET [RoleName] = r.[Key]
                    FROM [RolePermissions] AS rp JOIN [Roles] AS r ON r.[Id] = rp.[RoleId];
            ');
            """);

        migrationBuilder.Sql("""
            ALTER TABLE [Users] DROP CONSTRAINT [FK_Users_Roles_RoleId];
            ALTER TABLE [RolePermissions] DROP CONSTRAINT [FK_RolePermissions_Roles_RoleId];
            DROP INDEX [IX_Users_RoleId] ON [Users];
            DROP INDEX [IX_RolePermissions_RoleId] ON [RolePermissions];
            DROP INDEX [IX_Roles_Key] ON [Roles];
            ALTER TABLE [RolePermissions] DROP CONSTRAINT [PK_RolePermissions];
            ALTER TABLE [Roles] DROP CONSTRAINT [PK_Roles];
            ALTER TABLE [Roles] DROP CONSTRAINT [DF_Roles_Id];

            ALTER TABLE [Roles] ALTER COLUMN [Name] nvarchar(20) NOT NULL;
            ALTER TABLE [Users] ALTER COLUMN [Role] nvarchar(20) NOT NULL;
            ALTER TABLE [RolePermissions] ALTER COLUMN [RoleName] nvarchar(20) NOT NULL;
            ALTER TABLE [Users] DROP COLUMN [RoleId];
            ALTER TABLE [RolePermissions] DROP COLUMN [RoleId];
            ALTER TABLE [Roles] DROP COLUMN [Id], [Key];

            ALTER TABLE [Roles] ADD CONSTRAINT [PK_Roles] PRIMARY KEY ([Name]);
            ALTER TABLE [RolePermissions] ADD CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([PermissionsKey], [RoleName]);
            CREATE INDEX [IX_Users_Role] ON [Users] ([Role]);
            CREATE INDEX [IX_RolePermissions_RoleName] ON [RolePermissions] ([RoleName]);

            ALTER TABLE [Users] ADD CONSTRAINT [FK_Users_Roles_Role]
                FOREIGN KEY ([Role]) REFERENCES [Roles] ([Name]);
            ALTER TABLE [RolePermissions] ADD CONSTRAINT [FK_RolePermissions_Roles_RoleName]
                FOREIGN KEY ([RoleName]) REFERENCES [Roles] ([Name]) ON DELETE CASCADE;
            """);
    }
}
