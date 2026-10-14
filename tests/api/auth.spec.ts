import { expect, test } from '@fixtures';
import { AuthResponseSchema } from '@api/schemas/booking.schema';

test.describe('Auth API', () => {
  test('health check reports the service is up', { tag: '@smoke' }, async ({ bookingClient }) => {
    const response = await bookingClient.ping();

    // Restful Booker answers its health check with 201 Created rather than 200 OK.
    expect(response.status()).toBe(201);
  });

  test('valid credentials return a token', { tag: '@smoke' }, async ({ bookingClient }) => {
    const response = await bookingClient.createToken();

    expect(response.status()).toBe(200);
    const body = AuthResponseSchema.parse(await response.json());
    expect(body.token).toMatch(/^\w+$/);
  });

  test('invalid credentials do not return a token', async ({ bookingClient }) => {
    const response = await bookingClient.createToken({ username: 'admin', password: 'wrong' });

    // Known API quirk: a failed login responds 200 with an error reason instead of 401.
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ reason: 'Bad credentials' });
  });
});
