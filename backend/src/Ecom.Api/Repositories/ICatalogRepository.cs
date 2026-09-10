using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Internal;

namespace Ecom.Api.Repositories;

public interface ICatalogRepository
{
    Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken ct);

    Task<(IReadOnlyList<ProductListItemDto> Items, long Total)> SearchProductsAsync(
        ProductSearchParams args, CancellationToken ct);

    Task<ProductDetailData?> GetProductAsync(int id, CancellationToken ct);
}
