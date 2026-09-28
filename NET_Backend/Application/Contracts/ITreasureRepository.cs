using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts
{
    public interface ITreasureRepository
    {
        Task<Treasure?> GetByIdAsync(int treasureId);
        
        Task <IEnumerable<Treasure>> GetAllTreasureForMapAsync(int  mapId);
    }
}
