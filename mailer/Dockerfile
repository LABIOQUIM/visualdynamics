FROM node:18-alpine as base

# Defina o diretório de trabalho no container
WORKDIR /app

# Copie o package.json para o container
COPY package.json ./

# Instale o PNPM
RUN npm install -g pnpm

# Instale as dependencia do projeto
RUN pnpm i --ignore-scripts

# Copie todo o código-fonte para o container
COPY . .

# Execute o comando para compilar o código TypeScript (substitua 'build' pelo seu comando específico)
RUN pnpm build
