using API.DTOs.Auth;
using FluentValidation;

namespace API.Validations
{
    public class ForgotPasswordRequestValidator: AbstractValidator<ForgotPasswordRequest>
    {
        public ForgotPasswordRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
        }

    }
}
