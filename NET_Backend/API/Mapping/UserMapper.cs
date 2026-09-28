using API.DTOs.QuestionDTO;
using API.DTOs.RegisterDTO;
using API.DTOs.UserDTO;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{
    [Mapper]
    public partial class UserMapper
    {
        [MapperIgnoreSource(nameof(RegisterRequest.Password))]
        [MapperIgnoreSource(nameof(RegisterRequest.ConfirmPassword))]
        [MapperIgnoreTarget(nameof(User.Id))]
        [MapperIgnoreTarget(nameof(User.PasswordHash))]
        [MapperIgnoreTarget(nameof(User.Role))]
        public partial User ToUser(RegisterRequest request);

        [MapperIgnoreSource(nameof(User.PasswordHash))]
        [MapperIgnoreSource(nameof(User.Role))]
        public partial RegisterResponse ToRegisterResponse(User user);

        [MapperIgnoreSource(nameof(User.FirstName))]
        [MapperIgnoreSource(nameof(User.LastName))]
        [MapperIgnoreSource(nameof(User.Email))]
        [MapperIgnoreSource(nameof(User.PasswordHash))]
        public partial UserChangeRoleResponse ToUserChangeRoleResponse(User user);

        [MapperIgnoreSource(nameof(Question.TestId))]
        [MapperIgnoreSource(nameof(Question.Test))]
        public partial QuestionResponse ToResponse(Question question);

        [MapperIgnoreSource(nameof(Answer.QuestionId))]
        [MapperIgnoreSource(nameof(Answer.Question))]
        public partial AnswerResponse ToResponse(Answer answer);
        [MapperIgnoreSource(nameof(User.PasswordHash))]
        public partial BasicUserResponse ToBasicUserResponse(User user);

        public List<BasicUserResponse> ToBasicUserResponseList(List<User> users)
            => users.Select(ToBasicUserResponse).ToList();

    }
}   
