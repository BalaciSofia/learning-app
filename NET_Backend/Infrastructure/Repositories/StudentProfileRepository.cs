using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class StudentProfileRepository : IStudentProfileRepository
    {
        private readonly LearningAppDbContext _db;

        public StudentProfileRepository(LearningAppDbContext db) => _db = db;

        public Task<StudentProfile?> GetByUserIdAsync(int userId, int courseId) =>
            _db.StudentProfiles
               .Include(p => p.Medals)
               .FirstOrDefaultAsync(p => p.UserId == userId && p.CourseId == courseId);

        public async Task AddAsync(StudentProfile profile)
        {
            _db.StudentProfiles.Add(profile);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(StudentProfile profile)
        {
            _db.StudentProfiles.Update(profile);
            await _db.SaveChangesAsync();
        }

    }
}
