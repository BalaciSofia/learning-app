using API.DTOs.TestsDTO;
using API.Mapping;
using Application.Interfaces;
using Application.Common.Results;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestsController : ControllerBase
    {
        private readonly ITestsService _testsService;
        private readonly ITestAttemptService _testAttemptService;
        private readonly TestMapper _testMapper;
        private readonly ICurrentUserService _currentUserService;

        public TestsController(
            ITestsService testsService,
            ITestAttemptService testAttemptService,
            TestMapper testMapper,
            ICurrentUserService currentUserService)
        {
            _testsService = testsService;
            _testAttemptService = testAttemptService;
            _testMapper = testMapper;
            _currentUserService = currentUserService;
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        [ProducesResponseType(typeof(CreateTestResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateTest([FromBody] CreateTestRequest request)
        {
            var test = _testMapper.ToTest(request);
            test.CreatorId = _currentUserService.UserId;

            var createdTest = await _testsService.CreateTestAsync(test);
            var response = _testMapper.ToCreateTestResponse(createdTest);

            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }

        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<TestSummaryResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetTests()
        {
            if (_currentUserService.Role is null)
            {
                return Forbid();
            }

            var tests = await _testsService.GetTestsForUserAsync(_currentUserService.UserId, _currentUserService.Role.Value);

            var response = _testMapper.ToTestSummaryResponses(tests);

            if (_currentUserService.Role.Value == Role.Student)
            {
                var attemptedTestIds = await _testAttemptService.GetAttemptedTestIdsAsync(_currentUserService.UserId);
                response = response.Select(r => r with { HasAttempted = attemptedTestIds.Contains(r.Id) });
            }

            return Ok(response);
        }

        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(CreateTestResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var test = await _testsService.GetTestByIdAsync(id);
            if (test is null)
            {
                return NotFound();
            }

            if ((_currentUserService.Role is Role.Student or Role.Basic) && !test.IsPublished)
            {
                return NotFound();
            }

            if (_currentUserService.Role is Role.Student or Role.Basic)
            {
                return Ok(_testMapper.ToStudentTestResponse(test));
            }

            return Ok(_testMapper.ToCreateTestResponse(test));
        }

        [HttpGet("{testId:int}/stats")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(typeof(TestStatsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetStats(int testId)
        {
            Test? existing = await _testsService.GetTestByIdAsync(testId);
            if (existing is null)
            {
                return NotFound();
            }

            if (existing.CreatorId != _currentUserService.UserId)
            {
                return Forbid();
            }

            TestStatsResult? stats = await _testsService.GetTestStatsAsync(testId);
            if (stats is null)
            {
                return NotFound();
            }

            TestStatsResponse response = _testMapper.ToTestStatsResponse(stats);
            return Ok(response);
        }



        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        [ProducesResponseType(typeof(CreateTestResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateTest(int id, [FromBody] UpdateTestRequest request)
        {
            var existing = await _testsService.GetTestByIdAsync(id);
            if (existing is null)
            {
                return NotFound();
            }

            if (!IsOwnerOrAdmin(existing))
            {
                return Forbid();
            }

            if(existing.IsPublished)
            {
                return Conflict(new ProblemDetails {Title="Published tests cannot be edited."});
            }

            var test = _testMapper.ToTest(request);
            test.Id = id;

            var updatedTest = await _testsService.UpdateTestAsync(test);
            if (updatedTest is null)
            {
                return NotFound();
            }

            var response = _testMapper.ToCreateTestResponse(updatedTest);
            return Ok(response);
        }

        [HttpPatch("{id}/publish")]
        [Authorize(Roles = "Teacher,Admin")]
        [ProducesResponseType(typeof(CreateTestResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> PublishTest(int id)
        {
            var existing = await _testsService.GetTestByIdAsync(id);

            if(existing is null)
                return NotFound();

            if(!IsOwnerOrAdmin(existing))
                return Forbid();

            if(existing.IsPublished)
                return Conflict(new ProblemDetails {Title="Test is already published."});

            var publishedTest = await _testsService.PublishTestAsync(id);

            if(publishedTest is null)
                return NotFound();

            var response = _testMapper.ToCreateTestResponse(publishedTest);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTest(int id)
        {
            var existing = await _testsService.GetTestByIdAsync(id);
            if (existing is null)
            {
                return NotFound();
            }

            if (!IsOwnerOrAdmin(existing))
            {
                return Forbid();
            }

            await _testsService.DeleteTestAsync(id);
            return NoContent();
        }
        private bool IsOwnerOrAdmin(Test test)
        {
            return _currentUserService.Role == Role.Admin || test.CreatorId == _currentUserService.UserId;
        }
    }
}
