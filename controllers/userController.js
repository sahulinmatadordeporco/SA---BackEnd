const fs = require('fs');
const path = require('path');
const pool = require('../db');
const uploadDir = path.join(__dirname, '..', 'uploads'); 

exports.getAllUsers = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id,nome,email,telefone FROM users'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id,nome,email,telefone FROM users WHERE id=$1',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });

        const user = rows[0];
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
};


exports.updateData = async (req, res) => {
    const userId = req.params.id;
    const { nome, telefone, email } = req.body;

    try {
        const { rows } = await pool.query(
            `UPDATE users
            SET nome=COALESCE($1,nome),
                telefone=COALESCE($2,telefone),
                email=COALESCE($3,email),
                updated_at=NOW()
            WHERE id=$4
            RETURNING id,nome,email,telefone`, 
            [nome || null, telefone || null, email || null, userId]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.json({ message: 'Informação atualizada com sucesso', usuario: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar dados' });
    }
};
