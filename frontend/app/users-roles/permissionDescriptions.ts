export const permissionDescriptions: Record<string, string> = {
  "user.read": "View the user list and other users’ account details.",
  "user.create": "Create user accounts directly. Without role management, you can only assign Tier 1 and must have all its permissions.",
  "user.update": "Change users’ names and email addresses. Editing a Superuser or changing a role or customer assignment requires role management.",
  "user.delete": "Delete other users’ accounts, except Superusers and users with assigned tickets, ticket messages or ticket history.",
  "user.invite": "Send account invitations by email. Without role management, you can only assign Tier 1 and must have all its permissions.",
  "customer.read": "View the customer list and individual customer details.",
  "customer.create": "Create customer records.",
  "ticket.read": "View the ticket list and individual ticket details.",
  "ticket.create": "Create tickets for existing customers and optionally assign them to an existing user.",
  "role.manage": "Create roles, edit role names and permissions, assign roles and direct permissions to users, and manage user access to customers. Reserved for Superusers."
}
