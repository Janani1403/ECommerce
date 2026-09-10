using Ecom.Api.Constants;

namespace Ecom.Api.Api;

public static class HealthEndpoints
{
    public static void MapHealthEndpoints(this WebApplication app)
        => app.MapGet(ApiRoutes.Health, () => Results.Ok(new { status = "ok" }));
}
