FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Recibe y propaga la variable correctamente
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> .env.local
# Compila Next.js con la variable ya disponible
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
