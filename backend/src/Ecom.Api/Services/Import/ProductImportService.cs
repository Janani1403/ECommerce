using System.Globalization;
using System.IO.Compression;
using System.Text.Json;
using CsvHelper;
using CsvHelper.Configuration;
using Ecom.Api.Models.Dtos;
using Ecom.Api.Models.Internal;
using Ecom.Api.Models.Requests;
using Ecom.Api.Repositories;
using Ecom.Api.Storage;

namespace Ecom.Api.Services.Import;

/// <summary>
/// C# port of db/csv-import/import_products.py, plus image extraction from the
/// uploaded ZIP. All DB writes go through sp_product_import.
/// </summary>
public sealed class ProductImportService(IProductImportRepository repo, IBlobStore blobs)
    : IProductImportService
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<IReadOnlyList<ImportRowResult>> ImportAsync(
        Stream csv, Stream? imagesZip, CancellationToken ct)
    {
        using var archive = imagesZip is null ? null : new ZipArchive(imagesZip, ZipArchiveMode.Read);
        var zipEntries = archive?.Entries
            .Where(e => !string.IsNullOrEmpty(e.Name))
            .ToDictionary(e => e.Name, StringComparer.OrdinalIgnoreCase)
            ?? new Dictionary<string, ZipArchiveEntry>();

        List<ProductImportRow> rows;
        using (var reader = new StreamReader(csv))
        using (var csvReader = new CsvReader(reader, CsvConfig()))
        {
            rows = csvReader.GetRecords<ProductImportRow>().ToList();
        }

        var results = new List<ImportRowResult>(rows.Count);
        foreach (var row in rows)
        {
            ct.ThrowIfCancellationRequested();
            results.Add(await ProcessRowAsync(row, zipEntries, ct));
        }
        return results;
    }

    private async Task<ImportRowResult> ProcessRowAsync(
        ProductImportRow row, IReadOnlyDictionary<string, ZipArchiveEntry> zipEntries, CancellationToken ct)
    {
        var sku = row.Sku?.Trim() ?? "";
        if (sku.Length == 0)
            return ImportRowResult.Failed("(blank)", "missing sku");

        try
        {
            var imageUrls = Split(row.ImageUrls).ToList();

            var i = imageUrls.Count;
            foreach (var fileName in Split(row.ImageFiles))
            {
                if (!zipEntries.TryGetValue(fileName, out var entry))
                    return ImportRowResult.Failed(sku, $"image '{fileName}' not found in the ZIP");

                var ext = Path.GetExtension(fileName);
                await using var entryStream = entry.Open();
                using var buffer = new MemoryStream();
                await entryStream.CopyToAsync(buffer, ct);
                buffer.Position = 0;

                var key = $"products/{Slug(sku)}/{i++}{ext.ToLowerInvariant()}";
                imageUrls.Add(await blobs.SaveAsync(key, buffer, ContentType(ext), ct));
            }

            var command = new ProductImportCommand(
                Sku: sku,
                Name: row.Name.Trim(),
                Brand: Blank(row.Brand),
                Category: row.Category.Trim(),
                Subcategory: Blank(row.Subcategory),
                ProductType: row.ProductType.Trim(),
                Price: row.Price,
                Currency: Blank(row.Currency),
                Description: Blank(row.Description),
                Gender: Blank(row.Gender),
                Status: Blank(row.Status),
                MaterialsJson: JsonSerializer.Serialize(Split(row.Materials), Json),
                SizesJson: JsonSerializer.Serialize(ParseSizes(row.Sizes), Json),
                ImagesJson: JsonSerializer.Serialize(BuildImages(imageUrls), Json));

            var outcome = await repo.ImportAsync(command, ct);
            return new ImportRowResult(sku, outcome.Action);
        }
        catch (Exception ex)
        {
            return ImportRowResult.Failed(sku, ex.Message);
        }
    }

    private static CsvConfiguration CsvConfig() => new(CultureInfo.InvariantCulture)
    {
        PrepareHeaderForMatch = a => a.Header.Replace("_", "").Trim().ToLowerInvariant(),
        HeaderValidated = null,
        MissingFieldFound = null,
        TrimOptions = TrimOptions.Trim,
    };

    private static IEnumerable<string> Split(string? value) =>
        (value ?? "").Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static IEnumerable<object> ParseSizes(string? value) =>
        Split(value).Select(token =>
        {
            var parts = token.Split(':', 2);
            var stock = parts.Length > 1 && int.TryParse(parts[1], out var s) ? s : 0;
            return (object)new { label = parts[0].Trim(), stock };
        });

    private static IEnumerable<object> BuildImages(IReadOnlyList<string> urls) =>
        urls.Select((url, idx) => (object)new { url, isPrimary = idx == 0, sortOrder = idx });

    private static string? Blank(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static string Slug(string s)
    {
        var chars = s.Trim().ToLowerInvariant()
            .Select(c => char.IsLetterOrDigit(c) ? c : '-');
        return string.Join("", chars).Trim('-');
    }

    private static string ContentType(string ext) => ext.ToLowerInvariant() switch
    {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".webp" => "image/webp",
        ".gif" => "image/gif",
        ".avif" => "image/avif",
        _ => "application/octet-stream",
    };
}
