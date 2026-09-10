using Ecom.Api.Api.Filters;
using Ecom.Api.Constants;
using Ecom.Api.Services.Import;

namespace Ecom.Api.Api;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this RouteGroupBuilder api)
    {
        var admin = api.MapGroup(ApiRoutes.AdminGroup).AddEndpointFilter<AdminTokenFilter>();

        // POST /api/admin/products/import  (multipart: "csv" file, optional "images" ZIP)
        admin.MapPost(ApiRoutes.AdminProductsImport, async (
                HttpRequest request, IProductImportService importer, CancellationToken ct) =>
            {
                if (!request.HasFormContentType)
                    return Results.BadRequest(new { error = "Expected multipart/form-data." });

                var form = await request.ReadFormAsync(ct);
                var csv = form.Files["csv"];
                if (csv is null || csv.Length == 0)
                    return Results.BadRequest(new { error = "A 'csv' file is required." });

                var zip = form.Files["images"];

                await using var csvStream = csv.OpenReadStream();
                Stream? zipStream = zip is { Length: > 0 } ? zip.OpenReadStream() : null;
                try
                {
                    var report = await importer.ImportAsync(csvStream, zipStream, ct);
                    return Results.Ok(report);
                }
                finally
                {
                    if (zipStream is not null) await zipStream.DisposeAsync();
                }
            })
            .DisableAntiforgery();
    }
}
