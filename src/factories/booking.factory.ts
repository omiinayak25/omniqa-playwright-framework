/**
 * --------------------------------------------------------
 * File: booking.factory.ts
 * Module: Factories
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Produces Restful-Booker {@link Booking} datasets — single valid, bulk,
 * edge-case, and labelled invalid-case collections — by composing BookingBuilder.
 *
 * Dependencies:
 * @builders (BookingBuilder), @factories/factory (generate), @models/booking.model.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { BookingBuilder } from '@builders/index';
import { generate } from '@factories/factory';
import type { Booking } from '@models/booking.model';

/** A named invalid case (payload + why it is invalid). */
export interface InvalidBooking {
  readonly label: string;
  readonly booking: Booking;
}

/** Dataset factory for {@link Booking} payloads (composes BookingBuilder). */
export class BookingFactory {
  /** One valid, randomized booking. */
  public static valid(): Booking {
    return BookingBuilder.valid().build();
  }

  /** `count` valid, independently-randomized bookings. */
  public static many(count: number): Booking[] {
    return generate(count, () => BookingBuilder.valid().build());
  }

  /** Edge cases: minimum legal price and a maximal additional-needs string. */
  public static edgeCases(): Booking[] {
    return [
      BookingBuilder.valid().withMinimumPrice().build(),
      BookingBuilder.valid().withAdditionalNeeds('X'.repeat(255)).build(),
    ];
  }

  /** Labelled invalid cases for negative testing. */
  public static invalidCases(): readonly InvalidBooking[] {
    return [
      { label: 'negative price', booking: BookingBuilder.invalidNegativePrice().build() },
      { label: 'reversed dates', booking: BookingBuilder.invalidReversedDates().build() },
    ];
  }
}
