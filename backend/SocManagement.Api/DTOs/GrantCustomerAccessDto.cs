using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

public class GrantCustomerAccessDto
{
    [Range(1, int.MaxValue)]
    public int CustomerId { get; set; }
}