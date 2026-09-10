using System.Data;
using Dapper;
using Ecom.Api.Constants;
using Ecom.Api.Data;
using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Internal;

namespace Ecom.Api.Repositories;

public sealed class CatalogRepository(Database db) : ICatalogRepository
{
    public async Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken ct)
    {
        using var conn = await db.OpenAsync(ct);
        var rows = await conn.QueryAsync<CategoryDto>(
            StoredProcedures.CategoriesList, commandType: CommandType.StoredProcedure);
        return rows.ToList();
    }

    public async Task<(IReadOnlyList<ProductListItemDto> Items, long Total)> SearchProductsAsync(
        ProductSearchParams a, CancellationToken ct)
    {
        using var conn = await db.OpenAsync(ct);
        await using var grid = await conn.QueryMultipleAsync(
            StoredProcedures.ProductsSearch,
            new
            {
                p_category_slug = a.CategorySlug,
                p_subcategory_slug = a.SubcategorySlug,
                p_gender = a.Gender,
                p_q = a.Query,
                p_status = a.Status,
                p_limit = a.Limit,
                p_offset = a.Offset,
            },
            commandType: CommandType.StoredProcedure);

        var items = (await grid.ReadAsync<ProductListItemDto>()).ToList();
        var total = await grid.ReadFirstAsync<long>();
        return (items, total);
    }

    public async Task<ProductDetailData?> GetProductAsync(int id, CancellationToken ct)
    {
        using var conn = await db.OpenAsync(ct);
        await using var grid = await conn.QueryMultipleAsync(
            StoredProcedures.ProductGet,
            new { p_id = id },
            commandType: CommandType.StoredProcedure);

        var head = await grid.ReadSingleOrDefaultAsync<ProductHead>();
        if (head is null) return null;

        var images = (await grid.ReadAsync<ProductImageDto>()).ToList();
        var sizes = (await grid.ReadAsync<ProductSizeDto>()).ToList();
        var materials = (await grid.ReadAsync<string>()).ToList();

        return new ProductDetailData(head, images, sizes, materials);
    }
}
