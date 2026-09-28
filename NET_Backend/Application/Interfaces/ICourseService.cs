using Domain.Entities.Courses;

namespace Application.Interfaces
{
    public interface ICourseService
    {
        Task<List<Course>> GetAllCoursesAsync();
        
        Task<Course?> GetCourseByIdAsync(int id);
        Task<Course> CreateCourseAsync(Course course);
        
        Task UpdateCourseAsync(Course course);
        
        Task DeleteCourseAsync(int id);
        
        Task<List<Course>> FilterCoursesByEnrolledStudentAsync(int studentId);
        
        Task<List<Course>> FilterCoursesByInstitutionAsync(int institutionId, int currentUserId);
    }
}