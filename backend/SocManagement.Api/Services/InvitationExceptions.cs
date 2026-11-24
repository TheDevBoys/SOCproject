namespace SocManagement.Api.Services;


public class UserAlreadyExistsException()
    : Exception("A user with this email already exists.");

public class InvitationInvalidException()
    : Exception("The invitation is invalid, expired or already used.");

public class EmailDeliveryException(Exception innerException)
    : Exception("The invitation email could not be sent. No account was created.", innerException);
