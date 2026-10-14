import { z } from 'zod';

/**
 * Contract of the Restful Booker API.
 *
 * Responses are parsed with these schemas, so a contract change (renamed field, wrong type,
 * malformed date) fails the test with a precise message instead of surfacing later as `undefined`.
 */
export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int(),
  depositpaid: z.boolean(),
  bookingdates: z.object({
    checkin: z.iso.date(),
    checkout: z.iso.date(),
  }),
  additionalneeds: z.string().optional(),
});

export const CreateBookingResponseSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdsSchema = z.array(z.object({ bookingid: z.number().int().positive() }));

export const AuthResponseSchema = z.object({ token: z.string().min(1) });

export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingResponse = z.infer<typeof CreateBookingResponseSchema>;
