using System.Data;
using MySqlConnector;

namespace Ecom.Api.Data;

/// <summary>
/// Hands out open MySQL connections. The connection string comes from (in order):
///   1. CONNECTION_STRING environment variable   (used by .env locally and by Lambda)
///   2. ConnectionStrings:Db in appsettings*.json (local dev fallback)
/// </summary>
public sealed class Database(IConfiguration config)
{
    private readonly string _connectionString =
        config["CONNECTION_STRING"]
        ?? config.GetConnectionString("Db")
        ?? throw new InvalidOperationException(
            "No database connection string. Set CONNECTION_STRING or ConnectionStrings:Db.");

    public async Task<IDbConnection> OpenAsync(CancellationToken ct = default)
    {
        var conn = new MySqlConnection(_connectionString);
        await conn.OpenAsync(ct);
        return conn;
    }
}
