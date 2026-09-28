using API.DTOs.CourseDTO.Courses;
using API.Mapping;
using API.Services;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    [ApiController]
    [Route("api/courses")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;
        
        private readonly CourseMapper _mapper;
        
        private readonly ICurrentUserService _currentUserService;
        
        private readonly IInstitutionService _institutionService;

        public CourseController(ICourseService courseService, CourseMapper mapper, ICurrentUserService currentUserService,  IInstitutionService institutionService)
        {
            _courseService = courseService;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _institutionService = institutionService;
        }
        
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CourseResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllAsync()
        {
            var courses = await _courseService.FilterCoursesByInstitutionAsync(
                _currentUserService.InstitutionId.GetValueOrDefault(), 
                _currentUserService.UserId);
            
            var response = courses.Select(c => _mapper.ToDto(c));

            return Ok(response);
        }

        [HttpGet("enrolled")]
        [Authorize(Roles = "Student")]
        [ProducesResponseType(typeof(IEnumerable<CourseResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetEnrolledCoursesAsync()
        {
            var courses = await _courseService.FilterCoursesByEnrolledStudentAsync(_currentUserService.UserId);

            var response = courses.Select(c => _mapper.ToDto(c));

            return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCourseAsync([FromBody] CourseCreateDto dto)
        {
            var institution = await _institutionService.GetInstitutionByIdAsync(_currentUserService.InstitutionId.GetValueOrDefault());
            var domainCourse = _mapper.ToDomain(dto);
            domainCourse.Institution = institution;
            domainCourse.CreatorId = _currentUserService.UserId;
            domainCourse.IsPublished = false;

            var course = await _courseService.CreateCourseAsync(domainCourse);

            var response = _mapper.ToDto(course);

            return CreatedAtAction(nameof(GetCourseByIdAsync), new { id = course.Id }, response);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CourseResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCourseByIdAsync(int id)
        {
            var course = await _courseService.GetCourseByIdAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            if (!course.IsPublished && course.CreatorId != _currentUserService.UserId)
            {
                return Forbid();
            }

            var response = _mapper.ToDto(course);
            
            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCourseAsync(int id, [FromBody] CourseUpdateDto request)
        {
            var existingCourse = await _courseService.GetCourseByIdAsync(id);
            
            if (existingCourse == null)
            {
                return NotFound();
            }

            if (existingCourse.CreatorId != _currentUserService.UserId)
            {
                return Forbid();
            }

            if (existingCourse.IsPublished)
            {
                return BadRequest("Published courses cannot be edited.");
            }

            existingCourse.Title = request.Title;
            existingCourse.Description = request.Description;
            existingCourse.Subject = request.Subject;
            await _courseService.UpdateCourseAsync(existingCourse);
    
            return NoContent();
        }

        [HttpPut("{id}/publish")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PublishCourseAsync(int id)
        {
            var existingCourse = await _courseService.GetCourseByIdAsync(id);

            if (existingCourse == null)
            {
                return NotFound();
            }

            if (existingCourse.CreatorId != _currentUserService.UserId)
            {
                return Forbid();
            }

            if (existingCourse.IsPublished)
            {
                return BadRequest("Course is already published.");
            }

            existingCourse.IsPublished = true;
            await _courseService.UpdateCourseAsync(existingCourse);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var existingCourse = await _courseService.GetCourseByIdAsync(id);

            if (existingCourse == null)
            {
                return NotFound();
            }

            if (existingCourse.CreatorId != _currentUserService.UserId)
            {
                return Forbid();
            }

            await _courseService.DeleteCourseAsync(id);
            return NoContent();
        }
    }
}