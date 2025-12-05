// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

exports.login = async (req, res) => {
   
    const { email, senha, password } = req.body;
    const senhaFinal = senha || password; 

    if (!email || !senhaFinal) {
        return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    try {
        const result = await db.query('SELECT * FROM "Profiles" WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log("TESTE: E-mail não encontrado no banco.");
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = result.rows[0];
        const passwordHashFromDB = user.password.trim();
        const validPassword = await bcrypt.compare(senha, passwordHashFromDB);

        if (!validPassword) {
            console.log("TESTE: A comparação de senha com bcrypt deu FALSE.");
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        
        console.log("TESTE: A comparação de senha deu TRUE. Gerando token...");
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token,
            user: { id: user.id, first_name: user.first_name, role: user.role }
        });

    } catch (err) {
        console.error('Erro no login:', err.message);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};