using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts
{
    public interface IZoneRepository
    {
        Task<Zone?> GetByIdAsync(int zoneId);
    }
}
