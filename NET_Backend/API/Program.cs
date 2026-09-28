using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using API.Mapping;
using API.Middleware;
using API.Services;
using API.Validations;
using Application.Common.Constants;
using Application.Contracts;
using Application.Helper;
using Application.Helper.IHelper;
using Application.Interfaces;
using Application.Options;
using Application.UseCases;
using Application.UseCases.Authentication;
using Application.UseCases.Conquest;
using Application.UseCases.Courses;
using Application.UseCases.StudyQuest;
using Domain.Entities;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Infrastructure.Services.AiClients;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options => options.SuppressAsyncSuffixInActionNames = false);
builder.Services.AddDbContext<LearningAppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IEmailService, MailKitEmailService>();

builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IInstitutionRepository, InstitutionRepository>();
builder.Services.AddScoped<IInstitutionService, InstitutionService>();
builder.Services.AddScoped<IUnitRepository, UnitRepository>();
builder.Services.AddScoped<IUnitService, UnitService>();
builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IAnswerRepository, AnswerRepository>();
builder.Services.AddScoped<IAnswerService, AnswerService>();
builder.Services.AddScoped<ITestsRepository, TestsRepository>();
builder.Services.AddScoped<ITestsService, TestsService>();

builder.Services.AddScoped<IStudentProfileRepository, StudentProfileRepository>();
builder.Services.AddScoped<IStudentProfileService, StudentProfileService>();
builder.Services.AddScoped<IDailyPuzzleRepository, DailyPuzzleRepository>();
builder.Services.AddScoped<IPlayerProgressRepository, PlayerProgressRepository>();
builder.Services.AddScoped<IMapRepository, MapRepository>();
builder.Services.AddScoped<ITreasureRepository, TreasureRepository>();
builder.Services.AddScoped<IQuestRepository, QuestRepository>();
builder.Services.AddScoped<IZoneRepository, ZoneRepository>();
builder.Services.AddScoped<IConquestService, ConquestService>();
builder.Services.AddScoped<IDuelRepository, DuelRepository>();
builder.Services.AddScoped<IDuelService, DuelService>();

builder.Services.AddScoped<ITestAttemptRepository, TestAttemptRepository>();
builder.Services.AddScoped<ITestAttemptService, TestAttemptService>();
builder.Services.AddScoped<IScoreCalculator, ScoreCalculator>();

builder.Services.AddScoped<CourseMapper>();
builder.Services.AddScoped<EnrollmentMapper>();
builder.Services.AddScoped<UserMapper>();
builder.Services.AddScoped<QuestionMapper>();
builder.Services.AddScoped<StudyQuestMapper>();
builder.Services.AddScoped<TestMapper>();
builder.Services.AddScoped<ConquestMapper>();
builder.Services.AddScoped<TestAttemptMapper>();
builder.Services.AddScoped<DuelMapper>();
builder.Services.AddScoped<DistractorMapper>();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

builder.Services.AddScoped<IDistractorService, DistractorService>();
builder.Services.AddHttpClient();

builder.Services.AddScoped<IAiClient>(sp =>
{
    var factory = sp.GetRequiredService<IHttpClientFactory>();
    var configuration = sp.GetRequiredService<IConfiguration>();

    var client = factory.CreateClient();
    client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");

    return new GeminiClient(
        client,
        configuration[LlmConstants.ApiKey]
        ?? throw new InvalidOperationException("Missing API_KEY"),
        configuration[LlmConstants.Model]
        ?? throw new InvalidOperationException("Missing MODEL"));
});

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<ITokenBlacklistService, TokenBlacklistService>();

var secretKey = builder.Configuration[AuthConstants.JwtSecretKey] 
                ?? throw new InvalidOperationException("JWT_SECRET_KEY configuration is missing.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = context =>
        {
            var cache = context.HttpContext.RequestServices.GetRequiredService<IMemoryCache>();
            var userIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? context.Principal?.FindFirst("sub")?.Value;
            var jtiClaim = context.Principal?.FindFirst("jti")?.Value;

            if (!string.IsNullOrEmpty(userIdClaim))
            {
                if (cache.TryGetValue($"blacklisted_user_{userIdClaim}", out bool isBlacklisted) && isBlacklisted)
                {
                    context.Fail("This account no longer exists.");
                    return Task.CompletedTask;
                }
            }

            if (!string.IsNullOrEmpty(jtiClaim))
            {
                var blacklist = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistService>();
                if (blacklist.IsBlacklisted(jtiClaim))
                {
                    context.Fail("Token has been revoked.");
                    return Task.CompletedTask;
                }
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Learning App API", Version = "v1" });
    c.CustomSchemaIds(type => type.FullName);
    
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (System.IO.File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Add JWT token from login. Format: 'Bearer [space] [token]'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("DistractorGeneration", httpContext =>
    {
        string teacherId =
            httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "anonymous";

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: teacherId,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            });
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var frontEndUrl = builder.Configuration["FrontEndUrl"] ?? "http://localhost:4200";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularFrontend", policy =>
    {
        policy
            .WithOrigins(frontEndUrl)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseCors("AngularFrontend");

app.UseAuthentication(); 
app.UseRateLimiter();
app.UseAuthorization();

app.MapControllers();

app.Run();