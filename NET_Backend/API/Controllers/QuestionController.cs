using API.DTOs.QuestionDTO;
using API.Mapping;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/tests/{testId}/questions")]
    [Authorize(Roles = "Teacher")]
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionService _questionService;
        private readonly QuestionMapper _questionMapper;
        private readonly IAnswerService _answerService;
        private readonly ITestsService _testsService;

        public QuestionsController(IQuestionService questionService, QuestionMapper questionMapper, IAnswerService answerService, ITestsService testsService)
        {
            _questionService = questionService;
            _questionMapper = questionMapper;
            _answerService = answerService;
            _testsService = testsService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(QuestionResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> AddQuestion(
        [FromRoute] int testId,
        [FromBody] AddQuestionRequest request)
        {
                var editValidationResult = await EnsureTestIsEditableAsync(testId);

                if (editValidationResult is not null)
                {
                    return editValidationResult;
                }

                var question = _questionMapper.ToEntity(request);
                var createdQuestion = await _questionService.AddQuestionAsync(testId, question);
                var response = _questionMapper.ToResponse(createdQuestion);
                return CreatedAtAction(nameof(AddQuestion), new { testId }, response);
        }

        [HttpPut("{questionId}")]
        [ProducesResponseType(typeof(QuestionResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateQuestion(
        [FromRoute] int testId,
        [FromRoute] int questionId,
        [FromBody] UpdateQuestionRequest request)
        {
            var editValidationResult = await EnsureTestIsEditableAsync(testId);

            if (editValidationResult is not null)
            {
                return editValidationResult;
            }

            var question = _questionMapper.ToEntity(request);
            var updatedQuestion = await _questionService.UpdateQuestionAsync(testId, questionId, question);
            if (updatedQuestion == null)
                return NotFound();
            var response = _questionMapper.ToResponse(updatedQuestion);
            return Ok(response);
        }

        [HttpDelete("{questionId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> DeleteQuestion(
        [FromRoute] int testId,
        [FromRoute] int questionId)
        {
            var editValidationResult = await EnsureTestIsEditableAsync(testId);

            if (editValidationResult is not null)
            {
                return editValidationResult;
            }

            var success = await _questionService.DeleteQuestionAsync(testId, questionId);
            if (!success)
                return NotFound();
            return NoContent();
        }

        [HttpPost("{questionId}/answers")]
        [ProducesResponseType(typeof(AnswerResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> AddAnswer(
            [FromRoute] int testId,
            [FromRoute] int questionId,
            [FromBody] AddAnswerRequest request)
        {
            var editValidationResult = await EnsureTestIsEditableAsync(testId);

            if (editValidationResult is not null)
            {
                return editValidationResult;
            }

            var answer = _questionMapper.ToEntity(request);
            var createdAnswer = await _answerService.AddAnswerAsync(testId, questionId, answer);
            if (createdAnswer == null)
                return NotFound();
            var response = _questionMapper.ToResponse(createdAnswer);
            return CreatedAtAction(nameof(AddAnswer), new { testId, questionId }, response);
        }

        [HttpPut("{questionId}/answers/{answerId}")]
        [ProducesResponseType(typeof(AnswerResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateAnswer(
        [FromRoute] int testId,
        [FromRoute] int questionId,
        [FromRoute] int answerId,
        [FromBody] UpdateAnswerRequest request)
        {
            var editValidationResult = await EnsureTestIsEditableAsync(testId);

            if (editValidationResult is not null)
            {
                return editValidationResult;
            }

            var answer = _questionMapper.ToEntity(request);
            var updatedAnswer = await _answerService.UpdateAnswerAsync(testId, questionId, answerId, answer);
            if (updatedAnswer == null)
                return NotFound();
            var response = _questionMapper.ToResponse(updatedAnswer);
            return Ok(response);
        }

        [HttpDelete("{questionId}/answers/{answerId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> DeleteAnswer(
            [FromRoute] int testId,
            [FromRoute] int questionId,
            [FromRoute] int answerId)
        {
            var editValidationResult = await EnsureTestIsEditableAsync(testId);

            if (editValidationResult is not null)
            {
                return editValidationResult;
            }

            var success = await _answerService.DeleteAnswerAsync(testId, questionId, answerId);
            if (!success)
                return NotFound();
            return NoContent();
        }

        private async Task<IActionResult?> EnsureTestIsEditableAsync(int testId)
        {
            var test = await _testsService.GetTestByIdAsync(testId);

            if (test is null)
            {
                return NotFound();
            }

            if (test.IsPublished)
            {
                return Conflict(new ProblemDetails {Title="Published tests cannot be edited."});
            }

            return null;
        }
    }
}