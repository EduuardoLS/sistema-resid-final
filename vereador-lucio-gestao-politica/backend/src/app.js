const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());

// Configuração de CORS para permitir que seu Frontend acesse
// (Quando você tiver o link do frontend, pode colocar ali no lugar do '*')
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Importa e usa as rotas
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes); 

// Rota raiz para testar se o servidor está online
app.get('/', (req, res) => {
    res.send('Backend do Sistema Resid está rodando! 🚀');
});

const PORT = process.env.PORT || 5000;

// Mantém o listen para rodar localmente
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// --- OBRIGATÓRIO PARA VERCEL ---
module.exports = app;