using Application.Contracts;
using Application.Interfaces;
using Domain.Entities.Courses;

namespace Application.UseCases.Courses
{

    public class InstitutionService : IInstitutionService
    {
        private readonly IInstitutionRepository _institutionRepository;

        public InstitutionService(IInstitutionRepository institutionRepository)
        {
            _institutionRepository = institutionRepository;
        }

        public Task<Institution> CreateInstitutionAsync(Institution institution)
        {
            return _institutionRepository.CreateInstitutionAsync(institution);
        }

        public Task<Institution?> GetInstitutionByIdAsync(int institutionId)
        {
            return _institutionRepository.GetInstitutionByIdAsync(institutionId);
        }
    }
}