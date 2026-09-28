using Domain.Entities.Courses;

namespace Application.Interfaces
{
    public interface IUnitService
    {
        Task<Unit?> CreateUnitAsync(int courseId, Unit unit); 
        Task<Unit?> GetUnitByIdAsync(int id);
        Task<IEnumerable<Unit>?> GetUnitsByCourseIdAsync(int courseId);
        Task<bool> UpdateUnitAsync(Unit unit); 
        Task<bool> DeleteUnitAsync(int id);
    }
}