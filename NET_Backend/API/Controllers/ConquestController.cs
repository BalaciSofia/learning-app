using API.DTOs.ConquestDTO;
using API.DTOs.QuestionDTO;
using API.Mapping;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/conquest")]
    [Authorize(Roles = "Student")]
    public class ConquestController : ControllerBase
    {
        private readonly IConquestService _conquestService;
        private readonly ConquestMapper _conquestMapper;
        private readonly QuestionMapper _questionMapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAnswerService _answerService;
        private readonly IQuestionService _questionService;

        public ConquestController(
            IConquestService conquestService,
            ConquestMapper conquestMapper,
            QuestionMapper questionMapper,
            ICurrentUserService currentUserService,
            IAnswerService answerService,
            IQuestionService questionService)
        {
            _questionMapper = questionMapper;
            _conquestService = conquestService;
            _conquestMapper = conquestMapper;
            _currentUserService = currentUserService;
            _answerService = answerService;
            _questionService = questionService;
        }

        [HttpPost("claim-treasure")]
        [ProducesResponseType(typeof(ClaimTreasureResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ClaimTreasure(
            [FromBody] ClaimTreasureRequest request)
        {
            var userId = _currentUserService.UserId;

            var treasure = await _conquestService.GetTreasureByIdAsync(request.TreasureId);
            if (treasure == null)
                return NotFound();

            var progress = await _conquestService
                .ClaimTreasureAsync(userId, treasure, request.CourseId);

            if (progress == null)
                return NotFound();

            return Ok(new ClaimTreasureResponse { TotalXp = progress.TotalXp });
        }

        [HttpPost("answer-quest")]
        [ProducesResponseType(typeof(AnswerQuestResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AnswerQuest(
            [FromBody] AnswerQuestRequest request)
        {
            var userId = _currentUserService.UserId;

            var quest = await _conquestService.GetQuestByIdAsync(request.QuestId);
            if (quest == null)
                return NotFound();

            var (correct, xpAwarded, progress) = await _conquestService
                .AnswerQuestAsync(userId, quest, request.AnswerIds, request.CourseId);

            if (progress == null)
                return NotFound();

            return Ok(new AnswerQuestResponse
            {
                Correct = correct,
                XpAwarded = xpAwarded,
                TotalXp = progress.TotalXp
            });
        }

        [HttpGet("progress")]
        [ProducesResponseType(typeof(ConquestResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetConquestForUserAndCourseAsync(int courseId)
        {
            int userId = _currentUserService.UserId;
            var map = await _conquestService.GetMapByCourseIdAsync(courseId);
            if (map is null)
            {
                return BadRequest("Course does not have an associated map.");
            }
            
            var progress = await _conquestService.GetConquestForUserAndMapAsync(userId, map);

            ConquestResponse finalResponse;
            if (progress is null)
            {
                finalResponse = new ConquestResponse
                {
                    AllZones = new List<ZoneResponse>(),
                    ConqueredZones = new List<ZoneResponse>(),
                    ConqueredQuests = new List<QuestResponse>(),
                    ConqueredTreasures = new List<TreasureResponse>(),
                    AllQuests = map.Quests != null ? map.Quests.Select(q => _conquestMapper.ToQuestResponse(q)).ToList() : new List<QuestResponse>(),
                    AllTreasures = map.Treasures != null ? map.Treasures.Select(t => _conquestMapper.ToTreasureResponse(t)).ToList() : new List<TreasureResponse>(),
                    TotalXp = 0
                };
            }
            else
            {
                finalResponse = _conquestMapper.ToConquestResponse(progress, map);
            }

            if (map.Zones != null)
            {
                var zoneResponses = new List<ZoneResponse>();

                foreach (var z in map.Zones)
                {
                    var zoneResp = _conquestMapper.ToZoneResponse(z);

                    if (z.QuestionId > 0)
                    {
                        var questionEntity = await _questionService.GetQuestionByIdAsync(z.QuestionId);
                        if (questionEntity != null)
                        {
                            zoneResp.Question = _questionMapper.ToResponse(questionEntity);
                        }
                    }

                    zoneResponses.Add(zoneResp);
                }

                finalResponse.AllZones = zoneResponses;
            }

            return Ok(finalResponse);
        }

        [HttpPost("conquer-zone")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ConquerNewZoneAsync(int courseId, int zoneId,
            [FromBody] AnswerRequest answerDto)
        {
            int userId = _currentUserService.UserId;
            var map = await _conquestService.GetMapByCourseIdAsync(courseId);

            if (map is null)
            {
                return BadRequest("Course does not have an associated map.");
            }

            var zone = await _conquestService.GetZoneByIdAsync(zoneId);
            if (zone is null)
            {
                return BadRequest("Zone does not exist.");
            }

            var question = zone.Question;
            if (question is null)
            {
                return BadRequest("This zone does not have a challenge question.");
            }

            var answerTasks = answerDto.AnswerIds.Select(aId => _answerService.GetAnswerAsync(question.Id, aId));
            var answerList = await Task.WhenAll(answerTasks);

            var updatedXp = await _conquestService.ConquerNewZoneAsync(userId, map, zone, answerList.ToList());

            if (updatedXp is null)
            {
                return BadRequest("Incorrect answers or zone is not available for conquest.");
            }

            return Ok(updatedXp);
        }
    }
}