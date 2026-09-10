using System.Text.Json;
using Dapper;
using Ecom.Api.Data;

namespace Ecom.Api.Api;

public static class StoreConfigApi
{
    public static RouteGroupBuilder MapStoreConfig(this RouteGroupBuilder api)
    {
        // The React app calls this once on load and applies the theme + layout.
        api.MapGet("/store-config", async (Database db, CancellationToken ct) =>
        {
            using var conn = await db.OpenAsync(ct);

            var row = await conn.QuerySingleOrDefaultAsync<StoreConfigRow>(
                """
                SELECT sc.store_name        AS StoreName,
                       sc.currency          AS Currency,
                       sc.active_layout     AS ActiveLayout,
                       sc.ai_stylist_enabled AS AiStylistEnabled,
                       t.name               AS ThemeName,
                       t.layout_type        AS ThemeLayoutType,
                       t.css_variables      AS ThemeCssVariables
                FROM store_config sc
                LEFT JOIN ui_themes t ON t.id = sc.active_theme_id
                WHERE sc.id = 1
                """);

            if (row is null)
                return Results.Problem("store_config row (id = 1) is missing.", statusCode: 500);

            ThemeDto? theme = row.ThemeName is null
                ? null
                : new ThemeDto(
                    row.ThemeName,
                    row.ThemeLayoutType ?? "grid",
                    JsonSerializer.Deserialize<JsonElement>(row.ThemeCssVariables ?? "{}"));

            return Results.Ok(new StoreConfigDto(
                row.StoreName, row.Currency, row.ActiveLayout, row.AiStylistEnabled, theme));
        });

        return api;
    }

    private sealed class StoreConfigRow
    {
        public string StoreName { get; set; } = "";
        public string Currency { get; set; } = "INR";
        public string ActiveLayout { get; set; } = "grid";
        public bool AiStylistEnabled { get; set; }
        public string? ThemeName { get; set; }
        public string? ThemeLayoutType { get; set; }
        public string? ThemeCssVariables { get; set; }
    }
}
