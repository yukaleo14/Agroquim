const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path'); // Nueva línea: Importa el módulo 'path'
const authRoutes = require('./Routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0303hecate456',
    database: 'agroquimicos_db'
});

// Nueva sección: Sirve el archivo 'fronted' como la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'fronted.html'));
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.json({ success: false });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        res.json({ success: isMatch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/lotes', async (req, res) => {
    try {
        const [lotes] = await db.query('SELECT * FROM lotes');
        res.json(lotes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/agroquimicos', async (req, res) => {
    try {
        const [agroquimicos] = await db.query('SELECT * FROM agroquimicos');
        res.json(agroquimicos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/lotes', async (req, res) => {
    const { loteId, fecha, comentario, hectareas, agroquimicos } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO registros_lotes (lote_id, fecha, comentario, hectareas) VALUES (?, ?, ?, ?)',
            [loteId, fecha, comentario, hectareas]
        );

        const registroId = result.insertId;

        for (const ag of agroquimicos) {
            const [agroquimico] = await connection.query(
                'SELECT id, cantidad FROM agroquimicos WHERE nombre = ?',
                [ag.nombre]
            );
            if (agroquimico[0]) {
                const nuevaCantidad = agroquimico[0].cantidad - (ag.cantidad * hectareas);
                await connection.query(
                    'UPDATE agroquimicos SET cantidad = ? WHERE id = ?',
                    [nuevaCantidad, agroquimico[0].id]
                );
                await connection.query(
                    'INSERT INTO registros_agroquimicos (registro_id, agroquimico_id, cantidad, unidad) VALUES (?, ?, ?, ?)',
                    [registroId, agroquimico[0].id, ag.cantidad * hectareas, ag.unidad]
                );
            }
        }

        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        connection.release();
    }
});

app.post('/api/agroquimicos', async (req, res) => {
    const { nombre, cantidad, unidad } = req.body;
    try {
        await db.query(
            'INSERT INTO agroquimicos (nombre, cantidad, unidad) VALUES (?, ?, ?)',
            [nombre, cantidad, unidad]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/agroquimicos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad, unidad } = req.body;
    try {
        await db.query(
            'UPDATE agroquimicos SET nombre = ?, cantidad = ?, unidad = ? WHERE id = ?',
            [nombre, cantidad, unidad, id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/agroquimicos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM agroquimicos WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/informes', async (req, res) => {
    const { loteId, startDate, endDate } = req.query;
    try {
        let query = `
            SELECT l.nombre, r.fecha, r.comentario, r.hectareas,
                   ra.cantidad, ra.unidad, a.nombre as agroquimico_nombre
            FROM lotes l
            JOIN registros_lotes r ON l.id = r.lote_id
            JOIN registros_agroquimicos ra ON r.id = ra.registro_id
            JOIN agroquimicos a ON ra.agroquimico_id = a.id
        `;
        const params = [];

        if (loteId) {
            query += ' WHERE l.id = ?';
            params.push(loteId);
        }

        if (startDate && endDate) {
            query += loteId ? ' AND' : ' WHERE';
            query += ' r.fecha BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        const [rows] = await db.query(query, params);

        const informes = {};
        rows.forEach(row => {
            if (!informes[row.nombre]) {
                informes[row.nombre] = { nombre: row.nombre, registros: [] };
            }
            let registro = informes[row.nombre].registros.find(r => r.fecha === row.fecha);
            if (!registro) {
                registro = {
                    fecha: row.fecha,
                    comentario: row.comentario,
                    hectareas: row.hectareas,
                    agroquimicos: []
                };
                informes[row.nombre].registros.push(registro);
            }
            registro.agroquimicos.push({
                nombre: row.agroquimico_nombre,
                cantidad: row.cantidad,
                unidad: row.unidad
            });
        });

        res.json(Object.values(informes));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Define el puerto donde tu servidor Express va a escuchar
const PORT = process.env.PORT || 3000;

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Database connected successfully!'); // Opcional: mensaje de confirmación de DB
});