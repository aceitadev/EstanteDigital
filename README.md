# 📚 Estante Digital

**Estante Digital** é um sistema de gerenciamento de biblioteca escolar desenvolvido com **Electron** por [Murilo]. Ele permite o cadastro e a listagem de estudantes, livros e empréstimos, com uma interface simples e intuitiva para facilitar a organização em ambientes educacionais.

## 🛠 Funcionalidades

- ✅ Cadastro e listagem de **estudantes**
- 📘 Cadastro e listagem de **livros**
- 🔄 Registro e visualização de **empréstimos**
- 🖼 Interface amigável com ícones e navegação simples
- 💾 Armazenamento local (SQLite)

## 📦 Estrutura do Projeto

├── assets/              # Ícones e imagens da interface
│   └── icons/           # Ícones do sistema (livro, lixeira, caneta etc.)
├── pages/               # Páginas HTML da aplicação
│   ├── home/            # Página principal
│   ├── books/           # Listagem de livros
│   ├── books-add/       # Cadastro de livros
│   ├── students/        # Listagem de estudantes
│   ├── students-add/    # Cadastro de estudantes
│   ├── loans/           # Listagem de empréstimos
│   ├── loans-add/       # Registro de empréstimos
│   └── styles/          # Estilos da interface
├── main.js              # Processo principal do Electron
├── preload.js           # Comunicação entre frontend e backend
├── package.json         # Informações do projeto e dependências
├── package-lock.json    # Travamento de versões
└── .gitignore           # Arquivos ignorados pelo Git

## ▶️ Como Executar

1. **Instale as dependências:**

```bash
npm install
````

2. **Inicie a aplicação:**

```bash
npm start
```

> ⚠️ Certifique-se de ter o **Node.js** (versão 14 ou superior) instalado em sua máquina.

## 👨‍💻 Autor

Desenvolvido por **Murilo**.
