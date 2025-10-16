const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

exports.register = async (req, res) => {
    const { nome, email, senha, telefone, assinatura } = req.body;

    if (!nome || !email || !senha || !telefone ) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const exists = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ message: 'Email já cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const { rows } = await pool.query(
            `INSERT INTO users (id,nome,email,senha,telefone)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id,nome,email,telefone,assinatura,foto_perfil,foto_fundo`,
            [uuidv4(), nome, email, hashedPassword, telefone, assinatura]
        );

        return res.status(201).json({ message: 'Usuário registrado com sucesso', user: rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Email ou senha incorretos' });
        }
        const usuario = rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ message: 'Email ou senha incorretos' });
        }

        delete usuario.senha;
        return res.json(usuario);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro no login' });
    }
};
