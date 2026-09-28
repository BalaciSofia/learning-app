using API.DTOs.TestAttemptDTO;
using API.Mapping;
using Application.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/tests/{testId}/attempts")]
    public class TestAttemptsController : ControllerBase
    {
        private readonly ITestAttemptService _testAttemptService;
        private readonly ICurrentUserService _currentUserService;
        private readonly TestAttemptMapper _testAttemptMapper;

        public TestAttemptsController(ITestAttemptService testAttemptService, ICurrentUserService currentUserService, TestAttemptMapper testAttemptMapper)
        {
            _testAttemptService = testAttemptService;
            _currentUserService = currentUserService;
            _testAttemptMapper = testAttemptMapper;
        }

        [HttpPost]
        [ProducesResponseType(typeof(StartAttemptResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> StartAttemptAsync(int testId)
        {
            int studentId = _currentUserService.UserId;
            var attempt = await _testAttemptService.StartAttemptAsync(testId, studentId);

            if(attempt == null)
                return NotFound();

            var response = _testAttemptMapper.ToStartAttemptResponse(attempt);

            return Ok(response);
        }

        [HttpPost("{attemptId:int}/{answerId:int}")]
        [ProducesResponseType(typeof(SubmitAttemptResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SubmitAnswerAsync(int testId, int attemptId, int answerId)
        {
            int studentId = _currentUserService.UserId;

            var attemptAnswer = await _testAttemptService.SubmitAnswerAsync(testId, attemptId, answerId, studentId);

            if(attemptAnswer == null)
                return NotFound();

            var response = _testAttemptMapper.ToSubmitAttemptResponse(attemptAnswer);

            return Ok(response);
        }

        [HttpPost("{attemptId:int}/submit")]
        [ProducesResponseType(typeof(AttemptSummaryResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SubmitAttemptAsync(int testId, int attemptId)
        {
            int studentId = _currentUserService.UserId;

            var attempt = await _testAttemptService.SubmitAttemptAsync(testId, attemptId, studentId);

            if(attempt == null)
                return NotFound();

            var response = _testAttemptMapper.ToSummaryResponse(attempt);

            return Ok(response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<AttemptSummaryResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAttemptsAsync(int testId)
        {
            int currentUserId = _currentUserService.UserId;
            bool isTeacher = IsTeacher();

            var attempts = await _testAttemptService.GetAttemptsAsync(testId, currentUserId, isTeacher);
            var response = _testAttemptMapper.ToSummaryResponses(attempts);

            return Ok(response);
        }

        [HttpGet("{attemptId:int}")]
        [ProducesResponseType(typeof(AttemptDetailsResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAttemptDetailsAsync(int testId, int attemptId)
        {
            int currentUserId = _currentUserService.UserId;
            bool isTeacher = IsTeacher();

            var attempt = await _testAttemptService.GetAttemptDetailsAsync(testId, attemptId, currentUserId, isTeacher);

            if(attempt == null)
                return NotFound();

            var response = _testAttemptMapper.ToDetailsResponse(attempt);

            return Ok(response);
        }

        private bool IsTeacher()
        {
            return User.IsInRole(Role.Teacher.ToString());
        }
    }
}