using Application.Contracts;
using Domain.Entities.Courses;
using Infrastructure.Data;

namespace Infrastructure.Repositories;

public class InstitutionRepository: IInstitutionRepository
{
    private readonly LearningAppDbContext _context;

    public InstitutionRepository(LearningAppDbContext context)
    {
        _context = context;
    }
    public async Task<Institution> CreateInstitutionAsync(Institution institution)
    {
        await _context.Institutions.AddAsync(institution);
        
        await _context.SaveChangesAsync();
        
        return institution;
    }

    public async Task<Institution?> GetInstitutionByIdAsync(int institutionId)
    {
        return await _context.Institutions.FindAsync(institutionId);
    }
}