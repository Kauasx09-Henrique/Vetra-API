📸 Vetra Studio API
Bem-vindo ao repositório oficial da API do Vetra Studio, o motor de regras de negócio e persistência de dados por trás do nosso sistema de locação de cenários de alto padrão.

📖 Sobre o Projeto
O Vetra Studio precisava de uma solução robusta para gerenciar a agenda de seus espaços fotográficos e cenários. Esta API foi projetada do zero para resolver desafios reais do dia a dia do estúdio, eliminando o risco de overbooking (choque de horários) e automatizando a precificação.

Mais do que um simples CRUD de reservas, o sistema conta com inteligência para:

Precificação Dinâmica: O valor da locação é calculado automaticamente com base no tempo de permanência e no dia da semana (aplicando tarifas diferenciadas para sábados, domingos e feriados).

Gestão de Pagamentos: Acréscimo automático de taxas (ex: 15% para pagamentos no cartão de crédito) e registro de pagamentos via PIX.

Bloqueio Administrativo: Administradores podem fechar a agenda de cenários específicos para manutenção, limpeza ou ensaios externos (status BLOQUEADO), impedindo que clientes tentem reservar aquele horário.

Comunicação Ativa: O sistema gera notificações internas no painel e dispara e-mails automáticos para o cliente sempre que o status de uma reserva muda (Confirmado, Cancelado, etc).

🚀 Tecnologias Utilizadas
O backend foi construído visando performance, segurança e escalabilidade:

Node.js & Express: Arquitetura do servidor e roteamento rápido.

PostgreSQL (pg): Banco de dados relacional forte e tipado, garantindo a integridade financeira e de horários.

JSON Web Tokens (JWT): Autenticação segura e separação rigorosa entre rotas de Clientes e rotas de Administradores.

Multer: Processamento de uploads (comprovantes de pagamento e fotos de perfil de usuários).

Nodemailer: Motor de envio de e-mails transacionais.

⚙️ Funcionalidades em Destaque
[x] Gestão de Usuários: Cadastro, login, bloqueio de inadimplentes e níveis de acesso.

[x] Motor de Agendamentos: Validação de conflitos de horário no momento exato do clique.

[x] Dashboard Admin: Endpoints dedicados para listar reservas ordenadas por proximidade de data e filtradas por dias específicos.

[x] Sistema de Cancelamento: Lógica de reagendamento e regras de prazo (ex: antecedência mínima de 3 dias para reagendar PIX).

📦 Instalação e Execução Local
Para rodar este projeto na sua máquina, siga os passos abaixo:

1. Clone o repositório:

Bash
git clone https://github.com/SEU-USUARIO/vetra-api.git
cd vetra-api
2. Instale as dependências:

Bash
npm install
3. Configure o Banco de Dados:
Certifique-se de ter o PostgreSQL rodando. O sistema exige a criação prévia dos tipos Enumerados para funcionar corretamente:

SQL
CREATE TYPE status_agendamento AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'BLOQUEADO');
CREATE TYPE tipo_pagamento AS ENUM ('PIX', 'CREDITO', 'DEBITO');
CREATE TYPE tipo_usuario AS ENUM ('CLIENTE', 'ADMIN');
4. Inicie o servidor:

Bash
# Inicia em modo de desenvolvimento (com auto-restart)
npm run dev
🔗 Estrutura de Endpoints (Resumo)
/auth: Login e Registro de usuários.

/usuarios: Gestão de perfis, alteração de permissões e fotos.

/espacos: Cadastro e listagem dos cenários físicos do estúdio.

/agendamentos: Criação de reservas, checagem de disponibilidade, mudança de status e aplicação de bloqueios.

Desenvolvido com excelência para elevar a experiência de gestão do Vetra Studio.
