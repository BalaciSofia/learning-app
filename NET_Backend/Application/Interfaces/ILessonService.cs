using Domain.Entities.Courses;

namespace Application.Interfaces
{
    public interface ILessonService
    {
        Task<Lesson?> CreateLessonAsync(int unitId, Lesson lesson);
        Task<Lesson?> GetLessonByIdAsync(int id);
        Task<IEnumerable<Lesson>?> GetLessonsByUnitIdAsync(int unitId);
        Task<bool> UpdateLessonAsync(Lesson lesson);
        Task<bool> DeleteLessonAsync(int id);
    }
}