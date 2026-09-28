using API.DTOs.CourseDTO.Enrollment;
using API.Mapping;
using Application.Common.Results.Enrollments;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/courses")]
    [Authorize(Roles = "Student")]
    public class EnrollmentController : ControllerBase
    {
        private readonly IEnrollmentService _enrollmentService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICourseService _courseService;
        private readonly IUserService _userService;
        private readonly EnrollmentMapper _mapper;

        public EnrollmentController(
            IEnrollmentService enrollmentService,
            ICurrentUserService currentUserService,
            ICourseService courseService,
            IUserService userService,
            EnrollmentMapper mapper)
        {
            _enrollmentService = enrollmentService;
            _currentUserService = currentUserService;
            _courseService = courseService;
            _userService = userService;
            _mapper = mapper;
        }

        [HttpPost("{courseId}/enroll")]
        [ProducesResponseType(typeof(EnrollmentResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> EnrollAsync(int courseId)
        {
            var course = await _courseService.GetCourseByIdAsync(courseId);
            if (course == null)
            {
                return NotFound($"Course with ID {courseId} not found.");
            }

            var user = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (user == null)
            {
                return Unauthorized();
            }

            var result = await _enrollmentService.EnrollStudentAsync(user, course);
            
            var response = _mapper.ToResponse(result.Enrollment!);
            return Ok(response);
        }

        [HttpGet("{courseId}/progress")]
        [ProducesResponseType(typeof(IEnumerable<LessonProgressResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProgressAsync(int courseId)
        {
            var course = await _courseService.GetCourseByIdAsync(courseId);
            if (course == null)
            {
                return NotFound($"Course with ID {courseId} not found.");
            }

            var user = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (user == null)
            {
                return Unauthorized();
            }

            var enrollmentResult = await _enrollmentService.GetEnrollmentAsync(user, course);
            if (enrollmentResult.Status == EnrollStatus.CourseNotFound)
            {
                return Forbid();
            }

            var result = await _enrollmentService.GetProgressAsync(enrollmentResult.Enrollment!, course);

            if (result.Status == GetProgressStatus.CourseNotFound)
            {
                return NotFound($"Course with ID {courseId} not found.");
            }

            if (result.Status == GetProgressStatus.NotEnrolled)
            {
                return Forbid();
            }

            var response = result.Lessons!.Select(p => _mapper.ToResponse(p));
            return Ok(response);
        }

        [HttpPatch("{courseId}/units/{unitId}/lessons/{lessonId}/complete")]
        [ProducesResponseType(typeof(ProgressSummaryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CompleteLessonAsync(int courseId, int unitId, int lessonId)
        {
            var course = await _courseService.GetCourseByIdAsync(courseId);
            if (course == null)
            {
                return NotFound($"Course with ID {courseId} not found.");
            }

            var user = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (user == null)
            {
                return Unauthorized();
            }

            var enrollmentResult = await _enrollmentService.GetEnrollmentAsync(user, course);
            if (enrollmentResult.Status == EnrollStatus.CourseNotFound)
            {
                return Forbid();
            }

            var unit = course.Units.FirstOrDefault(u => u.Id == unitId);
            if (unit == null)
            {
                return NotFound($"Unit with ID {unitId} not found in course {courseId}.");
            }

            var lesson = unit.Lessons.FirstOrDefault(l => l.Id == lessonId);
            if (lesson == null)
            {
                return NotFound($"Lesson with ID {lessonId} not found in unit {unitId}.");
            }

            var result = await _enrollmentService.CompleteLessonAsync(enrollmentResult.Enrollment!, lesson);

            var response = _mapper.ToResponse(result);
            return Ok(response);
        }
    }
}
