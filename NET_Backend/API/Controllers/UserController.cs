using API.DTOs.Profile;
using API.DTOs.UserDTO;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;


namespace API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly ICurrentUserService _currentUserService;
        
        private readonly IUserService _userService;
        
        private readonly IMemoryCache _cache;

        public UserController(IUserService userService,  ICurrentUserService currentUserService,  IMemoryCache cache)
        {
            _userService = userService;
            _currentUserService = currentUserService;
            _cache = cache;
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> CreateUserAsync([FromBody] UserCreateDto dto)
        {
            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email
            };
            await _userService.CreateUserAsync(user);

            UserReadDto userReadDto = new UserReadDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            }; 
            return CreatedAtAction(nameof(CreateUserAsync), new { id = userReadDto.Id }, userReadDto);

        }

        // GET /api/auth/me
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userService.GetUserByIdAsync(_currentUserService.UserId);
            if (user is null)
            {
                return Unauthorized();
            }

            var response = new UserProfileResponse(
                user.Id,
                user.Email,
                _currentUserService.Role?.ToString() ?? "Unknown",
                _currentUserService.Permissions,
                user.FirstName,
                user.LastName,
                user.Institution?.Name
            );

            return Ok(response);
        }
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var currentUserId = _currentUserService.UserId;
            var currentUserRole = _currentUserService.Role?.ToString();

            bool isDeletingOwnAccount = currentUserId == id;
            bool isAdmin = currentUserRole != null && currentUserRole.Equals("Admin", StringComparison.OrdinalIgnoreCase);

            if (!isDeletingOwnAccount && !isAdmin)
            {
                return Forbid(); 
            }

            var userToDelete = await _userService.GetUserByIdAsync(id);
            if (userToDelete is null)
            {
                return NotFound();
            }

            await _userService.DeleteUserAsync(userToDelete);
            _cache.Set($"blacklisted_user_{id}", true, TimeSpan.FromMinutes(30));

            return NoContent();
        }
    }
}
