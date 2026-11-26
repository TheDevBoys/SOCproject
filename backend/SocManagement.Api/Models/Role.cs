namespace SocManagement.Api.Models;

public class Role
{
    public string Name { get; set; } = string.Empty;
    public ICollection<Permission> Permissions { get; set; } = [];
}
