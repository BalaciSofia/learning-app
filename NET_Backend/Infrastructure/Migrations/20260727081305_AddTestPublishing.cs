using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTestPublishing : Migration
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

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Tests",
                type: "bit",
                nullable: false,
                defaultValue: false);

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
                name: "FK_DuelInvitations_Tests_TestId",
                table: "DuelInvitations");

            migrationBuilder.DropForeignKey(
                name: "FK_TestAttempts_Tests_TestId",
                table: "TestAttempts");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Tests");

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
