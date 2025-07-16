# Etapa 1: build
FROM node:18-alpine AS builder
WORKDIR /app

# Copiamos package.json y el archivo de entorno antes de instalar dependencias
COPY package*.json ./
COPY .env.local .env.local

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Build de producción con variables de entorno
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine
WORKDIR /app

# Copiamos todo desde el builder
COPY --from=builder /app ./

# Instalamos solo dependencias de producción
RUN npm install --omit=dev

EXPOSE 3000

# Comando de arranque
CMD ["npm", "start"]
