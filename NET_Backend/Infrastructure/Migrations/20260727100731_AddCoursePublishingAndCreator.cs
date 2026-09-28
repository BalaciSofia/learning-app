using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCoursePublishingAndCreator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DuelInvitations_Tests_TestId",
                table: "DuelInvitations");

            migrationBuilder.DropForeignKey(
                name: "FK_TestAttempts_Tests_TestId",
                table: "TestAttempts");

            migrationBuilder.AddColumn<int>(
                name: "CreatorId",
                table: "Courses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Courses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"
                UPDATE Courses 
                SET IsPublished = 1;

                UPDATE c
                SET c.CreatorId = COALESCE(
                    (SELECT TOP 1 u.Id FROM Users u WHERE u.Role = 'Teacher' AND u.InstitutionId = c.InstitutionId ORDER BY NEWID()),
                    (SELECT TOP 1 u.Id FROM Users u WHERE u.Role = 'Teacher' ORDER BY NEWID()),
                    (SELECT TOP 1 u.Id FROM Users u ORDER BY NEWID())
                )
                FROM Courses c;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CreatorId",
                table: "Courses",
                column: "CreatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Users_CreatorId",
                table: "Courses",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DuelInvitations_Tests_TestId",
                table: "DuelInvitations",
                column: "TestId",
                principalTable: "Tests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TestAttempts_Tests_TestId",
                table: "TestAttempts",
                column: "TestId",
                principalTable: "Tests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Users_CreatorId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_DuelInvitations_Tests_TestId",
                table: "DuelInvitations");

            migrationBuilder.DropForeignKey(
                name: "FK_TestAttempts_Tests_TestId",
                table: "TestAttempts");

            migrationBuilder.DropIndex(
                name: "IX_Courses_CreatorId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Courses");

            migrationBuilder.AddForeignKey(
                name: "FK_DuelInvitations_Tests_TestId",
                table: "DuelInvitations",
                column: "TestId",
                principalTable: "Tests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TestAttempts_Tests_TestId",
                table: "TestAttempts",
                column: "TestId",
                principalTable: "Tests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
