using System.Collections.Generic;
using System.Linq;
using Application.Common.Results.Enrollments;
using Application.Contracts;
using Application.Interfaces;
using Domain.Entities;
using Domain.Entities.Courses;

namespace Application.UseCases.Courses
{
    public class EnrollmentService : IEnrollmentService
    {
        private readonly IEnrollmentRepository _enrollmentRepository;
        private readonly ICourseRepository _courseRepository;

        public EnrollmentService(IEnrollmentRepository enrollmentRepository, ICourseRepository courseRepository)
        {
            _enrollmentRepository = enrollmentRepository;
            _courseRepository = courseRepository;
        }

        public async Task<EnrollResult> GetEnrollmentAsync(User user, Course course)
        {
            var enrollment = await _enrollmentRepository.GetByUserAndCourseAsync(user.Id, course.Id);
            if (enrollment == null)
            {
                return new EnrollResult(EnrollStatus.CourseNotFound);
            }
            return new EnrollResult(EnrollStatus.Success, enrollment);
        }

        public async Task<EnrollResult> EnrollStudentAsync(User user, Course course)
        {
            var existing = await _enrollmentRepository.GetByUserAndCourseAsync(user.Id, course.Id);
            if (existing != null)
            {
                return new EnrollResult(EnrollStatus.Success, existing);
            }

            var enrollment = new Enrollment
            {
                UserId = user.Id,
                CourseId = course.Id,
                EnrolledAt = DateTime.UtcNow
            };

            await _enrollmentRepository.AddAsync(enrollment);

            course.EnrolledStudentsCount++;
            await _courseRepository.UpdateCourseAsync(course);

            return new EnrollResult(EnrollStatus.Success, enrollment);
        }

        public async Task<GetProgressResult> GetProgressAsync(Enrollment enrollment, Course course)
        {
            var enrollmentWithProgress = await _enrollmentRepository.GetWithProgressByIdAsync(enrollment.Id);
            if (enrollmentWithProgress == null)
            {
                return new GetProgressResult(GetProgressStatus.NotEnrolled);
            }

            var result = AlignLessons(enrollmentWithProgress, course);
            return new GetProgressResult(GetProgressStatus.Success, result);
        }

        public async Task<CompleteLessonResult> CompleteLessonAsync(Enrollment enrollment, Lesson lesson)
        {
            var enrollmentWithProgress = await _enrollmentRepository.GetWithProgressByIdAsync(enrollment.Id);
            if (enrollmentWithProgress == null)
            {
                return new CompleteLessonResult(CompleteLessonStatus.NotEnrolled);
            }

            var existingProgress = enrollmentWithProgress.LessonProgresses
                .FirstOrDefault(lp => lp.LessonId == lesson.Id);

            if (existingProgress != null)
            {
                if (!existingProgress.Completed)
                {
                    existingProgress.Completed = true;
                    existingProgress.CompletedAt = DateTime.UtcNow;
                    await _enrollmentRepository.UpdateLessonProgressAsync(existingProgress);
                }
            }
            else
            {
                var progress = new LessonProgress
                {
                    EnrollmentId = enrollment.Id,
                    LessonId = lesson.Id,
                    Completed = true,
                    CompletedAt = DateTime.UtcNow
                };

                await _enrollmentRepository.AddLessonProgressAsync(progress);
            }

            var course = await _courseRepository.GetCourseByIdAsync(enrollment.CourseId);
            if (course == null)
            {
                return new CompleteLessonResult(CompleteLessonStatus.CourseNotFound);
            }

            var totalLessons = course.Units.SelectMany(u => u.Lessons).Count();

            var completedLessons = enrollmentWithProgress.LessonProgresses.Count(lp => lp.Completed);
            double progressPercent = totalLessons > 0
                ? Math.Round((double)completedLessons / totalLessons * 100, 2)
                : 0;

            var alignedLessons = AlignLessons(enrollmentWithProgress, course);

            return new CompleteLessonResult(CompleteLessonStatus.Success, progressPercent, alignedLessons);
        }

        private List<LessonProgress> AlignLessons(Enrollment enrollmentWithProgress, Course course)
        {
            var allLessons = course.Units.SelectMany(u => u.Lessons).ToList();
            var progressByLessonId = enrollmentWithProgress.LessonProgresses
                .GroupBy(lp => lp.LessonId)
                .ToDictionary(g => g.Key, g => g.First());

            return allLessons.Select(lesson =>
            {
                if (progressByLessonId.TryGetValue(lesson.Id, out var progress))
                {
                    return progress;
                }

                return new LessonProgress
                {
                    EnrollmentId = enrollmentWithProgress.Id,
                    LessonId = lesson.Id,
                    Completed = false,
                    CompletedAt = null
                };
            }).ToList();
        }
    }
}
