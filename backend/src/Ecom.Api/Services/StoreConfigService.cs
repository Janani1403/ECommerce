using System.Text.Json;
using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Internal;
using Ecom.Api.Models.Requests;
using Ecom.Api.Repositories;

namespace Ecom.Api.Services;

public sealed class StoreConfigService(IStoreConfigRepository repo) : IStoreConfigService
{
    public async Task<StoreConfigDto?> GetAsync(CancellationToken ct)
    {
        var row = await repo.GetAsync(ct);
        return row is null ? null : Map(row);
    }

    public Task<IReadOnlyList<ThemeSummaryDto>> ListThemesAsync(CancellationToken ct)
        => repo.ListThemesAsync(ct);

    public async Task<StoreConfigUpdateResult> UpdateAsync(
        UpdateStoreConfigRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.ThemeKey) && string.IsNullOrWhiteSpace(request.Layout))
            return StoreConfigUpdateResult.Invalid("Provide themeKey and/or layout.");

        try
        {
            var row = await repo.UpdateAsync(
                request.ThemeKey, request.Layout, Constants.CatalogDefaults.DefaultAdminId, ct);
            return row is null
                ? StoreConfigUpdateResult.Invalid("store_config row (id = 1) is missing.")
                : StoreConfigUpdateResult.Ok(Map(row));
        }
        catch (UnknownThemeException ex)
        {
            return StoreConfigUpdateResult.Invalid(ex.Message);
        }
    }

    private static StoreConfigDto Map(StoreConfigRow row)
    {
        ThemeDto? theme = row.ThemeKey is null
            ? null
            : new ThemeDto(
                row.ThemeKey,
                row.ThemeName ?? row.ThemeKey,
                row.ThemeDefaultLayout ?? "grid",
                JsonSerializer.Deserialize<JsonElement>(row.ThemeCssVariables ?? "{}"));

        return new StoreConfigDto(
            row.StoreName, row.Currency, row.ActiveLayout, row.AiStylistEnabled, theme);
    }
}
