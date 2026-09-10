using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Requests;

namespace Ecom.Api.Services;

public interface IStoreConfigService
{
    Task<StoreConfigDto?> GetAsync(CancellationToken ct);
    Task<IReadOnlyList<ThemeSummaryDto>> ListThemesAsync(CancellationToken ct);
    Task<StoreConfigUpdateResult> UpdateAsync(UpdateStoreConfigRequest request, CancellationToken ct);
}

public sealed record StoreConfigUpdateResult(StoreConfigDto? Config, string? Error)
{
    public static StoreConfigUpdateResult Ok(StoreConfigDto config) => new(config, null);
    public static StoreConfigUpdateResult Invalid(string error) => new(null, error);
}
