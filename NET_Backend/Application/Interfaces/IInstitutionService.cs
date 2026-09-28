using Domain.Entities.Courses;

namespace Application.Interfaces
{

    public interface IInstitutionService
    {
        public Task<Institution> CreateInstitutionAsync(Institution institution);
        
        public Task<Institution?> GetInstitutionByIdAsync(int institutionId);
    }
}