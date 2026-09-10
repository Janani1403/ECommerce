using System.Data;
using Ecom.Api.Constants;
using MySqlConnector;

namespace Ecom.Api.Data;

/// <summary>
/// Hands out open MySQL connections. Connection string resolution order:
///   1. CONNECTION_STRING environment variable (used by .env locally and by Lambda)
///   2. ConnectionStrings:Db in appsettings*.json (local dev fallback)
/// </summary>
public sealed class Database(IConfiguration config)
{
    private readonly string _connectionString =
        config[ConfigKeys.ConnectionStringEnv]
        ?? config.GetConnectionString(ConfigKeys.ConnectionStringName)
        ?? throw new InvalidOperationException(
            $"No database connection string. Set {ConfigKeys.ConnectionStringEnv} or " +
            $"ConnectionStrings:{ConfigKeys.ConnectionStringName}.");

    public async Task<IDbConnection> OpenAsync(CancellationToken ct = default)
    {
        var conn = new MySqlConnection(_connectionString);
        await conn.OpenAsync(ct);
        return conn;
    }
}
