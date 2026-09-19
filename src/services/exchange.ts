/**
 * Borrow and swap requests between members.
 *
 * Accepting a borrow request starts a loan; accepting a swap marks both copies
 * as changed hands. Declining leaves everything where it was.
 */

import { startLoan } from '@/services/loans';
import {
  CURRENT_USER_ID,
  db,
  findCopy,
  findUser,
  nextId,
  resolveLater,
  toListing,
} from '@/services/store';
import type { ExchangeRequest, Listing, RequestKind, User } from '@/types';

/** A request joined to what a row needs to render it. */
export type RequestDetail = {
  request: ExchangeRequest;
  /** The copy being asked for. */
  listing: Listing;
  /** What the requester put up in return, for swaps. */
  offered: Listing | null;
  /** The other member in the exchange. */
  counterparty: User;
  /** True when the current user made the request. */
  outgoing: boolean;
};

function toDetail(request: ExchangeRequest): RequestDetail | undefined {
  const copy = findCopy(request.copyId);
  const listing = copy ? toListing(copy) : undefined;
  if (!listing) return undefined;

  const outgoing = request.fromUserId === CURRENT_USER_ID;
  const counterparty = findUser(outgoing ? request.toUserId : request.fromUserId);
  if (!counterparty) return undefined;

  const offeredCopy = request.offeredCopyId ? findCopy(request.offeredCopyId) : undefined;
  const offered = offeredCopy ? (toListing(offeredCopy) ?? null) : null;

  return { request, listing, offered, counterparty, outgoing };
}

function detailsFor(requests: ExchangeRequest[]): RequestDetail[] {
  return requests
    .map(toDetail)
    .filter((detail): detail is RequestDetail => detail !== undefined)
    .sort((a, b) => b.request.createdAt.localeCompare(a.request.createdAt));
}

/** Everything still awaiting a decision, in both directions. */
export async function getPendingRequests(): Promise<RequestDetail[]> {
  const pending = db.requests.filter(
    (request) =>
      request.status === 'pending' &&
      (request.fromUserId === CURRENT_USER_ID || request.toUserId === CURRENT_USER_ID)
  );
  return resolveLater(detailsFor(pending));
}

/** Requests others have sent the current user and not yet had answered. */
export async function getIncomingRequests(): Promise<RequestDetail[]> {
  const incoming = db.requests.filter(
    (request) => request.status === 'pending' && request.toUserId === CURRENT_USER_ID
  );
  return resolveLater(detailsFor(incoming));
}

export async function createRequest(
  copyId: string,
  kind: RequestKind,
  offeredCopyId: string | null = null
): Promise<ExchangeRequest> {
  const copy = findCopy(copyId);
  if (!copy) {
    throw new Error(`No copy found with id "${copyId}".`);
  }
  if (copy.ownerId === CURRENT_USER_ID) {
    throw new Error('That book is already on your shelf.');
  }

  const duplicate = db.requests.some(
    (request) =>
      request.copyId === copyId &&
      request.fromUserId === CURRENT_USER_ID &&
      request.status === 'pending'
  );
  if (duplicate) {
    throw new Error('You have already asked for this book.');
  }

  if (kind === 'exchange') {
    if (!offeredCopyId) {
      throw new Error('Pick one of your books to offer in return.');
    }
    const offered = findCopy(offeredCopyId);
    if (!offered || offered.ownerId !== CURRENT_USER_ID) {
      throw new Error('You can only offer a book from your own shelf.');
    }
  }

  const request: ExchangeRequest = {
    id: nextId('r'),
    copyId,
    fromUserId: CURRENT_USER_ID,
    toUserId: copy.ownerId,
    kind,
    offeredCopyId: kind === 'exchange' ? offeredCopyId : null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.requests = [request, ...db.requests];
  return resolveLater(request);
}

function setStatus(requestId: string, status: 'accepted' | 'declined'): ExchangeRequest {
  const request = db.requests.find((candidate) => candidate.id === requestId);
  if (!request) {
    throw new Error(`No request found with id "${requestId}".`);
  }
  if (request.status !== 'pending') {
    throw new Error('That request has already been answered.');
  }

  const updated: ExchangeRequest = { ...request, status };
  db.requests = db.requests.map((candidate) => (candidate.id === requestId ? updated : candidate));
  return updated;
}

/**
 * Accepting a borrow starts the loan; accepting a swap transfers ownership of
 * both copies. Only the member who received the request may accept it.
 */
export async function acceptRequest(requestId: string): Promise<ExchangeRequest> {
  const request = db.requests.find((candidate) => candidate.id === requestId);
  if (!request) {
    throw new Error(`No request found with id "${requestId}".`);
  }
  if (request.toUserId !== CURRENT_USER_ID) {
    throw new Error('Only the owner can accept this request.');
  }

  const updated = setStatus(requestId, 'accepted');

  if (request.kind === 'borrow') {
    await startLoan(request.copyId, request.fromUserId);
  } else if (request.offeredCopyId) {
    db.copies = db.copies.map((copy) => {
      if (copy.id === request.copyId) {
        return { ...copy, ownerId: request.fromUserId, status: 'on-shelf', seeking: [] };
      }
      if (copy.id === request.offeredCopyId) {
        return { ...copy, ownerId: request.toUserId, status: 'on-shelf', seeking: [] };
      }
      return copy;
    });
  }

  return resolveLater(updated);
}

export async function declineRequest(requestId: string): Promise<ExchangeRequest> {
  return resolveLater(setStatus(requestId, 'declined'));
}

/** Withdraws a request the current user sent. */
export async function cancelRequest(requestId: string): Promise<void> {
  const request = db.requests.find((candidate) => candidate.id === requestId);
  if (!request) {
    throw new Error(`No request found with id "${requestId}".`);
  }
  if (request.fromUserId !== CURRENT_USER_ID) {
    throw new Error('You can only withdraw your own requests.');
  }

  db.requests = db.requests.filter((candidate) => candidate.id !== requestId);
  return resolveLater(undefined);
}
