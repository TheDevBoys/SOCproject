import type { InviteUserRequest, InviteUserResponse, ValidateInvitationResponse, AcceptInvitationRequest, AcceptInvitationResponse } from "../types/invitation";

async function parseResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Er is iets misgegaan. Probeer het opnieuw.";

    throw new Error(message);
  }

  return data as T;
}

export async function inviteUser(
  request: InviteUserRequest
): Promise<InviteUserResponse> {
  const response = await fetch("/api/invitations", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseResponse<InviteUserResponse>(response);
}

export async function validateInvitation(
  token: string
): Promise<ValidateInvitationResponse> {
  const response = await fetch(
    `/api/invitations/validate?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  return parseResponse<ValidateInvitationResponse>(response);
}


export async function acceptInvitation(
  request: AcceptInvitationRequest
): Promise<AcceptInvitationResponse> {
  const response = await fetch("/api/invitations/accept", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseResponse<AcceptInvitationResponse>(response);
}