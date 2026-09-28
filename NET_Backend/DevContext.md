# DevContext — Best Practices & Conventions

> Living document. Update this file as the team makes decisions. Treat every rule here as a **first-class constraint**, not a suggestion.

---

## 1. Architecture — Clean Architecture (Onion Layers)

```
Solution/
├── Domain/            # Enterprise business rules (Entities, Value Objects, Domain Events, Interfaces)
├── Application/       # Use-cases (Services, DTOs, Validators, Mapper configs, Interface contracts)
├── Infrastructure/    # I/O concerns (EF Core DbContext, Repositories, external services, JWT, Serilog sinks)
└── API/               # Entry point (Controllers, Middleware, DI wiring, Program.cs)
```

### Dependency Rule
> **Dependencies point inward only.**  
> `API → Application → Domain`  
> `Infrastructure → Application → Domain`  
> Nothing in `Domain` or `Application` references `Infrastructure` or `API`.

### Layer Responsibilities

| Layer | Owns | Must NOT contain |
|---|---|---|
| Domain | Entities, Value Objects, Domain Interfaces, Domain Exceptions | EF Core, HTTP, JSON |
| Application | Use-case logic, DTOs, Validators, Mapper profiles, Service interfaces | EF Core DbContext, HttpContext |
| Infrastructure | EF Core DbContext, Repositories (impl), external API clients | Business logic |
| API | Controllers, Program.cs, Middleware | Business logic, direct DB access |

---

## 2. REST API Design

### 2.1 Resource-Based URIs — Nouns, Not Verbs

```
✅ GET    /api/products
✅ GET    /api/products/{id}
✅ POST   /api/products
✅ PUT    /api/products/{id}
✅ DELETE /api/products/{id}

❌ GET  /api/getAllProducts
❌ POST /api/deleteProduct?id=5
❌ GET  /api/createProduct
```

- Use **plural nouns** for collections: `/products`, `/orders`, `/users`
- Nest sub-resources when ownership is clear: `/api/orders/{orderId}/items`
- Keep URIs **lowercase**, use hyphens for multi-word segments: `/api/product-categories`

### 2.2 HTTP Methods

| Method | Purpose | Idempotent | Safe |
|---|---|---|---|
| GET | Read resource(s) | ✅ | ✅ |
| POST | Create new resource | ❌ | ❌ |
| PUT | Full replace of a resource | ✅ | ❌ |
| PATCH | Partial update | ❌ | ❌ |
| DELETE | Remove resource | ✅ | ❌ |

> **Idempotent**: calling the same request N times has the same effect as calling it once.

### 2.3 HTTP Status Codes

| Code | When to use |
|---|---|
| `200 OK` | Successful GET / PUT / PATCH |
| `201 Created` | Successful POST — include `Location` header pointing to new resource |
| `204 No Content` | Successful DELETE or action with no response body |
| `400 Bad Request` | Client validation failure (Fluent Validation errors) |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | Authenticated but not authorized |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Duplicate / state conflict |
| `500 Internal Server Error` | Unhandled server-side error — never expose stack traces |

### 2.4 Statelessness
Each HTTP request must be **self-contained**. The server holds no client session state.  
Use **JWT** tokens — the client sends the token on every request; the server validates it without any stored session.

---

## 3. Naming Conventions

### C# General
- **PascalCase**: classes, interfaces, methods, properties, enums, records  
  `ProductService`, `IProductRepository`, `GetById`, `ProductId`
- **camelCase**: local variables, method parameters  
  `productId`, `newProduct`
- **_camelCase** (underscore prefix): private fields  
  `_productRepository`, `_logger`
- **SCREAMING_SNAKE_CASE**: constants  
  `MAX_PAGE_SIZE`
- Prefix interfaces with `I`: `IProductRepository`, `ITokenService`
- Suffix async methods with `Async`: `GetProductByIdAsync`

### Files & Folders
- One class per file; file name matches class name
- Folders match namespaces
- Controller files: `ProductsController.cs`  
- DTO files: `CreateProductRequest.cs`, `ProductResponse.cs`  
- Validator files: `CreateProductRequestValidator.cs`

### Controllers
- Route template: `[Route("api/[controller]")]`
- Controller class name drives the route segment — name it after the resource: `ProductsController` → `/api/products`

### DTOs
- Incoming (client → server): `Create{Resource}Request`, `Update{Resource}Request`
- Outgoing (server → client): `{Resource}Response`
- Never expose domain entities directly through the API

---

## 4. DTOs & Mapping — Mapperly

