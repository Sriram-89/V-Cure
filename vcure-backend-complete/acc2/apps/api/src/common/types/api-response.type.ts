/**
 * Canonical response envelope — 05_API_CONTRACTS Global API Standards.
 *
 * NOTE: 11_CODING_STANDARDS §34 documents a different shape
 * (`Success, Message, Data, Meta, Error`). That conflict (C-01) is unresolved;
 * the 05 form is used because 12B §33 makes 05_API_CONTRACTS the authority on
 * API shape. Recorded, not silently chosen.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown[] | null;
  timestamp: string;
}
