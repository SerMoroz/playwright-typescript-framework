import { expect, test } from '@fixtures';
import {
  BookingIdsSchema,
  BookingSchema,
  CreateBookingResponseSchema,
} from '@api/schemas/booking.schema';
import { buildBooking } from '@data/factories';

test.describe('Booking API', () => {
  test(
    'creates a booking and echoes it back with an id',
    { tag: '@smoke' },
    async ({ bookingClient, authToken }) => {
      const payload = buildBooking();

      const response = await bookingClient.createBooking(payload);

      expect(response.status()).toBe(200);
      const body = CreateBookingResponseSchema.parse(await response.json());
      expect(body.booking).toEqual(payload);

      await bookingClient.deleteBooking(body.bookingid, authToken);
    },
  );

  test('retrieves a booking by id', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.getBooking(createdBooking.bookingid);

    expect(response.status()).toBe(200);
    expect(BookingSchema.parse(await response.json())).toEqual(createdBooking.booking);
  });

  test('finds a booking by guest name', async ({ bookingClient, createdBooking }) => {
    const { firstname, lastname } = createdBooking.booking;

    const response = await bookingClient.getBookingIds({ firstname, lastname });

    expect(response.status()).toBe(200);
    const ids = BookingIdsSchema.parse(await response.json());
    expect(ids).toContainEqual({ bookingid: createdBooking.bookingid });
  });

  test('replaces a booking with PUT', async ({ bookingClient, authToken, createdBooking }) => {
    const replacement = buildBooking();

    const response = await bookingClient.updateBooking(
      createdBooking.bookingid,
      replacement,
      authToken,
    );

    expect(response.status()).toBe(200);
    expect(BookingSchema.parse(await response.json())).toEqual(replacement);

    const stored = await bookingClient.getBooking(createdBooking.bookingid);
    expect(BookingSchema.parse(await stored.json())).toEqual(replacement);
  });

  test('updates selected fields with PATCH and keeps the rest', async ({
    bookingClient,
    authToken,
    createdBooking,
  }) => {
    const changes = { firstname: 'Updated', totalprice: 999 };

    const response = await bookingClient.partialUpdateBooking(
      createdBooking.bookingid,
      changes,
      authToken,
    );

    expect(response.status()).toBe(200);
    expect(BookingSchema.parse(await response.json())).toEqual({
      ...createdBooking.booking,
      ...changes,
    });
  });

  const unauthorised = [
    { scenario: 'without a token', token: undefined },
    { scenario: 'with an invalid token', token: 'invalid-token' },
  ];

  for (const { scenario, token } of unauthorised) {
    test(`rejects an update ${scenario}`, async ({ bookingClient, createdBooking }) => {
      const response = await bookingClient.updateBooking(
        createdBooking.bookingid,
        buildBooking(),
        token,
      );

      expect(response.status()).toBe(403);

      const stored = await bookingClient.getBooking(createdBooking.bookingid);
      expect(BookingSchema.parse(await stored.json())).toEqual(createdBooking.booking);
    });
  }

  test('deletes a booking', async ({ bookingClient, authToken, createdBooking }) => {
    const response = await bookingClient.deleteBooking(createdBooking.bookingid, authToken);

    // Restful Booker answers a successful DELETE with 201 Created.
    expect(response.status()).toBe(201);
    const lookup = await bookingClient.getBooking(createdBooking.bookingid);
    expect(lookup.status()).toBe(404);
  });

  test('returns 404 for a booking that does not exist', async ({ bookingClient }) => {
    const response = await bookingClient.getBooking(999_999_999);

    expect(response.status()).toBe(404);
  });
});
