const { randomBytes } = require('crypto');
const { default: migrate } = require('node-pg-migrate');
const format = require('pg-format');
const pool = require('../pool');

const DEFAULT_OPTIONS = {
  host: 'localhost',
  port: 5432,
  database: 'pg-ex-test',
  user: 'zephyr',
  password: '',
};

class Context {
  static async build() {
    // Randomly generation a role name to connect to PG as
    const roleName = 'a' + randomBytes(4).toString('hex'); // role name must be string in PG

    // Connect to PG as usual
    await pool.connect(DEFAULT_OPTIONS);

    // Create a new role
    // await pool.query(`CREATE ROLE ${roleName} WITH LOGIN PASSWORD '${roleName}';`);
    await pool.query(
      format('CREATE ROLE %I WITH LOGIN PASSWORD %L;', roleName, roleName)
    );

    // Create a schema with the same name
    // await pool.query(`CREATE SCHEMA ${roleName} AUTHORIZATION ${roleName};`);
    await pool.query(
      format('CREATE SCHEMA %I AUTHORIZATION %I', roleName, roleName)
    );

    // Disconnect entirely from PG
    await pool.close();

    // Run out migration in the new schema
    await migrate({
      schema: roleName,
      direction: 'up',
      log: () => {},
      noLock: true,
      dir: 'migrations',
      databaseUrl: {
        host: 'localhost',
        port: 5432,
        database: 'pg-ex-test',
        user: roleName,
        password: roleName,
      },
    });

    // Connect to PG as the newly created role
    await pool.connect({
      host: 'localhost',
      port: 5432,
      database: 'pg-ex-test',
      user: roleName,
      password: roleName,
    });

    return new Context(roleName);
  }

  constructor(roleName) {
    this.roleName = roleName;
  }

  async close() {
    // Disconnect from PG
    await pool.close();

    // Reconnect as root user
    await pool.connect(DEFAULT_OPTIONS);

    // Delete the role and schema created
    await pool.query(format('DROP SCHEMA %I CASCADE;', this.roleName));
    await pool.query(format('DROP ROLE %I;', this.roleName));

    // Disconnect
    await pool.close();
  }

  async reset() {
    return pool.query('DELETE FROM users;'); // delete all rows in users table
  }
}

module.exports = Context;
