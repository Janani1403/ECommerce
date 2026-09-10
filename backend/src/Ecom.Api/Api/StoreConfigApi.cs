using System.Data;
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
            var dto = await LoadStoreConfig(conn);
            return dto is null
                ? Results.Problem("store_config row (id = 1) is missing.", statusCode: 500)
                : Results.Ok(dto);
        });

        // Admin: change the active theme and/or layout. Writes an audit_log row.
        // TODO: gate behind the Cognito admin role once auth is wired up. For now,
        // if AdminApi:Token is configured, an X-Admin-Token header must match it.
        api.MapPatch("/store-config", async (
            UpdateStoreConfigRequest body,
            Database db,
            IConfiguration cfg,
            HttpRequest req,
            CancellationToken ct) =>
        {
            var requiredToken = cfg["AdminApi:Token"];
            if (!string.IsNullOrEmpty(requiredToken) &&
                req.Headers["X-Admin-Token"].ToString() != requiredToken)
            {
                return Results.StatusCode(StatusCodes.Status401Unauthorized);
            }

            if (string.IsNullOrWhiteSpace(body.ThemeKey) && string.IsNullOrWhiteSpace(body.Layout))
                return Results.BadRequest(new { error = "Provide themeKey and/or layout." });

            using var conn = await db.OpenAsync(ct);

            var before = await conn.QuerySingleAsync<CurrentConfig>(
                "SELECT active_theme_id AS ThemeId, active_layout AS Layout FROM store_config WHERE id = 1");

            var newThemeId = before.ThemeId;
            if (!string.IsNullOrWhiteSpace(body.ThemeKey))
            {
                var id = await conn.QuerySingleOrDefaultAsync<int?>(
                    "SELECT id FROM ui_themes WHERE key_name = @k", new { k = body.ThemeKey });
                if (id is null)
                    return Results.BadRequest(new { error = $"Unknown theme '{body.ThemeKey}'." });
                newThemeId = id;
            }

            var newLayout = string.IsNullOrWhiteSpace(body.Layout)
                ? before.Layout
                : body.Layout.Trim();
            if (newLayout.Length is 0 or > 32)
                return Results.BadRequest(new { error = "Invalid layout." });

            using var tx = conn.BeginTransaction();
            await conn.ExecuteAsync(
                "UPDATE store_config SET active_theme_id = @t, active_layout = @l WHERE id = 1",
                new { t = newThemeId, l = newLayout }, tx);
            await conn.ExecuteAsync(
                """
                INSERT INTO audit_log (admin_id, action, table_name, record_id, old_value, new_value)
                VALUES (@admin, 'update_store_config', 'store_config', '1', @old, @new)
                """,
                new
                {
                    admin = "local-admin",
                    old = JsonSerializer.Serialize(new { themeId = before.ThemeId, layout = before.Layout }),
                    @new = JsonSerializer.Serialize(new { themeId = newThemeId, layout = newLayout }),
                }, tx);
            tx.Commit();

            return Results.Ok(await LoadStoreConfig(conn));
        });

        // All installable themes - used by the admin theme picker.
        api.MapGet("/themes", async (Database db, CancellationToken ct) =>
        {
            using var conn = await db.OpenAsync(ct);
            var rows = await conn.QueryAsync<ThemeRow>(
                "SELECT id AS Id, key_name AS `Key`, name AS Name, default_layout AS DefaultLayout FROM ui_themes ORDER BY id");
            return Results.Ok(rows);
        });

        return api;
    }

    private static async Task<StoreConfigDto?> LoadStoreConfig(IDbConnection conn)
    {
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

        if (row is null) return null;

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

    public sealed record UpdateStoreConfigRequest(string? ThemeKey, string? Layout);

    private sealed class CurrentConfig
    {
        public int? ThemeId { get; set; }
        public string Layout { get; set; } = "grid";
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
        public int Id { get; set; }
        public string Key { get; set; } = "";
        public string Name { get; set; } = "";
        public string DefaultLayout { get; set; } = "grid";
    }
}
