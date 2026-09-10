namespace Ecom.Api.Storage;

/// <summary>
/// Object storage for product images. LocalBlobStore (disk) in dev,
/// S3BlobStore in production, chosen by Storage:Provider.
/// </summary>
public interface IBlobStore
{
    /// <summary>Stores <paramref name="content"/> under <paramref name="key"/>; returns a public URL.</summary>
    Task<string> SaveAsync(string key, Stream content, string contentType, CancellationToken ct);

    Task DeleteAsync(string key, CancellationToken ct);
}
