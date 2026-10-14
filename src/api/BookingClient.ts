import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { AuthResponseSchema, type Booking } from './schemas/booking.schema';

export interface Credentials {
  username: string;
  password: string;
}

export interface BookingFilter {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

/**
 * Thin client over the Restful Booker REST API.
 *
 * Methods return the raw `APIResponse` so specs can assert on status codes and headers,
 * including negative cases. Only `getToken` unwraps the body, because it is a precondition
 * for other calls rather than the subject of a test.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  async createToken(
    credentials: Credentials = { username: env.API_USERNAME, password: env.API_PASSWORD },
  ): Promise<APIResponse> {
    return this.request.post('/auth', { data: credentials });
  }

  async getToken(): Promise<string> {
    const response = await this.createToken();
    if (!response.ok()) {
      throw new Error(`Authentication failed: ${response.status()} ${await response.text()}`);
    }
    return AuthResponseSchema.parse(await response.json()).token;
  }

  async getBookingIds(filter: BookingFilter = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: { ...filter } });
  }

  async getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async createBooking(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  async updateBooking(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: authHeader(token) });
  }

  async partialUpdateBooking(
    id: number,
    changes: Partial<Booking>,
    token?: string,
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: changes, headers: authHeader(token) });
  }

  async deleteBooking(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: authHeader(token) });
  }
}

/** Restful Booker authorises write operations with a `token` cookie. */
function authHeader(token?: string): Record<string, string> {
  return token ? { Cookie: `token=${token}` } : {};
}
