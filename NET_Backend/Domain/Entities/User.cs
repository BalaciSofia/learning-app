
using Domain.Entities.Courses;
using Domain.Enums;

namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }

        public string PasswordHash { get; set; }
        
        public Institution Institution { get; set; }
        
        public int InstitutionId { get; set; }

        public Role Role { get; set; }

    }
}
