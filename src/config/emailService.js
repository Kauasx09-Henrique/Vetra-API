const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarEmailStatus = async (para, nome, status, data, id) => {
    const assunto = status === 'CONFIRMADO' ? 'Sua reserva foi confirmada!' : 'Sua reserva foi cancelada';
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                <h1 style="color: #C0A062; margin: 0;">Estúdio Vetra</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #333333;">Olá, ${nome}</h2>
                <p style="color: #666666; font-size: 16px; line-height: 1.5;">
                    O status do seu agendamento <strong>#${id}</strong> para a data <strong>${data}</strong> foi atualizado.
                </p>
                <div style="background-color: ${status === 'CONFIRMADO' ? '#e8f5e9' : '#fdedec'}; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
                    <span style="color: ${status === 'CONFIRMADO' ? '#27ae60' : '#c0392b'}; font-weight: bold; font-size: 18px;">
                        ${status}
                    </span>
                </div>
                <p style="color: #666666; font-size: 14px;">
                    Para mais detalhes, acesse a área do cliente no nosso site.
                </p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Estúdio Vetra" <${process.env.EMAIL_USER}>`,
            to: para,
            subject: assunto,
            html: html
        });
    } catch (error) {
        console.error(error);
    }
};

module.exports = { enviarEmailStatus };