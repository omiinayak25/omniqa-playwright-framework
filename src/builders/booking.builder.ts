/**
 * --------------------------------------------------------
 * File: booking.builder.ts
 * Module: Builders
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Fluent builder for Restful-Booker {@link Booking} payloads — valid randomized
 * defaults plus intention-revealing valid/invalid/boundary variants, so API and
 * E2E tests declare the data they need instead of hand-assembling literals.
 *
 * Responsibilities:
 * - Seed a valid, randomized booking (faker) with consistent check-in/out dates.
 * - Offer chainable mutators (guest, price, deposit, dates, needs).
 * - Offer named invalid/boundary variants (negative price, reversed dates).
 *
 * Used By:
 * @factories/booking.factory; API/E2E booking specs and BDD steps.
 *
 * Dependencies:
 * @faker-js/faker, @builders/builder (AbstractBuilder), @models/booking.model.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { faker } from '@faker-js/faker';
import { AbstractBuilder } from '@builders/builder';
import type { Booking } from '@models/booking.model';

/** Format a Date as a Restful-Booker `YYYY-MM-DD` string. */
function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Builds {@link Booking} payloads. Entry point: {@link BookingBuilder.valid}.
 * @example BookingBuilder.valid().withGuest('Ada', 'Lovelace').withPrice(500).build();
 */
export class BookingBuilder extends AbstractBuilder<Booking> {
  private constructor(seed: Booking) {
    super(seed);
  }

  /** A valid, randomized booking with coherent check-in/check-out dates. */
  public static valid(): BookingBuilder {
    const checkin = faker.date.soon({ days: 30 });
    const checkout = faker.date.soon({ days: 7, refDate: checkin });
    return new BookingBuilder({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      totalprice: faker.number.int({ min: 50, max: 2_000 }),
      depositpaid: faker.datatype.boolean(),
      bookingdates: { checkin: toIsoDate(checkin), checkout: toIsoDate(checkout) },
      additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Sea view']),
    });
  }

  public withGuest(firstname: string, lastname: string): this {
    return this.with({ firstname, lastname });
  }

  public withPrice(totalprice: number): this {
    return this.with({ totalprice });
  }

  public withDeposit(depositpaid: boolean): this {
    return this.with({ depositpaid });
  }

  public withDates(checkin: string, checkout: string): this {
    return this.with({ bookingdates: { checkin, checkout } });
  }

  public withAdditionalNeeds(additionalneeds: string): this {
    return this.with({ additionalneeds });
  }

  /** Boundary: the minimum legal positive price. */
  public withMinimumPrice(): this {
    return this.with({ totalprice: 1 });
  }

  /** Invalid: a negative total price (business-rule violation). */
  public static invalidNegativePrice(): BookingBuilder {
    return BookingBuilder.valid().with({ totalprice: -100 });
  }

  /** Invalid: check-out before check-in. */
  public static invalidReversedDates(): BookingBuilder {
    return BookingBuilder.valid().with({
      bookingdates: { checkin: '2026-09-10', checkout: '2026-09-01' },
    });
  }
}
