# Etapa 1: build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: producción
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app ./

# Instalar dependencias solo para producción
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
