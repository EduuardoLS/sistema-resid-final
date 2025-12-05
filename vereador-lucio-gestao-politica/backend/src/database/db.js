const { Pool } = require('pg');
require('dotenv').config();

// Configuração correta para Vercel + Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // <--- OBRIGATÓRIO: Permite conexão segura com o Neon
  }
});

// Tratamento de erro básico na conexão (opcional, mas bom para debug)
pool.on('error', (err, client) => {
  console.error('Erro inesperado no pool de conexão do PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};