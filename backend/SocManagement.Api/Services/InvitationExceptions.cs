namespace SocManagement.Api.Services;


public class UserAlreadyExistsException()
    : Exception("A user with this email already exists.");

public class InvitationInvalidException()
    : Exception("The invitation is invalid, expired or already used.");

public class EmailDeliveryException(Exception innerException)
    : Exception(innerException is EmailProviderException
        ? $"{innerException.Message} No account was created."
        : "The invitation email could not be sent. Check the backend logs for the cause. No account was created.", innerException);

public class EmailProviderException(string message) : Exception(message);
