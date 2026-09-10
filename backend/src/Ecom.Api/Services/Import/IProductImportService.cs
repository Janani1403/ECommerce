using Ecom.Api.Models.Dtos;

namespace Ecom.Api.Services.Import;

public interface IProductImportService
{
    /// <summary>
    /// Parses the CSV, uploads any images named in `image_files` from the ZIP,
    /// and upserts each product. Returns a per-row report.
    /// </summary>
    Task<IReadOnlyList<ImportRowResult>> ImportAsync(Stream csv, Stream? imagesZip, CancellationToken ct);
}
