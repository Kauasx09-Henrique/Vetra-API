const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarEmailStatus = async (para, nome, status, data, id) => {
    // Assunto dinâmico
    const assunto = status === 'CONFIRMADO'
        ? 'Vetra: Sua reserva foi confirmada!'
        : 'Vetra: Atualização sobre o cancelamento da sua reserva';

    // Textos personalizados dependendo do status
    const textoMensagem = status === 'CONFIRMADO'
        ? 'Temos uma ótima notícia! O status da sua reserva foi atualizado para <strong>CONFIRMADO</strong>. Nosso estúdio está pronto e ansioso para receber a sua produção.'
        : 'O status da sua reserva foi atualizado para <strong>CANCELADO</strong>. O horário foi liberado em nossa agenda. Caso tenha dúvidas ou queira agendar uma nova data, estamos à disposição.';

    // Cores dinâmicas para o status
    const corFundoStatus = status === 'CONFIRMADO' ? '#e8f5e9' : '#fdedec';
    const corTextoStatus = status === 'CONFIRMADO' ? '#27ae60' : '#c0392b';

    // Link do seu site (mude quando for publicar de verdade)
    const linkPainel = 'http://localhost:5173/meus-agendamentos';

    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 40px 10px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.05);">
                
                <div style="background-color: #1a1a1a; padding: 35px 20px; text-align: center;">
                    <h1 style="color: #C0A062; margin: 0; font-size: 28px; letter-spacing: 3px; text-transform: uppercase; font-family: 'Times New Roman', Times, serif;">
                        ESTÚDIO VETRA
                    </h1>
                </div>
                
                <div style="padding: 40px 35px;">
                    <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">Olá, ${nome.split(' ')[0]}!</h2>
                    
                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        ${textoMensagem}
                    </p>

                    <div style="background-color: #fcfcfc; border: 1px solid #eeeeee; border-radius: 8px; padding: 25px;">
                        <h3 style="margin-top: 0; color: #1a1a1a; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eeeeee; padding-bottom: 15px; margin-bottom: 20px;">
                            Resumo do Agendamento
                        </h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #888888; font-size: 14px; text-transform: uppercase;">Código da Reserva:</td>
                                <td style="padding: 10px 0; color: #1a1a1a; font-weight: bold; text-align: right; font-size: 16px;">#${id.toString().padStart(4, '0')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-top: 1px dashed #eeeeee; color: #888888; font-size: 14px; text-transform: uppercase;">Data da Sessão:</td>
                                <td style="padding: 10px 0; border-top: 1px dashed #eeeeee; color: #1a1a1a; font-weight: bold; text-align: right; font-size: 16px;">${data}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-top: 1px dashed #eeeeee; color: #888888; font-size: 14px; text-transform: uppercase;">Status Atual:</td>
                                <td style="padding: 10px 0; border-top: 1px dashed #eeeeee; text-align: right;">
                                    <span style="background-color: ${corFundoStatus}; color: ${corTextoStatus}; padding: 6px 14px; border-radius: 50px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                                        ${status}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin-top: 40px;">
                        <a href="${linkPainel}" style="background-color: #C0A062; color: #1a1a1a; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                            Ver Minhas Reservas
                        </a>
                    </div>
                </div>

                <div style="background-color: #f9f9f9; padding: 25px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px;">
                        Este é um e-mail automático, por favor não responda diretamente a ele.
                    </p>
                    <p style="margin: 0; color: #666666; font-size: 13px; font-weight: bold;">
                        Estúdio Vetra &copy; ${new Date().getFullYear()}
                    </p>
                </div>

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
        console.log(`E-mail de status (${status}) enviado para ${para}`);
    } catch (error) {
        console.error("Erro ao enviar email:", error);
    }
};

module.exports = { enviarEmailStatus };