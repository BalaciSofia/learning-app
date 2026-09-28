using Domain.Entities;

namespace Application.Contracts
{
    public interface IStudentProfileRepository
    {
        Task<StudentProfile?> GetByUserIdAsync(int userId, int courseId);
        Task AddAsync(StudentProfile profile);
        Task UpdateAsync(StudentProfile profile);
    }
}
