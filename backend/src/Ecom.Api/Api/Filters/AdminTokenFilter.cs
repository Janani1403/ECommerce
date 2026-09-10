using Ecom.Api.Constants;

namespace Ecom.Api.Api.Filters;

/// <summary>
/// If AdminApi:Token is configured, the request must carry a matching
/// X-Admin-Token header. Unset (the dev default) = open. Replaced by the
/// Cognito admin role once auth is wired up.
/// </summary>
public sealed class AdminTokenFilter(IConfiguration config) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var required = config[ConfigKeys.AdminApiToken];
        if (!string.IsNullOrEmpty(required))
        {
            var provided = context.HttpContext.Request.Headers[HttpHeaderNames.AdminToken].ToString();
            if (!string.Equals(provided, required, StringComparison.Ordinal))
                return Results.StatusCode(StatusCodes.Status401Unauthorized);
        }

        return await next(context);
    }
}
