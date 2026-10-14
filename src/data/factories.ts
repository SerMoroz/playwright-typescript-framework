import { faker } from '@faker-js/faker';
import type { Booking } from '../api/schemas/booking.schema';

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Builds a random, valid checkout customer. Any field can be overridden for negative tests. */
export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    ...overrides,
  };
}

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Builds a random, valid booking payload. Check-out is always after check-in. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = new Date(checkin);
  checkout.setUTCDate(checkin.getUTCDate() + faker.number.int({ min: 1, max: 14 }));
  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 2000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: toIsoDate(checkin), checkout: toIsoDate(checkout) },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Airport transfer']),
    ...overrides,
  };
}
