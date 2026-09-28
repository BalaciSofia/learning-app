using Domain.Entities.Courses;

namespace Application.Contracts
{

    public interface ICourseRepository
    {
        
        Task<Course?> GetCourseByIdAsync(int id);
        
        Task<List<Course>> GetAllCoursesAsync();
        Task<Course> CreateCourseAsync(Course course);
        
        Task<Course?> UpdateCourseAsync(Course course);
        
        Task<Course?> DeleteCourseAsync(int courseId);
        
        Task<List<Course>> FilterCoursesByEnrolledStudentAsync(int studentId);
        
        Task<List<Course>> FilterCoursesByInstitutionAsync(int institutionId, int currentUserId);
    }
}