using API.DTOs.StudyQuest;
using API.Mapping;
using Application.Common.Results;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/studyquest")]
    [Authorize(Roles = "Student")]
    public class StudyQuestController : ControllerBase
    {
        private readonly IStudentProfileService _profileService;
        private readonly ICurrentUserService _currentUser;
        private readonly StudyQuestMapper _mapper;

        public StudyQuestController(
            IStudentProfileService profileService,
            ICurrentUserService currentUser,
            StudyQuestMapper mapper)
        {
            _profileService = profileService;
            _currentUser = currentUser;
            _mapper = mapper;
        }

        [HttpGet("profile")]
        [ProducesResponseType(typeof(StudentProfileResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProfile([FromQuery] int courseId)
        {
            var result = await _profileService.GetProfileAsync(_currentUser.UserId, courseId);
            if (result is null) return NotFound();
            return Ok(_mapper.ToResponse(result.Value.Profile, result.Value.User));
        }

        [HttpGet("daily-puzzle")]
        [ProducesResponseType(typeof(DailyPuzzleResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDailyPuzzle([FromQuery] int courseId)
        {
            var result = await _profileService.GetDailyPuzzleAsync(_currentUser.UserId, courseId);
            if (result is null) return NotFound();
            return Ok(_mapper.ToResponse(result));
        }

        [HttpPost("answer-daily-puzzle")]
        [ProducesResponseType(typeof(AnswerDailyPuzzleResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AnswerDailyPuzzle([FromBody] AnswerDailyPuzzleRequest request)
        {
            AnswerDailyPuzzleResult? result = await _profileService.AnswerDailyPuzzleAsync(
                _currentUser.UserId, request.CourseId, request.AnswerIndex);
            if (result is null) return NotFound();
            return Ok(_mapper.ToResponse(result));
        }

        [HttpPost("share-progress")]
        [ProducesResponseType(typeof(ShareProgressResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ShareProgress([FromBody] ShareProgressRequest request)
        {
            ShareProgressResult? result = await _profileService.ShareProgressAsync(_currentUser.UserId, request.CourseId);
            if (result is null) return NotFound();
            return Ok(_mapper.ToResponse(result));
        }
    }
}
