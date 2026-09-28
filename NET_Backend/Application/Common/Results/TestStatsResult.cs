using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Common.Results
{
    public sealed record TestStatsResult(
        int AttemptCount,
        decimal? AverageScore,
        decimal? HighScore,
        decimal? LowScore,
        List<QuestionStatsResult> QuestionBreakdown
    );
}
