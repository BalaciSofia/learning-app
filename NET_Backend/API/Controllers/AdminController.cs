using API.DTOs.UserDTO;
using API.Mapping;
using Application.Interfaces;
using Application.UseCases.Authentication;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private IUserService _userService;
        private readonly UserMapper _userMapper;


        public AdminController(IUserService userService,UserMapper userMapper)
        {
            _userService = userService;
            _userMapper = userMapper;
        }

        [HttpPatch("users/{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeUserRole(int id, Role role)
        {
            var user = new User { Id = id, Role = role };

            var modifiedUser = await _userService.ChangeUserRole(user);
            var response = _userMapper.ToUserChangeRoleResponse(modifiedUser);

            return Ok(response);
        }

        [HttpGet("users/basic")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBasicUsers()
        {
            var users = await _userService.GetBasicUsersAsync();
            var response = _userMapper.ToBasicUserResponseList(users);

            return Ok(response);
        }
        
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            var response = _userMapper.ToBasicUserResponseList(users);

            return Ok(response);
        }
    }
}
