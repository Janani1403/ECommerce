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
                SELECT sc.store_name         AS StoreName,
                       sc.currency           AS Currency,
                       sc.active_layout      AS ActiveLayout,
                       sc.ai_stylist_enabled AS AiStylistEnabled,
                       t.key_name            AS ThemeKey,
                       t.name                AS ThemeName,
                       t.default_layout      AS ThemeDefaultLayout,
                       t.css_variables       AS ThemeCssVariables
                FROM store_config sc
                LEFT JOIN ui_themes t ON t.id = sc.active_theme_id
                WHERE sc.id = 1
                """);

            if (row is null)
                return Results.Problem("store_config row (id = 1) is missing.", statusCode: 500);

            ThemeDto? theme = row.ThemeKey is null
                ? null
                : new ThemeDto(
                    row.ThemeKey,
                    row.ThemeName ?? row.ThemeKey,
                    row.ThemeDefaultLayout ?? "grid",
                    JsonSerializer.Deserialize<JsonElement>(row.ThemeCssVariables ?? "{}"));

            return Results.Ok(new StoreConfigDto(
                row.StoreName, row.Currency, row.ActiveLayout, row.AiStylistEnabled, theme));
        });

        // All installable themes - used by the admin panel / template picker.
        api.MapGet("/themes", async (Database db, CancellationToken ct) =>
        {
            using var conn = await db.OpenAsync(ct);
            var rows = await conn.QueryAsync<ThemeRow>(
                "SELECT key_name AS `Key`, name AS Name, default_layout AS DefaultLayout FROM ui_themes ORDER BY id");
            return Results.Ok(rows);
        });

        return api;
    }

    private sealed class StoreConfigRow
    {
        public string StoreName { get; set; } = "";
        public string Currency { get; set; } = "INR";
        public string ActiveLayout { get; set; } = "grid";
        public bool AiStylistEnabled { get; set; }
        public string? ThemeKey { get; set; }
        public string? ThemeName { get; set; }
        public string? ThemeDefaultLayout { get; set; }
        public string? ThemeCssVariables { get; set; }
    }

    private sealed class ThemeRow
    {
        public string Key { get; set; } = "";
        public string Name { get; set; } = "";
        public string DefaultLayout { get; set; } = "grid";
    }
}
