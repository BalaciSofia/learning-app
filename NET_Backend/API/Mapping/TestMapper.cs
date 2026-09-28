using API.DTOs.QuestionDTO;
using API.DTOs.TestsDTO;
using Domain.Entities;
using Riok.Mapperly.Abstractions;
using Application.Common.Results;


namespace API.Mapping
{
    [Mapper]
    public partial class TestMapper
    {
        [MapperIgnoreTarget(nameof(Test.Id))]
        [MapperIgnoreTarget(nameof(Test.CreatorId))]
        [MapperIgnoreTarget(nameof(Test.Questions))]
        public partial Test ToTest(CreateTestRequest request);

        public partial CreateTestResponse ToCreateTestResponse(Test test);

        private partial QuestionResponse ToQuestionResponse(Question question);

        private partial AnswerResponse ToAnswerResponse(Answer answer);

        [MapProperty("Questions.Count", nameof(TestSummaryResponse.QuestionCount))]
        public partial TestSummaryResponse ToTestSummaryResponse(Test test);

        public partial IEnumerable<TestSummaryResponse> ToTestSummaryResponses(IEnumerable<Test> tests);

        public partial StudentTestResponse ToStudentTestResponse(Test test);

        private partial StudentQuestionResponse ToStudentQuestionResponse(Question question);

        private partial StudentAnswerResponse ToStudentAnswerResponse(Answer answer);

        public partial TestStatsResponse ToTestStatsResponse(TestStatsResult result);

        private partial QuestionStatsResponse ToQuestionStatsResponse(QuestionStatsResult result);

        [MapperIgnoreTarget(nameof(Test.Id))]
        [MapperIgnoreTarget(nameof(Test.CreatorId))]
        public partial Test ToTest(UpdateTestRequest request);

        [MapperIgnoreTarget(nameof(Question.TestId))]
        [MapperIgnoreTarget(nameof(Question.Test))]
        private partial Question ToQuestion(API.DTOs.TestsDTO.TestUpdateQuestionRequest request);

        [MapperIgnoreTarget(nameof(Answer.QuestionId))]
        [MapperIgnoreTarget(nameof(Answer.Question))]
        private partial Answer ToAnswer(API.DTOs.TestsDTO.TestUpdateAnswerRequest request);
    }
}
