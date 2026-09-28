using API.DTOs.CourseDTO.Units;
using API.Mapping;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/courses/{courseId}/units")]
    public class UnitController : ControllerBase
    {
        private readonly IUnitService _unitService;
        private readonly CourseMapper _mapper;

        public UnitController(IUnitService unitService, CourseMapper mapper)
        {
            _unitService = unitService;
            _mapper = mapper;
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateUnitAsync(int courseId, [FromBody] UnitCreateDto dto)
        {
            var unitDomain = _mapper.ToDomain(dto);
            var createdUnit = await _unitService.CreateUnitAsync(courseId, unitDomain);
            if (createdUnit == null)
            {
                return BadRequest($"Course with ID {courseId} doesn't exist."); 
            }
            var response = _mapper.ToDto(createdUnit);
            return CreatedAtAction(nameof(GetUnitByIdAsync), new { courseId = courseId, id = createdUnit.Id }, response);
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAllUnitsForCourseAsync(int courseId)
        {
            var units = await _unitService.GetUnitsByCourseIdAsync(courseId);

            if (units == null)
            {
                return BadRequest($"Course with ID {courseId} doesn't exist.");
            }
            var response = units.Select(u => _mapper.ToDto(u));
            return Ok(response);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUnitByIdAsync(int courseId, int id)
        {
            var unit = await _unitService.GetUnitByIdAsync(id);
            if (unit == null)
            {
                return NotFound($"Unit with ID {id} not found.");
            }
            var response = _mapper.ToDto(unit);
            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUnitAsync(int courseId, int id, [FromBody] UnitCreateDto request)
        {
            var unitDomain = _mapper.ToDomain(request);
            unitDomain.Id = id;
            var success = await _unitService.UpdateUnitAsync(unitDomain);
            if (!success)
            {
                return NotFound($"Unit with ID {id} not found.");
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUnitAsync(int courseId, int id)
        {
            var success = await _unitService.DeleteUnitAsync(id);
            if (!success)
            {
                return NotFound($"Unit with ID {id} not found.");
            }
            return NoContent();
        }
    }
}