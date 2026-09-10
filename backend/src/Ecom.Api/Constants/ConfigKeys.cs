namespace Ecom.Api.Constants;

/// <summary>Configuration keys (env vars, appsettings paths).</summary>
public static class ConfigKeys
{
    public const string ConnectionStringEnv = "CONNECTION_STRING";
    public const string ConnectionStringName = "Db"; // ConnectionStrings:Db

    public const string AdminApiToken = "AdminApi:Token";
    public const string AllowedCorsOrigins = "AllowedCorsOrigins";

    public const string StorageProvider = "Storage:Provider";       // "local" | "s3"
    public const string StorageLocalPath = "Storage:LocalPath";     // default: wwwroot/uploads
    public const string StoragePublicBaseUrl = "Storage:PublicBaseUrl";
    public const string StorageS3Bucket = "Storage:S3:BucketName";
    public const string StorageS3Region = "Storage:S3:Region";
}
