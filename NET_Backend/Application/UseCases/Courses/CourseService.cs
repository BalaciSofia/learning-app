using Application.Contracts;
using Application.Interfaces;
using Domain.Entities.Courses;

namespace Application.UseCases.Courses
{

    public class CourseService : ICourseService
    {
        private readonly ICourseRepository _courseRepository;

        public CourseService(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public Task<Course> CreateCourseAsync(Course course)
        {
            return _courseRepository.CreateCourseAsync(course);
        }

        public Task UpdateCourseAsync(Course course)
        {
            return  _courseRepository.UpdateCourseAsync(course);
        }

        public Task DeleteCourseAsync(int courseId)
        {
            return  _courseRepository.DeleteCourseAsync(courseId);
        }

        public Task<List<Course>> FilterCoursesByEnrolledStudentAsync(int studentId)
        {
            return _courseRepository.FilterCoursesByEnrolledStudentAsync(studentId);
        }

        public Task<List<Course>> FilterCoursesByInstitutionAsync(int institutionId, int currentUserId)
        {
            return  _courseRepository.FilterCoursesByInstitutionAsync(institutionId, currentUserId);
        }

        public Task<List<Course>> GetAllCoursesAsync()
        {
            return  _courseRepository.GetAllCoursesAsync();
        }

        public Task<Course?> GetCourseByIdAsync(int id)
        {
            return _courseRepository.GetCourseByIdAsync(id);
        }
    }
}