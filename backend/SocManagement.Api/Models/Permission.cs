namespace SocManagement.Api.Models;

public class Permission
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsAssignable { get; set; } = true;
}
