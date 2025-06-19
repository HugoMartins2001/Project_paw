# 🧩 Projeto PAW - Aplicação Web de Gestão de Restaurantes 🍽️

Este repositório contém o projeto desenvolvido no âmbito da unidade curricular de **Programação de Aplicações Web (PAW)**. A aplicação tem como objetivo permitir a gestão de restaurantes, menus e respetivos pratos, proporcionando uma experiência simples e funcional tanto para os administradores como para os utilizadores finais.

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: Angular
- **Backend**: Node.js com Express
- **Base de Dados**: MongoDB
- **Comunicação**: API RESTful
- **Autenticação**: JWT (JSON Web Tokens)
- **Outras ferramentas**: Bootstrap, Postman, Mongoose

---

## ⚙️ Funcionalidades Implementadas

- Registo e login de utilizadores com autenticação segura
- CRUD completo de restaurantes
- CRUD de menus e pratos associados a cada restaurante
- Validação de formulários com feedback dinâmico
- Listagens com paginação e filtros
- Separação clara entre área pública e área de administração
- Layout responsivo adaptado para desktop e mobile

---

## 🛠️ Estrutura do Projeto

/projeto-paw/
│
├── backend/ # Servidor Node.js + Express
│ ├── controllers/ # Lógica dos endpoints (ex: restauranteController.js)
│ ├── models/ # Esquemas Mongoose (ex: Restaurante.js, Menu.js)
│ ├── routes/ # Definições das rotas da API (ex: restauranteRoutes.js)
│ ├── middleware/ # Middlewares como autenticação JWT
│ ├── config/ # Configuração da base de dados e variáveis de ambiente
│ ├── server.js # Ponto de entrada da aplicação
│ └── .env # Ficheiro de variáveis ambiente (não incluído no Git)
│
├── frontend/ # Aplicação Angular
│ ├── src/
│ │ ├── app/
│ │ │ ├── components/ # Componentes reutilizáveis (botões, tabelas, etc.)
│ │ │ ├── pages/ # Páginas principais (login, dashboard, listagens)
│ │ │ ├── services/ # Serviços Angular para comunicação com a API
│ │ │ ├── models/ # Interfaces e tipos de dados
│ │ │ ├── guards/ # Proteção de rotas (auth guard, admin guard)
│ │ │ ├── app-routing.module.ts
│ │ │ └── app.module.ts
│ │ ├── assets/ # Ficheiros estáticos (imagens, CSS global)
│ │ └── index.html
│ └── angular.json # Configurações do projeto Angular
│
├── README.md
├── package.json # Dependências do Node.js (backend)
└── .gitignore
