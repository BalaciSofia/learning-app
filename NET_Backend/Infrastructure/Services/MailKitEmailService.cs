using Application.Contracts;
using Application.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Infrastructure.Services
{
    public class MailKitEmailService :IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public MailKitEmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetLink)
        {
            MimeMessage message = new MimeMessage();

            message.From.Add(new MailboxAddress(
                _emailSettings.FromName,
                _emailSettings.FromEmail));


            message.To.Add(MailboxAddress.Parse(email));
            message.Subject = "Password reset request";

            message.Body = new TextPart("html")
            {
                Text = $@"
                    <p>Hello,</p>
                    <p>You requested a password reset.</p>
                    <p>Click the link below to reset your password:</p>
                    <p><a href=""{resetLink}"">Reset password</a></p>
                    <p>If you did not request this, you can ignore this email.</p>"
            };

            using SmtpClient smtpClient = new SmtpClient();

            await smtpClient.ConnectAsync(
                _emailSettings.SmtpHost,
                _emailSettings.SmtpPort,
                SecureSocketOptions.StartTls);

            await smtpClient.AuthenticateAsync(
                _emailSettings.Username,
                _emailSettings.Password);

            await smtpClient.SendAsync(message);

            await smtpClient.DisconnectAsync(true);
        }
    }
}


