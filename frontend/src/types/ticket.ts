export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export type TicketPriority = 'low' | 'medium' | 'high';

export type TicketCategory = 'plumbing' | 'electrical' | 'network' | 'cleaning' | 'other' | string;

export interface Ticket {
  id: number;
  description: string;
  category: TicketCategory;
  location: string;
  duration: string;
  priority: TicketPriority;
  priority_reason: string;
  status: TicketStatus;
}

export type RawTicketArray = [
  number, // id
  string, // description
  string, // category
  string, // location
  string, // duration
  string, // priority
  string, // priority_reason
  string  // status
];

export interface NeedsInformationResponse {
  status: 'needs_information';
  thread_id: string;
  question: string;
}

export interface TicketStateResponse {
  description: string;
  category: string;
  location: string;
  duration: string;
  priority: string;
  status: string;
  user_response?: string;
  priority_reason: string;
  id?: number;
}

export type CreateTicketResponse = NeedsInformationResponse | TicketStateResponse;

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  highPriority: number;
  resolved: number;
}
