namespace SocManagement.Api.Models;

public class Role
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ICollection<Permission> Permissions { get; set; } = [];
}
