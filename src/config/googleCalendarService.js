const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../google-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
});

const calendar = google.calendar({ version: 'v3', auth });

const criarEventoNoGoogle = async (dadosAgendamento) => {
    try {
        const event = {
            summary: `Vetra Reserva: ${dadosAgendamento.clienteNome}`,
            description: `Reserva gerada pelo sistema Vetra.\nCliente: ${dadosAgendamento.clienteNome}\nEmail: ${dadosAgendamento.clienteEmail}\nID Reserva: #${dadosAgendamento.id}\nMétodo: ${dadosAgendamento.metodo_pagamento}`,
            start: {
                dateTime: new Date(dadosAgendamento.data_inicio).toISOString(),
                timeZone: 'America/Sao_Paulo',
            },
            end: {
                dateTime: new Date(dadosAgendamento.data_fim).toISOString(),
                timeZone: 'America/Sao_Paulo',
            },
        };

        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            resource: event,
        });

        return response.data;
    } catch (error) {
        console.error(error);
    }
};

module.exports = { criarEventoNoGoogle };