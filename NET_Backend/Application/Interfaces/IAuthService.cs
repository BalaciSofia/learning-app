using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities.Courses;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<bool?> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<User> RegisterAsync(User user, string password, Institution institution);
    
        Task<string?> LoginAsync(string email, string password);
        Task LogoutAsync(string jti, DateTime tokenExpiry);

        Task ForgotPasswordAsync(string email, string resetPasswordBaseUrl);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
    }
}
