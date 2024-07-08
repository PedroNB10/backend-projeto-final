# Sistema de Gerenciamento de Filmes e Avaliações

Este projeto consiste em uma aplicação web desenvolvida em Node.js e Express para gerenciar filmes favoritos de usuários, permitindo também a criação e gestão de avaliações para esses filmes. Utiliza JSON Web Tokens (JWT) para autenticação segura e Dotenv para gerenciar variáveis sensíveis.

### Funcionalidades
- **Autenticação de Usuários:**
  - Criar usuário
  - Login de usuário
  - Atualizar senha e e-mail do usuário

- **Gerenciamento de Filmes:**
  - Adicionar filmes aos favoritos
  - Remover filmes dos favoritos
  - Listar filmes da API externa por página
  - Buscar filmes da API externa por termo de busca e página

- **Gerenciamento de Avaliações (Reviews):**
  - Criar review
  - Atualizar review
  - Deletar review

- **Segurança e Autenticação:**
  - Gerar token de acesso (JWT)
  - Gerar token de atualização (JWT refresh token)

### Rodar o Projeto
```bash
# Clone este repositório
$ git clone https://github.com/PedroNB10/backend-projeto-final.git
 
# Acesse a pasta do projeto no terminal/cmd
$ cd backend-projeto-final

# Instale as dependências
$ npm install

# Execute a aplicação em modo de desenvolvimento
$ npm run dev

# O servidor inciará na porta:8080 - acesse <http://localhost:8080>
```

### Acessar a documentação da API
```bash
# Acesse a documentação da API
$ http://localhost:8080/api-docs
```