Use **[Mapperly](https://github.com/riok/mapperly)** for compile-time, zero-reflection mapping.

```csharp
// Application/Mappers/ProductMapper.cs
[Mapper]
public partial class ProductMapper
{
    public partial ProductResponse ToResponse(Product product);
    public partial Product ToDomain(CreateProductRequest request);
}
```

- Mapper classes live in `Application/Mappers/`
- Register as scoped or use static partial methods
- No AutoMapper — Mapperly generates code at compile time (faster, refactor-safe)

---

## 5. Validation — Fluent Validation

Use **[FluentValidation](https://docs.fluentvalidation.net/)** for all incoming DTOs.

```csharp
// Application/Validators/CreateProductRequestValidator.cs
public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThan(0);
    }
}
```

- One validator per request DTO
- Validators live in `Application/Validators/`
- Register with `builder.Services.AddValidatorsFromAssembly(...)` — do NOT call `.Validate()` manually in controllers; use the MVC integration filter

---

## 6. Data Access — EF Core

- `DbContext` lives in `Infrastructure/Persistence/`
- Repository pattern: interfaces in `Application/Interfaces/`, implementations in `Infrastructure/Repositories/`
- Use `async` repository methods everywhere: `GetByIdAsync`, `AddAsync`, `SaveChangesAsync`
- Never return `IQueryable` outside of `Infrastructure` — materialise queries inside the repository
- Use **migrations** for schema changes; never modify the database manually

---

## 7. Global Exception Handling — Problem Details

All unhandled exceptions are caught by a global handler. Never wrap every controller action in try/catch.

```csharp
// Program.cs
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
```

```csharp
// API/Middleware/GlobalExceptionHandler.cs
public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred."
        };
        context.Response.StatusCode = problemDetails.Status.Value;
        await context.Response.WriteAsJsonAsync(problemDetails, ct);
        return true;
    }
}
```

- Map known domain exceptions (e.g. `NotFoundException`) to `404`, `ValidationException` to `400`
- Never leak stack traces or internal messages to the client

---

## 8. Security — JWT & Authorization Policies

- Issue JWTs from a dedicated `ITokenService` in `Application/`
- Store signing keys in **environment variables / Azure Key Vault**, never in `appsettings.json`
- Use `[Authorize]` on controllers/actions by default; opt out with `[AllowAnonymous]` only where needed
- Define named **Authorization Policies** for role/claim-based rules:

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});
```

- Always validate token expiry, issuer, and audience (`ValidateIssuer`, `ValidateAudience`, `ValidateLifetime` = `true`)

---

## 9. Observability — Serilog

```csharp
// Program.cs
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day));
```

- Use **structured logging** — pass objects, not interpolated strings:  
  `Log.Information("Product {ProductId} created", product.Id)` ✅  
  `Log.Information($"Product {product.Id} created")` ❌
- Log levels: `Verbose` (trace), `Debug`, `Information`, `Warning`, `Error`, `Fatal`
- Never log sensitive data (passwords, tokens, PII)

---

## 10. Documentation — Swagger / OpenAPI

- Use `Swashbuckle.AspNetCore` or the built-in `Microsoft.AspNetCore.OpenApi`
- Annotate controllers with `[ProducesResponseType]` for every status code
- Add XML comments to controllers and DTOs; enable XML docs in the `.csproj`
- Swagger UI available at `/swagger` in Development only

---

## 11. SOLID Principles

> **Respect SOLID at every layer.**

| Principle | Short rule |
|---|---|
| **S** — Single Responsibility | One class, one reason to change. Split large services. |
| **O** — Open/Closed | Extend behaviour via new classes/interfaces, not by modifying existing ones. |
| **L** — Liskov Substitution | Subtypes must be substitutable for their base types without breaking behaviour. |
| **I** — Interface Segregation | Prefer small, focused interfaces over fat ones. |
| **D** — Dependency Inversion | Depend on abstractions (`IRepository`), not concrete implementations (`SqlRepository`). |

---

## 12. Additional Best Practices

- **No magic strings** — use `const`, `enum`, or strongly-typed options classes
- **Options Pattern** for configuration: `builder.Services.Configure<JwtOptions>(config.GetSection("Jwt"))`
- **Async all the way** — never block async code with `.Result` or `.Wait()`
- **Cancellation tokens** — propagate `CancellationToken` from controller to repository
- **Immutable DTOs** — prefer `record` types for request/response objects
- **Unit test** Application layer logic; **integration test** Infrastructure + API endpoints
- **No business logic in controllers** — controllers only validate input, call the service, and return a response
- **Avoid `var` when the type is not obvious** from the right-hand side

---

*Last updated: 2026-06-30*
