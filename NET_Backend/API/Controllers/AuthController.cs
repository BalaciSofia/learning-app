using API.DTOs.Auth;
using API.DTOs.AuthDTO;
using API.DTOs.RegisterDTO;
using API.Mapping;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ICurrentUserService _currentUserService;
    private readonly UserMapper _userMapper;
    private readonly IAuthService _authService;
    private readonly IInstitutionService _institutionService;


    public AuthController(ICurrentUserService currentUserService, UserMapper userMapper,IAuthService authService, IInstitutionService institutionService)
    {
        _currentUserService = currentUserService;
        _userMapper = userMapper;
        _authService = authService;
        _institutionService = institutionService;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(RegisterRequest registerRequest)
    {
        var user = _userMapper.ToUser(registerRequest);
        var institution = await _institutionService.GetInstitutionByIdAsync(registerRequest.InstitutionId);
        var createdUser = await _authService.RegisterAsync(user, registerRequest.Password, institution);
        var response = _userMapper.ToRegisterResponse(createdUser);
        return Created($"/api/users/{response.Id}", response);
    }

    
    [HttpPost("change-password")]
[Authorize]
[ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
{
    bool? passwordMatched = await _authService.ChangePasswordAsync(
        _currentUserService.UserId,
        dto.CurrentPassword,
        dto.NewPassword);

    if (passwordMatched is null)
    {
        return NotFound();
    }

    if (!passwordMatched.Value)
    {
        return BadRequest("Current password incorrect.");
    }

    return Ok("Password changed successfully.");
}

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(LoginRequestDto dto)
    {
        string? token = await _authService.LoginAsync(dto.Email, dto.Password);

        if(token is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        return Ok(new
        {
            AccessToken = token
        });
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout()
    {
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        var expClaim = User.FindFirst(JwtRegisteredClaimNames.Exp)?.Value;

        if (string.IsNullOrEmpty(jti))
            return BadRequest("Token is missing required claims.");

        var tokenExpiry = long.TryParse(expClaim, out long expSeconds)
            ? DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime
            : DateTime.UtcNow.AddMinutes(5);

        await _authService.LogoutAsync(jti, tokenExpiry);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        string origin = Request.Headers["Origin"].ToString();

        string resetPasswordBaseUrl = !string.IsNullOrWhiteSpace(origin)
            ? origin
            : $"{Request.Scheme}://{Request.Host}";

        await _authService.ForgotPasswordAsync(request.Email,resetPasswordBaseUrl);

        return Ok(new
        {
            message = "If an account with this email exists, a password reset link has been sent."
        });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        bool passwordReset = await _authService.ResetPasswordAsync(
            request.Token,
            request.NewPassword);

        if (!passwordReset)
        {
            return BadRequest(new
            {
                message = "Invalid or expired reset link."
            });
        }

        return Ok(new
        {
            message = "Password has been reset successfully."
        });
    }




}
