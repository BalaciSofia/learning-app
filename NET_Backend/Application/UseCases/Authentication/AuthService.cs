using Application.Contracts;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Domain.Entities.Courses;

namespace Application.UseCases.Authentication
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly ITokenService _tokenService;
        private readonly ITokenBlacklistService _tokenBlacklistService;
        private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
        private readonly IEmailService _emailService;
        public AuthService(IUserRepository userRepository, IPasswordHasher<User> passwordHasher, ITokenService tokenService, ITokenBlacklistService tokenBlacklistService, IPasswordResetTokenRepository passwordResetTokenRepository,IEmailService emailService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _tokenBlacklistService = tokenBlacklistService;
            _passwordResetTokenRepository= passwordResetTokenRepository;
            _emailService = emailService;
        }

        public async Task<User> RegisterAsync(User user, string password, Institution institution)
        {
            User? existingUser = await _userRepository.GetByEmailAsync(user.Email);
            if (existingUser is not null)
            {
                throw new InvalidOperationException("A user with this email already exists.");
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, password);
            user.Role = Role.Basic;

            user.InstitutionId = institution.Id;
           
            return await _userRepository.AddUserAsync(user);
           
        }

        public async Task<bool?> ChangePasswordAsync(
     int userId,
     string currentPassword,
     string newPassword)
        {
            User? user = await _userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return null;
            }

            PasswordVerificationResult verificationResult =
                _passwordHasher.VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    currentPassword);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return false;
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, newPassword);
            await _userRepository.UpdateAsync(user);

            return true;
        }

        public async Task<string?> LoginAsync(string email, string password)
        {
            User? user = await _userRepository.GetByEmailAsync(email);

            if (user is null)
            {
                return null;
            }

            var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);

            if (passwordVerificationResult == PasswordVerificationResult.Failed)
            {
                return null;
            }

            string token = _tokenService.GenerateToken(user.Id,user.FirstName, user.Email, user.Role, user.InstitutionId);

            return token;
        }

        public Task LogoutAsync(string jti, DateTime tokenExpiry)
        {
            return _tokenBlacklistService.InvalidateAsync(jti, tokenExpiry);
        }

        public async Task ForgotPasswordAsync(string email,string resetPasswordBaseUrl)
        {
            User? user = await _userRepository.GetByEmailAsync(email);

            if (user is null)
            {
                return;
            }

            string token = GeneratePasswordResetToken();
            string tokenHash = HashResetToken(token);

            PasswordResetToken passwordResetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };


            await _passwordResetTokenRepository.AddAsync(passwordResetToken);
            string resetLink = $"{resetPasswordBaseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(token)}";
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);
        }


        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            string tokenHash = HashResetToken(token);

            PasswordResetToken? passwordResetToken =
                await _passwordResetTokenRepository.GetByTokenAsync(tokenHash);

            if (passwordResetToken is null)
            {
                return false;
            }

            if (passwordResetToken.ExpiresAt < DateTime.UtcNow)
            {
                return false;
            }

            if (passwordResetToken.UsedAt is not null)
            {
                return false;
            }

            User user = passwordResetToken.User;

            user.PasswordHash = _passwordHasher.HashPassword(user, newPassword);
            passwordResetToken.UsedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            await _passwordResetTokenRepository.UpdateAsync(passwordResetToken);

            return true;
        }

        private static string GeneratePasswordResetToken()
        {
            byte[] tokenBytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToHexString(tokenBytes);
        }

        private static string HashResetToken(string token)
        {
            byte[] tokenBytes = Encoding.UTF8.GetBytes(token);
            byte[] hashBytes = SHA256.HashData(tokenBytes);

            return Convert.ToHexString(hashBytes);
        }

    }
}