export interface InviteUserRequest {
  name: string;
  email: string;
  role: string;
  customerId?: number;
}

export interface InviteUserResponse {
  message: string;
  invitationId: string;
  expiresAt: string;
}

export interface ValidateInvitationResponse {
  valid: boolean;
  name: string;
  email: string;
  expiresAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
}

export interface AcceptInvitationResponse {
  message: string;
}