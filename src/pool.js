const pg = require('pg');

// Not using this normal approach since not appropriate to have multiple databases
// const pool = new pg.Pool({
//   host:'localhost',
//   post:5432
// });

// module.exports = pool

class Pool {
  _pool = null;

  // to connect to different databases at some point of time with options
  connect(options) {
    this._pool = new pg.Pool(options); // new pg.Pool(options) only create client in pool not actually connect to the database
    return this._pool.query('SELECT 1 + 1'); // create connection to database by making a query to the database
  }

  close() {
    return this._pool.end(); // disconnect to database
  }

  query(sql, params) {
    return this._pool.query(sql, params);
  }
}

module.exports = new Pool();
