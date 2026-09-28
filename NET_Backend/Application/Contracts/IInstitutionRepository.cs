using Domain.Entities.Courses;

namespace Application.Contracts
{

    public interface IInstitutionRepository
    {
        public Task<Institution> CreateInstitutionAsync(Institution institution);
        
        public Task<Institution?> GetInstitutionByIdAsync(int institutionId);
    }
}