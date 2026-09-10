using Ecom.Api.Constants;
using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Internal;
using Ecom.Api.Models.Requests;
using Ecom.Api.Repositories;

namespace Ecom.Api.Services;

public sealed class CatalogService(ICatalogRepository repo) : ICatalogService
{
    public Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct)
        => repo.ListCategoriesAsync(ct);

    public async Task<Paged<ProductListItemDto>> SearchProductsAsync(
        ProductSearchQuery query, CancellationToken ct)
    {
        var page = query.Page is null or < 1 ? 1 : query.Page.Value;
        var size = query.PageSize is null or < 1 or > CatalogDefaults.MaxPageSize
            ? CatalogDefaults.DefaultPageSize
            : query.PageSize.Value;

        // Storefront default: only live products. "all" removes the filter.
        var status = query.Status switch
        {
            null or "" => CatalogDefaults.DefaultStatus,
            CatalogDefaults.AllStatusesToken => null,
            _ => query.Status,
        };

        var args = new ProductSearchParams(
            Blank(query.Category), Blank(query.Subcategory), Blank(query.Gender),
            Blank(query.Q), status, size, (page - 1) * size);

        var (items, total) = await repo.SearchProductsAsync(args, ct);
        return new Paged<ProductListItemDto>(items, page, size, total);
    }

    public async Task<ProductDetailDto?> GetProductAsync(int id, CancellationToken ct)
    {
        var data = await repo.GetProductAsync(id, ct);
        if (data is null) return null;

        var h = data.Head;
        return new ProductDetailDto(
            h.Id, h.Sku, h.Name, h.Price, h.Currency, h.Description, h.Gender, h.Status,
            h.BrandName, h.CategoryName, h.SubcategoryName,
            data.Images, data.Sizes, data.Materials);
    }

    private static string? Blank(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
}
