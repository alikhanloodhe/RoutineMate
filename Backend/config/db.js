const { Pool } = require('pg');
require('dotenv').config();
// const {PGHOST,PGDATABASE,PGUSER,PGPASSWORD} = process.env
// const pool = new Pool({
//   user: process.env.DB_USER, // process is an object in Node that gives us the information about current running process
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });
// const pool = new Pool({
//   connectionString: 'postgresql://neondb_owner:npg_iX80QHEZDvNT@ep-noisy-feather-a1qkb574-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
// ,
//   ssl: { rejectUnauthorized: false }
// });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});


// const pool = new Pool({
//   host: PGHOST,
//   database: PGDATABASE,
//   username: PGUSER,
//   password: PGPASSWORD,
//   port: 5432,
//   ssl:{
//     require:true,
//   }
// });


module.exports = pool;
