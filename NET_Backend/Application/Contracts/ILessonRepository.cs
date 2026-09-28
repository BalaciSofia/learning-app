using Domain.Entities.Courses;

namespace Application.Contracts
{
    public interface ILessonRepository
    {
        Task<Lesson> CreateAsync(Lesson lesson);
        Task<Lesson?> GetByIdAsync(int id);
        Task UpdateAsync(Lesson lesson);
        Task DeleteAsync(Lesson lesson);
        Task<IEnumerable<Lesson>> GetLessonsByUnitIdAsync(int unitId);
    }
}