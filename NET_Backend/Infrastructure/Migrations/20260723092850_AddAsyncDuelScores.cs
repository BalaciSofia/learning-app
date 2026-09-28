using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAsyncDuelScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_UserId",
                table: "StudentProfiles");

            migrationBuilder.AddColumn<int>(
                name: "ChallengedScore",
                table: "DuelInvitations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChallengerScore",
                table: "DuelInvitations",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChallengedScore",
                table: "DuelInvitations");

            migrationBuilder.DropColumn(
                name: "ChallengerScore",
                table: "DuelInvitations");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_UserId",
                table: "StudentProfiles",
                column: "UserId");
        }
    }
}
