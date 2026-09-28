using API.DTOs.DuelDTO;
using API.Mapping;
using Application.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Student")]
    public class DuelController : ControllerBase
    {
        private readonly IDuelService _duelService;
        private readonly ICurrentUserService _currentUserService;
        private readonly DuelMapper _mapper;
        private readonly IUserService _userService;
        private readonly ITestsService _testsService;

        public DuelController(IDuelService duelService, ICurrentUserService currentUserService, DuelMapper mapper, IUserService userService, ITestsService testsService)
        {
            _duelService = duelService;
            _currentUserService = currentUserService;
            _mapper = mapper;
            _userService = userService;
            _testsService = testsService;
        }

        [HttpGet("api/duels/students")]
        [ProducesResponseType(typeof(List<StudentSummaryResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetChallengableStudentsAsync()
        {
            var currentUser = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (currentUser is null)
                return Unauthorized();

            if (currentUser.InstitutionId == 0)
                return BadRequest("Current user does not belong to an institution.");

            var students = await _duelService.GetChallengableStudentsAsync(currentUser);
            var response = _mapper.ToStudentSummaries(students);
            return Ok(response);
        }

        [HttpPost("api/duels/invitations")]
        [ProducesResponseType(typeof(DuelInvitationResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> SendInvitationAsync([FromBody] SendDuelInvitationRequest request)
        {
            var challenger = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (challenger is null)
                return Unauthorized();

            if (request.ChallengedStudentId == challenger.Id)
                return BadRequest("You cannot challenge yourself.");

            var test = await _testsService.GetTestByIdAsync(request.TestId);
            if (test is null)
                return NotFound($"Test with ID {request.TestId} not found.");

            var existingInvitation = await _duelService.GetActiveInvitationAsync(challenger.Id, request.ChallengedStudentId, request.TestId);
            if (existingInvitation is not null)
                return BadRequest("You already have a pending or active invitation with this student for this test.");

            var invitation = await _duelService.SendInvitationAsync(challenger, request.ChallengedStudentId, test);
            if (invitation == null)
                return BadRequest("Failed to create the invitation.");

            var response = _mapper.ToInvitationResponse(invitation);
            return Ok(response);
        }

        [HttpGet("api/duels/invitations")]
        [ProducesResponseType(typeof(List<DuelInvitationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetIncomingInvitationsAsync()
        {
            var currentUser = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (currentUser is null)
                return Unauthorized();

            var invitations = await _duelService.GetIncomingInvitationsAsync(currentUser);
            var response = _mapper.ToInvitationResponses(invitations);
            return Ok(response);
        }

        [HttpPost("api/duels/invitations/{duelId:int}/accept")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AcceptInvitationAsync(int duelId)
        {
            var currentUser = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (currentUser is null)
                return Unauthorized();

            var invitation = await _duelService.GetInvitationByIdAsync(duelId);
            if (invitation is null)
                return NotFound($"Duel invitation with ID {duelId} not found.");

            if (invitation.ChallengedId != currentUser.Id)
                return Forbid();

            if (invitation.Status != InvitationStatus.Pending)
                return BadRequest("This invitation is no longer pending.");

            await _duelService.AcceptInvitationAsync(duelId, currentUser);
            return NoContent();
        }

        [HttpPost("api/duels/invitations/{duelId:int}/reject")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RejectInvitationAsync(int duelId)
        {
            var currentUser = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (currentUser is null)
                return Unauthorized();

            var invitation = await _duelService.GetInvitationByIdAsync(duelId);
            if (invitation is null)
                return NotFound($"Duel invitation with ID {duelId} not found.");

            if (invitation.ChallengedId != currentUser.Id)
                return Forbid();

            if (invitation.Status != InvitationStatus.Pending)
                return BadRequest("This invitation is no longer pending.");

            await _duelService.RejectInvitationAsync(duelId, currentUser);
            return NoContent();
        }

        [HttpPost("api/duels/{duelId:int}/result")]
        [ProducesResponseType(typeof(SubmitScoreResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SaveDuelResultAsync(int duelId, [FromBody] SaveDuelResultRequest request)
        {
            var currentUser = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (currentUser is null)
                return Unauthorized();

            var invitation = await _duelService.GetInvitationByIdAsync(duelId);
            if (invitation is null)
                return NotFound($"Duel with ID {duelId} not found.");

            if (invitation.ChallengerId != currentUser.Id && invitation.ChallengedId != currentUser.Id)
                return Forbid();

            if (invitation.Status != InvitationStatus.Accepted)
                return BadRequest("This duel has not been accepted or is already completed.");

            if ((invitation.ChallengerId == currentUser.Id && invitation.ChallengerScore.HasValue) ||
                (invitation.ChallengedId == currentUser.Id && invitation.ChallengedScore.HasValue))
            {
                return BadRequest("You have already submitted your score for this duel.");
            }

            var saveResultOutcome = await _duelService.SaveResultAsync(duelId, request.CorrectAnswers, currentUser);
            if (saveResultOutcome == null)
                return NotFound($"Duel with ID {duelId} not found.");

            var (isCompleted, result) = saveResultOutcome.Value;
            var response = new SubmitScoreResponse
            {
                IsCompleted = isCompleted,
                Message = isCompleted ? "Duel completed." : "Score submitted. Waiting for opponent.",
                Result = result != null ? _mapper.ToResultResponse(result) : null
            };
            return Ok(response);
        }

        [HttpGet("api/duels/active")]
        [ProducesResponseType(typeof(List<DuelInvitationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetActiveDuelsAsync()
        {
            var currentUser = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (currentUser is null)
                return Unauthorized();

            var activeDuels = await _duelService.GetActiveDuelsAsync(currentUser);
            var response = _mapper.ToInvitationResponses(activeDuels);
            return Ok(response);
        }

        [HttpGet("api/duels/history")]
        [ProducesResponseType(typeof(List<DuelHistoryResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetDuelHistoryAsync()
        {
            var currentUser = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (currentUser is null)
                return Unauthorized();

            var history = await _duelService.GetHistoryAsync(currentUser);
            var response = _mapper.ToHistoryResponses(history);
            return Ok(response);
        }
    }
}
