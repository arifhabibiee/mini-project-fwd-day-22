import pg from 'pg';

export function createPool(database, log = console.error) {
  const pool = new pg.Pool({
    ...database,
    max: 5,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
    statement_timeout: 5000,
    query_timeout: 6000,
    // Extra defense alongside the existing SELECT-only runtime role.
    options: '-c default_transaction_read_only=on',
    application_name: 'mw75_tumi_api'
  });
  pool.on('error', () => log('DATABASE_POOL_ERROR'));
  return pool;
}
