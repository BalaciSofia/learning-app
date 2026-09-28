using System;
using System.Collections.Generic;
using System.Text;
using Domain.Entities;
using Domain.Enums;

namespace Application.Contracts
{
    public interface IUserRepository
    {
        Task<User> AddUserAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task UpdateAsync(User user);
        Task<User> UpdateUserRole(User user);
        Task<List<User>> GetUsersByRoleAsync(Role role);
        
        Task DeleteUserAsync(User user);
        Task<List<User>> GetAllUsersAsync();
    }
}
