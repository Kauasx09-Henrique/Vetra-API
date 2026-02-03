const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const espacoRoutes = require('./src/routes/espacoRoutes');
const agendamentoRoutes = require('./src/routes/agendamentoRoutes');
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); app.use('/auth', authRoutes);
app.use('/espacos', espacoRoutes);
app.use('/agendamentos', agendamentoRoutes);
app.use('auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});