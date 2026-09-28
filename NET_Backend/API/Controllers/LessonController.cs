using API.DTOs.CourseDTO.Lessons;
using API.Mapping;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly CourseMapper _mapper;

        public LessonsController(ILessonService lessonService, CourseMapper mapper)
        {
            _lessonService = lessonService;
            _mapper = mapper;
        }

        [HttpPost("api/units/{unitId}/lessons")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateLessonAsync(int unitId, [FromBody] LessonCreateDto dto)
        {
            var lessonDomain = _mapper.ToDomain(dto);
            var createdLesson = await _lessonService.CreateLessonAsync(unitId, lessonDomain);
            if (createdLesson == null)
            {
                return BadRequest($"Unit with ID {unitId} doesn't exist.");
            }
            var response = _mapper.ToDto(createdLesson);
            return CreatedAtAction(nameof(GetLessonByIdAsync), new { id = createdLesson.Id }, response);
        }

        [HttpGet("api/units/{unitId}/lessons")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAllLessonsForUnitAsync(int unitId)
        {
            var lessons = await _lessonService.GetLessonsByUnitIdAsync(unitId);
            if (lessons == null)
            {
                return BadRequest($"Unit with ID {unitId} doesn't exist.");
            }
            var response = lessons.Select(l => _mapper.ToDto(l));
            return Ok(response);
        }

        [HttpGet("api/lessons/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetLessonByIdAsync(int id)
        {
            var lesson = await _lessonService.GetLessonByIdAsync(id);
            if (lesson == null)
            {
                return NotFound($"Lesson with ID {id} not found.");
            }

            var response = _mapper.ToDto(lesson);
            return Ok(response);
        }

        [HttpPut("api/lessons/{id}")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateLessonAsync(int id, [FromBody] LessonCreateDto request)
        {
            var lessonDomain = _mapper.ToDomain(request);
            lessonDomain.Id = id;
            var success = await _lessonService.UpdateLessonAsync(lessonDomain);
            if (!success)
            {
                return NotFound($"Lesson with ID {id} not found");
            }
            return NoContent();
        }

        [HttpDelete("api/lessons/{id}")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteLessonAsync(int id)
        {
            var success = await _lessonService.DeleteLessonAsync(id);
            if (!success)
            {
                return NotFound($"Lesson with ID {id} not found");
            }
            return NoContent();
        }
    }
}