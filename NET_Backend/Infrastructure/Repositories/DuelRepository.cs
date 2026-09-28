using Application.Contracts;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class DuelRepository : IDuelRepository
    {
        private readonly LearningAppDbContext _context;

        public DuelRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetStudentsInInstitutionAsync(int institutionId, int excludeUserId)
        {
            return await _context.Users
                .Where(u => u.InstitutionId == institutionId
                         && u.Role == Role.Student
                         && u.Id != excludeUserId)
                .ToListAsync();
        }

        public async Task<Test?> GetTestByTitleAsync(string title)
        {
            return await _context.Tests.FirstOrDefaultAsync(t => t.Title == title);
        }

        public async Task<DuelInvitation?> GetByIdAsync(int id)
        {
            return await _context.DuelInvitations.FindAsync(id);
        }

        public async Task<DuelInvitation?> GetActiveInvitationAsync(int challengerId, int challengedId, int testId)
        {
            return await _context.DuelInvitations
                .FirstOrDefaultAsync(d =>
                    d.ChallengerId == challengerId &&
                    d.ChallengedId == challengedId &&
                    d.TestId == testId &&
                    (d.Status == InvitationStatus.Pending || d.Status == InvitationStatus.Accepted));
        }

        public async Task<DuelInvitation?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.DuelInvitations
                .Include(d => d.Challenger)
                .Include(d => d.Challenged)
                .Include(d => d.Result)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task AddInvitationAsync(DuelInvitation invitation)
        {
            await _context.DuelInvitations.AddAsync(invitation);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateInvitationAsync(DuelInvitation invitation)
        {
            _context.DuelInvitations.Update(invitation);
            await _context.SaveChangesAsync();
        }

        public async Task<List<DuelInvitation>> GetIncomingInvitationsAsync(int userId)
        {
            return await _context.DuelInvitations
                .Include(d => d.Challenger)
                .Where(d => d.ChallengedId == userId && d.Status == InvitationStatus.Pending)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<DuelInvitation>> GetActiveDuelsAsync(int userId)
        {
            return await _context.DuelInvitations
                .Include(d => d.Challenger)
                .Include(d => d.Challenged)
                .Where(d => (d.ChallengerId == userId && d.Status == InvitationStatus.Pending)
                         || ((d.ChallengerId == userId || d.ChallengedId == userId) && d.Status == InvitationStatus.Accepted))
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<DuelInvitation>> GetHistoryAsync(int userId)
        {
            return await _context.DuelInvitations
                .Include(d => d.Challenger)
                .Include(d => d.Challenged)
                .Include(d => d.Result)
                .Where(d => (d.ChallengerId == userId || d.ChallengedId == userId)
                         && d.Status == InvitationStatus.Completed)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task AddResultAsync(DuelResult result)
        {
            await _context.DuelResults.AddAsync(result);
            await _context.SaveChangesAsync();
        }
    }
}
