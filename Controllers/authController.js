const db = require('../db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (users.length === 0) return res.json({ success: false });
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        res.json({ success: isMatch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};