namespace SocManagement.Api.Models;

// KlantToegang uit het RRM: welke medewerker toegang heeft tot welke klant (REQ-07, K-02).
// Sleutel = UserId + CustomerId, zodat een koppeling maar één keer kan bestaan.
public class TenantAccess
{
    public Guid UserId { get; set; }

    public int CustomerId { get; set; }

    // Moment van toekennen, in UTC.
    public DateTime GrantedAt { get; set; }

    public User User { get; set; } = null!;

    public Customer Customer { get; set; } = null!;
}
