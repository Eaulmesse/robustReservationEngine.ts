# Nimbus

Nimbus is a Calendly-like scheduling application built with NestJS and Next.js that enables users to publish their availability slots and automatically create Google Meet meetings for booked appointments.

## Architecture

- **Backend**: NestJS (Port 3001)
- **Frontend**: Next.js (Port 3000)
- **Database**: PostgreSQL (Port 5432)

## Getting Started

### Développement

Pour lancer l'application en mode développement avec hot reload :

```bash
docker-compose up
```

Les services disponibles :
- Frontend Next.js : http://localhost:3000
- Backend NestJS : http://localhost:3001
- PostgreSQL : localhost:5432
- Prisma Studio : http://localhost:5555

### Production

Pour lancer l'application en mode production :

```bash
docker-compose --profile production up
```

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
POSTGRES_PASSWORD=your_secure_password
```

Pour le backend, créez un fichier `.env` dans `robust-reservation-engine/` :

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/reservation_db?schema=public
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Structure du projet

```
Nimbus/
├── front/                      # Application Next.js
│   ├── app/                    # Pages et routes
│   ├── Dockerfile              # Build production
│   └── Dockerfile.dev          # Build développement
├── robust-reservation-engine/  # API NestJS
│   ├── src/                    # Code source
│   ├── prisma/                 # Schéma et migrations
│   ├── Dockerfile              # Build production
│   └── Dockerfile.dev          # Build développement
└── docker-compose.yml          # Orchestration Docker
```

## Commandes utiles

### Backend

```bash
# Migrations Prisma
docker-compose exec backend-dev npx prisma migrate dev

# Prisma Studio
docker-compose exec backend-dev npx prisma studio

# Seeds
docker-compose exec backend-dev npm run seed
```

### Logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f frontend-dev
docker-compose logs -f backend-dev
```

### Arrêter les services

```bash
docker-compose down

# Avec suppression des volumes
docker-compose down -v
```
