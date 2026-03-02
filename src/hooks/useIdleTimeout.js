import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';

const useIdleTimeout = (minutos = 10) => {
    const navigate = useNavigate();

    useEffect(() => {
        let timeoutId;

        const realizarLogout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            Store.addNotification({
                title: "Sessão Encerrada",
                message: "Você foi desconectado por inatividade.",
                type: "warning",
                insert: "top",
                container: "top-right",
                dismiss: { duration: 4000 }
            });

            navigate('/login');
        };

        const resetarTimer = () => {
            clearTimeout(timeoutId);
            // Multiplica minutos por 60 segundos e depois por 1000 milissegundos
            timeoutId = setTimeout(realizarLogout, minutos * 60 * 1000);
        };

        // Eventos que o navegador entende como "o usuário está mexendo"
        const eventosDeAtividade = ['mousemove', 'keydown', 'scroll', 'click'];

        // Ativa os rastreadores
        eventosDeAtividade.forEach(evento => window.addEventListener(evento, resetarTimer));
        
        // Inicia a contagem logo que o componente carrega
        resetarTimer();

        // Limpeza (Clean up) quando o usuário sai do sistema
        return () => {
            eventosDeAtividade.forEach(evento => window.removeEventListener(evento, resetarTimer));
            clearTimeout(timeoutId);
        };
    }, [navigate, minutos]);
};

export default useIdleTimeout;