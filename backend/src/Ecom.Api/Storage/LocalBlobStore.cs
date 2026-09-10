using Ecom.Api.Constants;

namespace Ecom.Api.Storage;

/// <summary>Writes to {ContentRoot}/wwwroot/uploads and serves via UseStaticFiles.</summary>
public sealed class LocalBlobStore : IBlobStore
{
    private readonly string _root;
    private readonly string _publicBase;

    public LocalBlobStore(IConfiguration config, IWebHostEnvironment env)
    {
        var configuredPath = config[ConfigKeys.StorageLocalPath];
        _root = string.IsNullOrWhiteSpace(configuredPath)
            ? Path.Combine(env.ContentRootPath, "wwwroot", "uploads")
            : configuredPath;

        var configuredBase = config[ConfigKeys.StoragePublicBaseUrl];
        _publicBase = (string.IsNullOrWhiteSpace(configuredBase)
            ? CatalogDefaults.DefaultPublicBaseUrl
            : configuredBase).TrimEnd('/');

        Directory.CreateDirectory(_root);
    }

    public async Task<string> SaveAsync(string key, Stream content, string contentType, CancellationToken ct)
    {
        var safeKey = Sanitize(key);
        var path = Path.Combine(_root, safeKey.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        await using (var fs = File.Create(path))
            await content.CopyToAsync(fs, ct);

        return $"{_publicBase}{CatalogDefaults.UploadsUrlPrefix}/{safeKey}";
    }

    public Task DeleteAsync(string key, CancellationToken ct)
    {
        var path = Path.Combine(_root, Sanitize(key).Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }

    private static string Sanitize(string key)
    {
        var k = key.Replace('\\', '/').TrimStart('/');
        if (k.Contains("..") || Path.IsPathRooted(k))
            throw new ArgumentException($"Invalid blob key '{key}'.", nameof(key));
        return k;
    }
}
