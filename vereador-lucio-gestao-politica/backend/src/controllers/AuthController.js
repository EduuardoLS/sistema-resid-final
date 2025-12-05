const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

exports.login = async (req, res) => {
    // 1. Aceita tanto 'senha' (seu front) quanto 'password'
    const { email, senha, password } = req.body;
    const senhaFinal = senha || password;

    if (!email || !senhaFinal) {
        return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    try {
        console.log(`Tentativa de login para: ${email}`);

        // 2. CORREÇÃO CRUCIAL: Removemos as aspas do nome da tabela
        // O Postgres é case-insensitive se tirar as aspas. 
        // Se sua tabela for 'Profiles', 'profiles' ou 'PROFILES', ele vai achar.
        const result = await db.query('SELECT * FROM Profiles WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log("Usuário não encontrado no banco.");
            return res.status(401).json({ message: 'E-mail não cadastrado.' });
        }

        const user = result.rows[0];
        
        // 3. Comparação de senha
        const validPassword = await bcrypt.compare(senhaFinal, user.password);

        if (!validPassword) {
            console.log("Senha incorreta.");
            return res.status(401).json({ message: 'Senha incorreta.' });
        }
        
        console.log("Login autorizado!");
        
        // 4. Geração do Token
        const token = jwt.sign(
            { id: user.id, role: user.role, permissoes: user.permissoes },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token,
            user: { 
                id: user.id, 
                first_name: user.first_name, 
                role: user.role 
            }
        });

    } catch (err) {
        // ESSE LOG VAI SALVAR SUA VIDA NA VERCEL
        console.error('ERRO GRAVE NO LOGIN:', err);
        
        // Retorna o erro exato para o front (ajuda a descobrir se é tabela inexistente)
        res.status(500).json({ message: `Erro no servidor: ${err.message}` });
    }
};