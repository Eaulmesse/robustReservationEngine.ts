# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Installer OpenSSL et autres dépendances système requises par Prisma
RUN apk add --no-cache openssl libc6-compat

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler l'application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Installer OpenSSL et autres dépendances système requises par Prisma
RUN apk add --no-cache openssl libc6-compat

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier le build depuis le stage précédent
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Exposer les ports
EXPOSE 3000
EXPOSE 5555

# Démarrer l'application
CMD ["node", "dist/main"]
