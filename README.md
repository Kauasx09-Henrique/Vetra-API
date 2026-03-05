<div align="center">

<img src="https://media.giphy.com/media/f3iwJFOVOwuy7K6FFw/giphy.gif" width="800">

# 📸 Vetra Studio API

### Sistema inteligente de gestão de reservas para estúdios fotográficos

API REST desenvolvida para gerenciar **locação de cenários fotográficos**, automatizando agenda, pagamentos e precificação.

</div>

---

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge)

![Multer](https://img.shields.io/badge/File%20Upload-Multer-orange?style=for-the-badge)

![Nodemailer](https://img.shields.io/badge/Email-Nodemailer-blue?style=for-the-badge)

</div>

---

# 📖 Sobre o Projeto

O **Vetra Studio API** é um backend desenvolvido para gerenciar reservas de cenários fotográficos de forma segura e automatizada.

O sistema foi projetado para resolver desafios reais do dia a dia de estúdios fotográficos:

- evitar **conflitos de horários**
- automatizar **precificação**
- gerenciar **pagamentos**
- permitir **bloqueios administrativos**
- melhorar a **comunicação com clientes**

A API implementa regras de negócio inteligentes para tornar o gerenciamento de reservas mais eficiente.

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

# 🚀 Funcionalidades

## 👤 Gestão de Usuários

- cadastro de usuários
- login com autenticação **JWT**
- níveis de acesso (**CLIENTE / ADMIN**)
- bloqueio de usuários
- upload de foto de perfil

---

## 📅 Sistema de Agendamentos

Motor responsável por controlar reservas e evitar conflitos.

Funcionalidades:

- criação de reservas
- validação automática de disponibilidade
- prevenção de **overbooking**
- listagem de reservas por data
- ordenação por proximidade

---

## 💰 Precificação Dinâmica

O valor da locação é calculado automaticamente com base em:

- tempo de permanência
- dia da semana
- finais de semana
- feriados

Isso garante mais automação e menos erros manuais.

---

## 💳 Gestão de Pagamentos

Suporte para:

- PIX
- crédito
- débito

Regras automáticas:

- acréscimo de **15% para pagamentos no crédito**
- registro de comprovantes de pagamento

---

## 🔒 Bloqueio Administrativo

Administradores podem bloquear horários ou cenários para:

- manutenção
- limpeza
- ensaios externos
- eventos internos

Status utilizado no sistema:

```sql
BLOQUEADO
```

Esse status impede novos agendamentos naquele horário.

---

## 🔔 Sistema de Notificações

O sistema envia notificações sempre que ocorre alteração no status da reserva.

Eventos monitorados:

- confirmação
- cancelamento
- alteração de status

Notificações incluem:

- envio de **e-mails automáticos**
- alertas no painel administrativo

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

# 🧠 Regras de Negócio

A API implementa diversas regras para garantir a integridade das reservas:

- validação de conflitos de horário em tempo real
- cálculo automático de valores
- diferenciação de tarifas por dia da semana
- controle de cancelamento
- reagendamento permitido com **antecedência mínima de 3 dias para pagamentos via PIX**

---

# 🔗 Endpoints

| Endpoint | Descrição |
|--------|--------|
| `/auth` | Login e registro de usuários |
| `/usuarios` | Gestão de perfis |
| `/espacos` | Cadastro de cenários |
| `/agendamentos` | Criação e gestão de reservas |

---

# 📦 Instalação

Clone o repositório:

```bash
git clone https://github.com/Kauasx09-Henrique/Vetra-API.git
```

Entre na pasta do projeto:

```bash
cd Vetra-API
```

Instale as dependências:

```bash
npm install
```

---

# 🗄 Configuração do Banco de Dados

Certifique-se de ter o **PostgreSQL instalado e rodando**.

Crie os tipos ENUM necessários:

```sql
CREATE TYPE status_agendamento AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'BLOQUEADO');

CREATE TYPE tipo_pagamento AS ENUM ('PIX', 'CREDITO', 'DEBITO');

CREATE TYPE tipo_usuario AS ENUM ('CLIENTE', 'ADMIN');
```

---

# ▶️ Executando o Projeto

Modo desenvolvimento:

```bash
npm run dev
```

Modo produção:

```bash
npm start
```

---

# 📂 Estrutura do Projeto

```
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
```

---

# 📊 Exemplo de Requisição

Criar um agendamento:

```http
POST /agendamentos
```

```json
{
  "usuario_id": 1,
  "espaco_id": 2,
  "data": "2026-03-10",
  "hora_inicio": "14:00",
  "hora_fim": "16:00",
  "tipo_pagamento": "PIX"
}
```

---

# 🔐 Segurança

A API utiliza:

- autenticação via **JWT**
- controle de permissões por middleware
- separação de rotas entre **CLIENTE** e **ADMIN**
- validação de dados antes da criação de reservas

---

# 🚀 Melhorias Futuras

- integração com gateway de pagamento
- sistema de cupons de desconto
- dashboard com métricas
- notificações via WhatsApp
- documentação Swagger

---

# 👨‍💻 Autor

**Kauã Henrique**

💼 Desenvolvedor Backend  

🌐 Portfólio  
https://kauahenriquedev.com.br/

🐙 GitHub  
https://github.com/Kauasx09-Henrique

📧 Email  
kauahenriquesx09@gmail.com

---

<div align="center">

💡 Projeto desenvolvido para demonstrar **arquitetura backend, APIs REST e implementação de regras de negócio reais.**

</div>
