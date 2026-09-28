using Application.Contracts;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
//should be accesible only by users with admin role imho
//TODO
    [ApiController]
    [Authorize(Roles="Admin")]
    [Route("api/institutions")]
    public class InstitutionController
    {
        
        private readonly IInstitutionService _institutionService;


    }
}