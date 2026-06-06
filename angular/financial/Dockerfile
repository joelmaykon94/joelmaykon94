# Estágio 1: Compilação da aplicação
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Estágio 2: Servindo a aplicação com Nginx
FROM nginx:alpine
COPY --from=build /app/dist/financial /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]