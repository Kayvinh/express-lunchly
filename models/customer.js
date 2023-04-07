"use strict";

const { last } = require("nunjucks/src/filters");
/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           ORDER BY last_name, first_name`,
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE id = $1`,
      [id],
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
             SET first_name=$1,
                 last_name=$2,
                 phone=$3,
                 notes=$4
             WHERE id = $5`, [
        this.firstName,
        this.lastName,
        this.phone,
        this.notes,
        this.id,
      ],
      );
    }
  }

  /** Function returns full name */
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**function finds customer with name like input name for one input
   * returns [Customer{id...}, Customer{id...}]
   */
  static async filterByOneWord(name) {
    const result = await db.query(
      `SELECT id, 
          first_name AS "firstName", 
          last_name AS "lastName",
          phone, notes
        FROM customers
        WHERE first_name LIKE $1 OR
        last_name LIKE $1
        `,
      [`%${name}%`],
    );
    return result.rows.map(c => new Customer(c));

  }

  /**finds customer name like input name 
   * returns [Customer{id...}, Customer{id...}]
   */
  static async searchName(name) {

    const firstAndLast = name.split(" ");
    let [firstName, lastName] = firstAndLast;

    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    let customer;

    if (firstAndLast.length === 1) {
      customer = await this.filterByOneWord(firstName);
    }
    else {
      lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

      const result = await db.query(
        `SELECT id, 
        first_name AS "firstName", 
        last_name AS "lastName",
        phone, notes
      FROM customers
      WHERE first_name LIKE $1 OR
      last_name LIKE $2
      `,
        [`%${firstName}%`, `%${lastName}%`],
      );

      customer = result.rows.map(c => new Customer(c));

    }
    return customer;


  }
}

module.exports = Customer;
