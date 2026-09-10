using Ecom.Api.Api.Filters;
using Ecom.Api.Constants;
using Ecom.Api.Models.Requests;
using Ecom.Api.Services;

namespace Ecom.Api.Api;

public static class StoreConfigEndpoints
{
    public static void MapStoreConfigEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet(ApiRoutes.StoreConfig, async (IStoreConfigService svc, CancellationToken ct) =>
        {
            var dto = await svc.GetAsync(ct);
            return dto is null
                ? Results.Problem("store_config row (id = 1) is missing.", statusCode: 500)
                : Results.Ok(dto);
        });

        api.MapPatch(ApiRoutes.StoreConfig, async (
                UpdateStoreConfigRequest body, IStoreConfigService svc, CancellationToken ct) =>
            {
                var result = await svc.UpdateAsync(body, ct);
                return result.Error is not null
                    ? Results.BadRequest(new { error = result.Error })
                    : Results.Ok(result.Config);
            })
            .AddEndpointFilter<AdminTokenFilter>();

        api.MapGet(ApiRoutes.Themes, async (IStoreConfigService svc, CancellationToken ct) =>
            Results.Ok(await svc.ListThemesAsync(ct)));
    }
}
