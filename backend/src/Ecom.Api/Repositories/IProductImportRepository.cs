using Ecom.Api.Models.Internal;

namespace Ecom.Api.Repositories;

public interface IProductImportRepository
{
    Task<ImportOutcome> ImportAsync(ProductImportCommand command, CancellationToken ct);
}
