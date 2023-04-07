"use strict";

/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getFormattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id,
                  customer_id AS "customerId",
                  num_guests AS "numGuests",
                  start_at AS "startAt",
                  notes AS "notes"
           FROM reservations
           WHERE customer_id = $1`,
        [customerId],
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
            `INSERT INTO reservations (customer_id, numGuests, startAt, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
          [this.customerId, this.numGuests, this.startAt, this.notes],
      );
      console.log("CUSTOMER ID!!!!!!!!", this.customerId)
      this.id = result.rows[0].id;
      console.log("ID!!!!!!!!!!!!!!!!!", this.id)
    } else {
      await db.query(
            `UPDATE reservations
             SET numGuests=$1,
                 startAt=$2,
                 notes=$3
             WHERE id = $4`, [
            this.numGuests,
            this.startAt,
            this.phone,
            this.notes,
            this.id,
          ],
      );
    }
  }
}


module.exports = Reservation;
