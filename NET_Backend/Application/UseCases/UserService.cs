using Application.Contracts;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Application.UseCases
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly ICourseRepository _courseRepository;

        public UserService(IUserRepository userRepository, IPasswordHasher<User> passwordHasher, ICourseRepository courseRepository)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _courseRepository = courseRepository;
        }

        public async Task CreateUserAsync(User user)
        {
            await _userRepository.AddUserAsync(user);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _userRepository.GetByEmailAsync(email);
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task ChangePasswordAsync(User user, string newPassword)
        {
            user.PasswordHash = _passwordHasher.HashPassword(user, newPassword);
            await _userRepository.UpdateAsync(user);
        }

        public async Task<User> ChangeUserRole(User user)
        {
            return await _userRepository.UpdateUserRole(user);
        }

        public async Task<List<User>> GetBasicUsersAsync()
        {
            return await _userRepository.GetUsersByRoleAsync(Role.Basic);
        }

        public async Task DeleteUserAsync(User user)
        {

            if (user.Role == Role.Teacher)
            {
                var corsesToDelete = (await _courseRepository.FilterCoursesByInstitutionAsync(user.InstitutionId, user.Id)).FindAll(c=>c.CreatorId==user.Id);
                foreach (var c in corsesToDelete)
                {
                    await _courseRepository.DeleteCourseAsync(c.Id);
                }
            }
            await _userRepository.DeleteUserAsync(user);
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllUsersAsync();
        }
    }
}
