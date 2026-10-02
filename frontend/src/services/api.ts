import type {
  Ticket,
  RawTicketArray,
  TicketFilters,
  CreateTicketResponse,
  NeedsInformationResponse,
  TicketStatus,
  TicketPriority,
} from '../types/ticket';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''
).replace(/\/+$/, '');

// Helper to normalize status values
export function normalizeStatus(rawStatus?: string): TicketStatus {
  const s = (rawStatus || '').toLowerCase().trim();
  if (s === 'resolved' || s === 'completed') return 'resolved';
  if (s === 'in_progress' || s === 'in progress' || s === 'processing') return 'in_progress';
  return 'open';
}

// Helper to normalize priority values
export function normalizePriority(rawPriority?: string): TicketPriority {
  const p = (rawPriority || '').toLowerCase().trim();
  if (p === 'high' || p === 'urgent' || p === 'critical') return 'high';
  if (p === 'low') return 'low';
  return 'medium';
}

// Transform raw backend row into clean Ticket model
export function parseRawTicket(row: RawTicketArray | any[]): Ticket {
  return {
    id: Number(row[0]) || 0,
    description: String(row[1] || '').trim(),
    category: String(row[2] || 'other').trim().toLowerCase(),
    location: String(row[3] || '').trim(),
    duration: String(row[4] || '').trim(),
    priority: normalizePriority(row[5]),
    priority_reason: String(row[6] || '').trim(),
    status: normalizeStatus(row[7]),
  };
}

/**
 * Fetch all tickets with optional backend filters
 */
export async function getTickets(filters?: TicketFilters): Promise<Ticket[]> {
  const params = new URLSearchParams();

  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters?.priority && filters.priority !== 'all') {
    params.append('priority', filters.priority);
  }
  if (filters?.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/tickets${queryString}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to fetch tickets (${response.status})`);
  }

  const data = await response.json();
  const rawList: any[] = Array.isArray(data?.tickets) ? data.tickets : [];
  return rawList.map(parseRawTicket);
}

export interface SubmitComplaintResult {
  needsInformation: boolean;
  threadId?: string;
  question?: string;
  ticket?: Ticket;
}

/**
 * Submit initial maintenance complaint to /tickets
 */
export async function submitComplaint(description: string): Promise<SubmitComplaintResult> {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to submit complaint (${response.status})`);
  }

  const data: CreateTicketResponse | null = await response.json();

  if (data && 'status' in data && (data as NeedsInformationResponse).status === 'needs_information') {
    return {
      needsInformation: true,
      threadId: (data as NeedsInformationResponse).thread_id,
      question: (data as NeedsInformationResponse).question,
    };
  }

  // Workflow completed directly without pause
  // Retrieve the latest ticket from database to ensure valid ID
  const allTickets = await getTickets();
  const newestTicket = allTickets.length > 0 ? allTickets[0] : null;

  if (newestTicket) {
    return {
      needsInformation: false,
      ticket: newestTicket,
    };
  }

  // Fallback to parsed state response if GET list was empty
  const stateData = data as any;
  return {
    needsInformation: false,
    ticket: {
      id: stateData?.id || 1,
      description: stateData?.description || description,
      category: stateData?.category || 'general',
      location: stateData?.location || 'Unspecified',
      duration: stateData?.duration || '',
      priority: normalizePriority(stateData?.priority),
      priority_reason: stateData?.priority_reason || '',
      status: normalizeStatus(stateData?.status),
    },
  };
}

/**
 * Resume ticket workflow by providing missing answer to /tickets/{thread_id}/resume
 */
export async function resumeComplaint(threadId: string, answer: string): Promise<Ticket> {
  const response = await fetch(`${API_BASE_URL}/tickets/${encodeURIComponent(threadId)}/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ answer }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to answer clarification (${response.status})`);
  }

  const resultState = await response.json();

  // Retrieve the newest saved ticket from the database with its true ID
  const allTickets = await getTickets();
  const newestTicket = allTickets.length > 0 ? allTickets[0] : null;

  if (newestTicket) {
    return newestTicket;
  }

  return {
    id: resultState?.id || 1,
    description: resultState?.description || '',
    category: resultState?.category || 'general',
    location: resultState?.location || answer,
    duration: resultState?.duration || '',
    priority: normalizePriority(resultState?.priority),
    priority_reason: resultState?.priority_reason || '',
    status: normalizeStatus(resultState?.status),
  };
}

/**
 * Update ticket status (open -> in_progress -> resolved) via PATCH /tickets/{ticket_id}
 */
export async function updateTicketStatus(
  ticketId: number,
  status: TicketStatus
): Promise<{ message: string; ticket_id: number; status: string }> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to update ticket status (${response.status})`);
  }

  return await response.json();
}
