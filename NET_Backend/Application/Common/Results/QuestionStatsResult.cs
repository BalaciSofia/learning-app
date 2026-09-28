using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Common.Results
{
    public sealed record QuestionStatsResult(
        int QuestionId,
        string Text,
        decimal CorrectRate
    );
}
