using System.Data;
using Dapper;
using Ecom.Api.Constants;
using Ecom.Api.Data;
using Ecom.Api.Models.Internal;

namespace Ecom.Api.Repositories;

public sealed class ProductImportRepository(Database db) : IProductImportRepository
{
    public async Task<ImportOutcome> ImportAsync(ProductImportCommand c, CancellationToken ct)
    {
        using var conn = await db.OpenAsync(ct);
        return await conn.QuerySingleAsync<ImportOutcome>(
            StoredProcedures.ProductImport,
            new
            {
                p_sku = c.Sku,
                p_name = c.Name,
                p_brand = c.Brand,
                p_category = c.Category,
                p_subcategory = c.Subcategory,
                p_product_type = c.ProductType,
                p_price = c.Price,
                p_currency = c.Currency,
                p_description = c.Description,
                p_gender = c.Gender,
                p_status = c.Status,
                p_materials = c.MaterialsJson,
                p_sizes = c.SizesJson,
                p_images = c.ImagesJson,
            },
            commandType: CommandType.StoredProcedure);
    }
}
