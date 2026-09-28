using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts
{
    public interface IQuestRepository
    {
        Task<Quest?> GetByIdAsync(int questId);
        
        Task<IEnumerable<Quest>> GetAllQuestsForMapAsync(int mapId);
    }
}
