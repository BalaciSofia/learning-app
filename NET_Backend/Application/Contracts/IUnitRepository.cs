using Domain.Entities.Courses;

namespace Application.Contracts
{
    public interface IUnitRepository
    {
        Task<Unit> CreateAsync(Unit unit);
        Task<Unit?> GetByIdAsync(int id);
        Task UpdateAsync(Unit unit);
        Task DeleteAsync(Unit unit);
        Task<IEnumerable<Unit>> GetUnitsByCourseIdAsync(int courseId);
    }
}