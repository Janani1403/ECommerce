using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Requests;

namespace Ecom.Api.Services;

public interface ICatalogService
{
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct);
    Task<Paged<ProductListItemDto>> SearchProductsAsync(ProductSearchQuery query, CancellationToken ct);
    Task<ProductDetailDto?> GetProductAsync(int id, CancellationToken ct);
}
