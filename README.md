📸 Vetra Studio API

API desenvolvida para gerenciar reservas e locações de cenários fotográficos de alto padrão, garantindo controle de agenda, automação de preços e prevenção de conflitos de horários.

O sistema foi projetado para resolver problemas reais de gestão em estúdios fotográficos, oferecendo um backend robusto para gerenciamento de usuários, reservas, pagamentos e administração da agenda.

🚀 Tecnologias Utilizadas

Node.js

Express

PostgreSQL

JWT (JSON Web Token)

Multer

Nodemailer

📖 Sobre o Projeto

O Vetra Studio precisava de uma solução eficiente para gerenciar a agenda de seus cenários e evitar problemas como:

choque de horários (overbooking)

controle manual de pagamentos

dificuldade de comunicação com clientes

falta de controle administrativo da agenda

Esta API resolve esses desafios através de regras de negócio automatizadas e validações em tempo real.

⚙️ Principais Funcionalidades
Gestão de Usuários

Cadastro de clientes

Login com autenticação JWT

Diferentes níveis de acesso (CLIENTE e ADMIN)

Bloqueio de usuários inadimplentes

Upload de foto de perfil

Sistema de Agendamentos

Criação de reservas

Validação automática de conflitos de horário

Listagem de reservas por data

Ordenação por proximidade de agendamento

Precificação Dinâmica

O valor da locação é calculado automaticamente com base em:

tempo de permanência

dia da semana

finais de semana

feriados

Gestão de Pagamentos

Suporte para diferentes formas de pagamento:

PIX

Cartão de crédito

Cartão de débito

Regras automáticas:

acréscimo de 15% para pagamentos no crédito

registro de comprovantes

Bloqueio Administrativo

Administradores podem bloquear cenários ou horários específicos para:

manutenção

limpeza

ensaios externos

eventos internos

Status especial:

BLOQUEADO

Esse status impede que novos agendamentos sejam realizados no período.

Comunicação com o Cliente

O sistema envia notificações automáticas quando ocorre alteração no status da reserva:

confirmação

cancelamento

alteração de status

As notificações incluem:

e-mails automáticos

notificações internas no painel administrativo

🔗 Estrutura de Endpoints
Auth
/auth

Responsável por:

registro de usuários

login

autenticação

Usuários
/usuarios

Gerenciamento de usuários:

atualização de perfil

alteração de permissões

upload de foto

Espaços
/espacos

Gerenciamento dos cenários do estúdio.

Agendamentos
/agendamentos

Funcionalidades:

criação de reservas

verificação de disponibilidade

mudança de status

bloqueios administrativos

📦 Instalação

Clone o repositório:

git clone https://github.com/SEU-USUARIO/vetra-api.git

Entre na pasta do projeto:

cd vetra-api

Instale as dependências:

npm install
🗄 Configuração do Banco de Dados

Certifique-se de que o PostgreSQL esteja rodando.

Execute os comandos abaixo para criar os tipos ENUM necessários:

CREATE TYPE status_agendamento AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'BLOQUEADO');

CREATE TYPE tipo_pagamento AS ENUM ('PIX', 'CREDITO', 'DEBITO');

CREATE TYPE tipo_usuario AS ENUM ('CLIENTE', 'ADMIN');
▶️ Executando o Projeto

Modo desenvolvimento:

npm run dev

Modo produção:

npm start
📂 Estrutura do Projeto
vetra-api
│
├── controllers
├── routes
├── middlewares
├── services
├── database
├── uploads
│
├── app.js
├── server.js
└── package.json
🔐 Segurança

A API utiliza:

autenticação via JWT

controle de permissões por middleware

separação de rotas para CLIENTE e ADMIN

👨‍💻 Autor

Kauã Henrique

GitHub
https://github.com/Kauasx09-Henrique

Portfólio
https://kauahenriquedev.com.br/
