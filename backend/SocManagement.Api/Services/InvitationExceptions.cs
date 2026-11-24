namespace SocManagement.Api.Services;

// Dedicated exception types so the controller can map each case to the right HTTP
// status without comparing exception messages (which breaks as soon as a text changes).

public class UserAlreadyExistsException()
    : Exception("A user with this email already exists.");

public class InvitationInvalidException()
    : Exception("The invitation is invalid, expired or already used.");

public class EmailDeliveryException(Exception innerException)
    : Exception("The invitation email could not be sent. No account was created.", innerException);
