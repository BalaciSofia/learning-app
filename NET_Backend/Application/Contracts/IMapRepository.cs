using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts
{
    public interface IMapRepository
    {
        Task<Map?> GetByCourseIdAsync(int courseId);
    }
}
