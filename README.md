# 📋 Kanban Pro - Sistema de Gerenciamento de Tarefas

Um sistema moderno de Kanban desenvolvido com uma estética premium, utilizando design glassmorphism e micro-animações para uma experiência de usuário excepcional. Este projeto oferece uma solução completa para organização de tarefas, categorias e autenticação de usuários.

![Demonstração do Projeto](frontend/src/assets/hero.png)

## ✨ Funcionalidades

- **Autenticação Segura**: Login e gerenciamento de perfil.
- **Quadro Kanban Dinâmico**: Visualização de tarefas por status.
- **Gestão de Categorias**: Organize suas tarefas por tags personalizadas.
- **Interface Responsiva**: Design que se adapta a diferentes tamanhos de tela.
- **Design Glassmorphism**: Estética moderna com transparências e efeitos de vidro.
- **Dashboard de Visão Geral**: Estatísticas rápidas sobre suas tarefas e produtividade.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19**: Biblioteca principal.
- **Vite**: Build tool extremamente rápida.
- **Tailwind CSS v4**: Estilização moderna e eficiente.
- **React Query (TanStack)**: Gerenciamento de estado assíncrono e cache.
- **Lucide React**: Conjunto de ícones premium.
- **React Router DOM**: Navegação fluida entre páginas.

### Backend
- **Node.js & Express**: Servidor e API RESTful.
- **SQLite3**: Banco de dados leve e eficiente.
- **JWT (JSON Web Token)**: Autenticação baseada em tokens.
- **Bcrypt.js**: Criptografia de senhas para segurança.

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (v18 ou superior recomendado).
- NPM ou Yarn.

### Instalação Rápida
Na raiz do projeto, execute:
```bash
npm run install:all
```

### Execução em Desenvolvimento
Para rodar tanto o frontend quanto o backend simultaneamente:
```bash
npm run dev
```
O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3000`.

## 📁 Estrutura do Projeto

```text
kanban/
├── frontend/           # Código fonte do cliente (React + Vite)
├── backend/            # API e lógica do servidor (Node.js + Express)
├── package.json        # Scripts globais e orquestração
└── .gitignore          # Arquivos ignorados pelo Git
```

## 📄 Licença

Este projeto está sob a licença ISC.

---
Desenvolvido com ❤️ por [DomVextor](https://github.com/DomVextor)
