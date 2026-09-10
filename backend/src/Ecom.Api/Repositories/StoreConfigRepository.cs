using System.Data;
using Dapper;
using Ecom.Api.Constants;
using Ecom.Api.Data;
using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Internal;
using MySqlConnector;

namespace Ecom.Api.Repositories;

public sealed class StoreConfigRepository(Database db) : IStoreConfigRepository
{
    // SIGNAL SQLSTATE '45000' surfaces as MySqlErrorCode 1644.
    private const int SignalErrorNumber = 1644;
    private const string UnknownThemeMessage = "unknown_theme";

    public async Task<StoreConfigRow?> GetAsync(CancellationToken ct)
    {
        using var conn = await db.OpenAsync(ct);
        return await conn.QuerySingleOrDefaultAsync<StoreConfigRow>(
            StoredProcedures.StoreConfigGet, commandType: CommandType.StoredProcedure);
    }

    public async Task<IReadOnlyList<ThemeSummaryDto>> ListThemesAsync(CancellationToken ct)
    {
        using var conn = await db.OpenAsync(ct);
        var rows = await conn.QueryAsync<ThemeSummaryDto>(
            StoredProcedures.ThemesList, commandType: CommandType.StoredProcedure);
        return rows.ToList();
    }

    public async Task<StoreConfigRow?> UpdateAsync(
        string? themeKey, string? layout, string adminId, CancellationToken ct)
    {
        using var conn = await db.OpenAsync(ct);
        try
        {
            return await conn.QuerySingleOrDefaultAsync<StoreConfigRow>(
                StoredProcedures.StoreConfigUpdate,
                new { p_theme_key = themeKey, p_layout = layout, p_admin_id = adminId },
                commandType: CommandType.StoredProcedure);
        }
        catch (MySqlException ex) when (
            ex.Number == SignalErrorNumber && ex.Message.Contains(UnknownThemeMessage))
        {
            throw new UnknownThemeException(themeKey ?? "");
        }
    }
}
