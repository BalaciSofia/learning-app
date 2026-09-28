using API.DTOs.Distractor;
using API.Mapping;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;


namespace API.Controllers
{
    [ApiController]
    [Route("api/tests")]
    [EnableRateLimiting("DistractorGeneration")]
    [Authorize(Roles = "Teacher")]
    public class DistractorsController : ControllerBase
    {
        private readonly IDistractorService _distractorService;
        
        private readonly DistractorMapper _mapper;

        public DistractorsController(IDistractorService distractorService, DistractorMapper mapper)
        {
            _distractorService = distractorService;
            _mapper = mapper;
        }
        [HttpPost("generate-distractors")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<GenerateDistractorsResponse>>
            GenerateDistractors(
                GenerateDistractorsRequest request,
                CancellationToken cancellationToken)
        {
            IReadOnlyList<string> distractors =
                await _distractorService.GenerateDistractorsAsync(
                    request.QuestionText,
                    request.CorrectAnswer,
                    cancellationToken);

            return Ok(_mapper.ToDto(distractors));
        }
    }
}