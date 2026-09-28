using API.DTOs.Distractor;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{
    [Mapper]
    public partial class DistractorMapper
    {
        public partial GenerateDistractorsResponse ToDto(IReadOnlyList<string> distractors);
    }
}