using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Ecom.Api.Constants;

namespace Ecom.Api.Storage;

/// <summary>
/// Production image storage. Not exercised until the CDK infrastructure
/// provisions the bucket; selected by Storage:Provider = "s3".
/// </summary>
public sealed class S3BlobStore : IBlobStore
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucket;
    private readonly string? _publicBase;

    public S3BlobStore(IConfiguration config)
    {
        _bucket = config[ConfigKeys.StorageS3Bucket]
                  ?? throw new InvalidOperationException($"{ConfigKeys.StorageS3Bucket} is not set.");
        var region = config[ConfigKeys.StorageS3Region];
        _s3 = region is null
            ? new AmazonS3Client()
            : new AmazonS3Client(RegionEndpoint.GetBySystemName(region));
        _publicBase = config[ConfigKeys.StoragePublicBaseUrl]?.TrimEnd('/');
    }

    public async Task<string> SaveAsync(string key, Stream content, string contentType, CancellationToken ct)
    {
        await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            DisablePayloadSigning = true,
        }, ct);

        return _publicBase is not null
            ? $"{_publicBase}/{key}"
            : $"https://{_bucket}.s3.amazonaws.com/{key}";
    }

    public Task DeleteAsync(string key, CancellationToken ct)
        => _s3.DeleteObjectAsync(_bucket, key, ct);
}
