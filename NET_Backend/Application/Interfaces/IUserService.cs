using System;
using System.Collections.Generic;
using System.Text;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task CreateUserAsync(User user);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetUserByIdAsync(int id);
        Task ChangePasswordAsync(User user, string newPassword);
        Task<User> ChangeUserRole(User user);
        Task<List<User>> GetBasicUsersAsync();
        
        Task DeleteUserAsync(User user);
        
        Task<List<User>> GetAllUsersAsync();
    }
}
