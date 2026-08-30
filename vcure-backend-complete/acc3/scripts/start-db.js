const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');

async function start() {
  console.log('Starting Embedded PostgreSQL on port 5432...');
  const dbDir = path.join(__dirname, '../.pgdata');
  const pg = new EmbeddedPostgres({
    port: 5432,
    databaseDir: dbDir,
    user: 'vcure_user',
    password: 'CHANGE_ME',
    initialDatabase: 'vcure',
  });

  try {
    await pg.initialise();
  } catch (e) {
    console.log('Postgres already initialized or initializing:', e.message);
  }

  await pg.start();
  console.log('Embedded PostgreSQL is READY on postgresql://vcure_user:CHANGE_ME@localhost:5432/vcure');
}

start().catch((err) => {
  console.error('Failed to start Embedded Postgres:', err);
  process.exit(1);
});
