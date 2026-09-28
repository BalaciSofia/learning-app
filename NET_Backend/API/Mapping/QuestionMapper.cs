using API.DTOs.QuestionDTO;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{
    [Mapper]
    public partial class QuestionMapper
    {
        [MapperIgnoreTarget(nameof(Question.Id))]
        [MapperIgnoreTarget(nameof(Question.TestId))]
        [MapperIgnoreTarget(nameof(Question.Test))]
        public partial Question ToEntity(AddQuestionRequest request);

        [MapperIgnoreTarget(nameof(Answer.Id))]
        [MapperIgnoreTarget(nameof(Answer.QuestionId))]
        [MapperIgnoreTarget(nameof(Answer.Question))]
        public partial Answer ToEntity(AddAnswerRequest request);

        [MapperIgnoreSource(nameof(Question.TestId))]
        [MapperIgnoreSource(nameof(Question.Test))]
        public partial QuestionResponse ToResponse(Question question);

        [MapperIgnoreSource(nameof(Answer.QuestionId))]
        [MapperIgnoreSource(nameof(Answer.Question))]
        public partial AnswerResponse ToResponse(Answer answer);

        [MapperIgnoreTarget(nameof(Question.Id))]
        [MapperIgnoreTarget(nameof(Question.TestId))]
        [MapperIgnoreTarget(nameof(Question.Test))]
        [MapperIgnoreTarget(nameof(Question.Answers))]
        public partial Question ToEntity(UpdateQuestionRequest request);

        [MapperIgnoreTarget(nameof(Answer.Id))]
        [MapperIgnoreTarget(nameof(Answer.QuestionId))]
        [MapperIgnoreTarget(nameof(Answer.Question))]
        public partial Answer ToEntity(UpdateAnswerRequest request);
    }
}
