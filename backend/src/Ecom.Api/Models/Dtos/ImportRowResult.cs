namespace Ecom.Api.Models.Dtos;

/// <summary>One row of the bulk-import result report.</summary>
public sealed record ImportRowResult(string Sku, string Action, string? Message = null)
{
    public const string Inserted = "inserted";
    public const string Updated = "updated";
    public const string Error = "error";

    public static ImportRowResult Failed(string sku, string message) => new(sku, Error, message);
}
