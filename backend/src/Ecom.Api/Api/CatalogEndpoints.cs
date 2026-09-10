using Ecom.Api.Constants;
using Ecom.Api.Models.Requests;
using Ecom.Api.Services;

namespace Ecom.Api.Api;

public static class CatalogEndpoints
{
    public static void MapCatalogEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet(ApiRoutes.Categories, async (ICatalogService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetCategoriesAsync(ct)));

        api.MapGet(ApiRoutes.Products, async (
                [AsParameters] ProductSearchQuery query, ICatalogService svc, CancellationToken ct) =>
            Results.Ok(await svc.SearchProductsAsync(query, ct)));

        api.MapGet(ApiRoutes.ProductById, async (int id, ICatalogService svc, CancellationToken ct) =>
        {
            var product = await svc.GetProductAsync(id, ct);
            return product is null ? Results.NotFound() : Results.Ok(product);
        });
    }
}
