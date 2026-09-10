using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Internal;

namespace Ecom.Api.Repositories;

public interface IStoreConfigRepository
{
    Task<StoreConfigRow?> GetAsync(CancellationToken ct);

    Task<IReadOnlyList<ThemeSummaryDto>> ListThemesAsync(CancellationToken ct);

    /// <summary>Runs sp_store_config_update and returns the updated row.</summary>
    /// <exception cref="UnknownThemeException">The theme key is not in ui_themes.</exception>
    Task<StoreConfigRow?> UpdateAsync(string? themeKey, string? layout, string adminId, CancellationToken ct);
}
