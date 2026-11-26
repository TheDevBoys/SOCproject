namespace SocManagement.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Ticket> Tickets { get; set; } = new();
    public List<Alert> Alerts { get; set; } = new();

    // Customer 1 - 0..* TenantAccess (welke gebruikers toegang hebben)
    public List<TenantAccess> TenantAccesses { get; set; } = new();

    // Customer 1 - 0..* User (klantgebruikers die namens deze klant inloggen)
    public List<User> Users { get; set; } = new();
}
