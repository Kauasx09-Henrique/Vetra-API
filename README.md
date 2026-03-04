<div align="center">

<img src="https://media.giphy.com/media/f3iwJFOVOwuy7K6FFw/giphy.gif" width="800">

# 📸 Vetra Studio API

### Sistema inteligente de gestão de reservas para estúdios fotográficos

API REST desenvolvida para gerenciar **locação de cenários fotográficos**, automatizando agenda, pagamentos e precificação.

</div>

<br>

<div align="center">

![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge)
![Multer](https://img.shields.io/badge/File%20Upload-Multer-orange?style=for-the-badge)
![Nodemailer](https://img.shields.io/badge/Email-Nodemailer-blue?style=for-the-badge)

</div>

---

# 📖 Sobre o Projeto

O **Vetra Studio** precisava de uma solução confiável para gerenciar a agenda dos seus cenários fotográficos.

Esta API foi criada para resolver problemas comuns na gestão de estúdios:

- conflito de horários
- controle manual de reservas
- dificuldade de calcular valores
- falta de comunicação automática com clientes

A solução implementa **regras de negócio inteligentes**, garantindo mais segurança e automação para o sistema de reservas.

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

# 🚀 Funcionalidades

## 👤 Gestão de Usuários

- cadastro de clientes
- login com autenticação **JWT**
- níveis de acesso (**CLIENTE / ADMIN**)
- bloqueio de usuários inadimplentes
- upload de foto de perfil

---

## 📅 Sistema de Agendamentos

Motor responsável por validar horários e criar reservas.

Funcionalidades:

- criação de reservas
- validação automática de disponibilidade
- prevenção de **overbooking**
- listagem de reservas por data
- ordenação por proximidade de horário

---

## 💰 Precificação Dinâmica

O sistema calcula automaticamente o valor da locação com base em:

- tempo de permanência
- dia da semana
- finais de semana
- feriados

Isso elimina cálculos manuais e reduz erros.

---

## 💳 Gestão de Pagamentos

Suporte para:

- PIX
- crédito
- débito

Regras aplicadas automaticamente:

- acréscimo de **15% para pagamentos no crédito**
- registro de comprovantes de pagamento

---

## 🔒 Bloqueio Administrativo

Administradores podem bloquear cenários ou horários para:

- manutenção
- limpeza
- ensaios externos
- eventos internos

Status utilizado no sistema:

```sql
BLOQUEADO

Isso impede novos agendamentos naquele horário.

🔔 Sistema de Notificações

Sempre que o status de uma reserva muda, o sistema envia notificações.

Eventos monitorados:

confirmação de reserva

cancelamento

alteração de status

Notificações incluem:

envio de e-mails automáticos

notificações no painel administrativo

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
🧠 Regras de Negócio

A API implementa diversas regras para garantir a integridade das reservas:

validação de conflitos de horário em tempo real

cálculo automático de valores

diferenciação de tarifas por dia da semana

controle de cancelamento

reagendamento permitido com antecedência mínima de 3 dias para pagamentos via PIX

🔗 Endpoints Principais
Endpoint	Descrição
/auth	Registro e login de usuários
/usuarios	Gestão de perfis
/espacos	Cadastro e listagem de cenários
/agendamentos	Criação e gerenciamento de reservas
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
📦 Instalação

Clone o repositório:

git clone https://github.com/Kauasx09-Henrique/Vetra-API.git

Entre na pasta do projeto:

cd Vetra-API

Instale as dependências:

npm install
🗄 Configuração do Banco de Dados

Certifique-se de ter o PostgreSQL instalado e rodando.

Execute os comandos abaixo:

CREATE TYPE status_agendamento AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'BLOQUEADO');

CREATE TYPE tipo_pagamento AS ENUM ('PIX', 'CREDITO', 'DEBITO');

CREATE TYPE tipo_usuario AS ENUM ('CLIENTE', 'ADMIN');
▶️ Executando o Projeto

Modo desenvolvimento:

npm run dev

Modo produção:

npm start
📂 Estrutura do Projeto
Vetra-API
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
📊 Exemplo de Requisição

Criar um agendamento:

POST /agendamentos
{
  "usuario_id": 1,
  "espaco_id": 2,
  "data": "2026-03-10",
  "hora_inicio": "14:00",
  "hora_fim": "16:00",
  "tipo_pagamento": "PIX"
}
🔐 Segurança

A API utiliza:

autenticação via JWT

controle de permissões por middleware

separação de rotas entre CLIENTE e ADMIN

validação de dados antes da criação de reservas

🚀 Melhorias Futuras

integração com gateway de pagamento

sistema de cupons de desconto

dashboard com métricas

notificações via WhatsApp

documentação Swagger

👨‍💻 Autor

Kauã Henrique

💼 Desenvolvedor Backend

🌐 Portfólio
https://kauahenriquedev.com.br/

🐙 GitHub
https://github.com/Kauasx09-Henrique

📧 Email
kauahenriquesx09@gmail.com

<div align="center">

💡 Projeto desenvolvido para demonstrar arquitetura backend, APIs REST e implementação de regras de negócio reais.

</div> ```
