# ComposerGuesser — Architecture

## Overview

ComposerGuesser is a daily classical music identification game. Users listen to an audio excerpt and guess the composer using a hint-based feedback system (similar to Wordle). The application is fully containerized and self-hosted.

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS            |
| Backend   | Spring Boot 4, Java 17, Spring Data JPA, Liquibase  |
| Database  | PostgreSQL                                          |
| Audio     | nginx static file server                            |
| Infra     | Docker Compose, named volumes                       |

---

## System Architecture

```
Browser
  │
  ├─── GET /api/**  ──────────────────► backend:8080 (Spring Boot)
  │                                          │
  │                                          ├── reads/writes ──► db:5432 (PostgreSQL)
  │                                          │                        │
  │                                          │                    [db-data volume]
  │                                          │
  │                                          └── (stores filenames, does NOT stream audio)
  │
  ├─── GET /audio/** ─────────────────► audio-server:80 (nginx)
  │                                          │
  │                                      [audio-files volume]
  │
  └─── GET /* ────────────────────────► frontend:80 (nginx serving React build)
```

### Why a separate audio container?

Browsers require **HTTP Range request** support to seek within audio tracks (`<audio>` element). nginx handles range requests natively and is highly efficient for serving large binary files. This offloads file I/O from the Spring Boot process entirely. The backend only stores the audio filename in the database and returns it as part of the API response — the frontend then fetches the audio directly from the audio container.

---

## Docker Compose Services

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/composerguesser
      - SPRING_DATASOURCE_USERNAME=...
      - SPRING_DATASOURCE_PASSWORD=...
    depends_on:
      - db

  db:
    image: postgres:17
    environment:
      POSTGRES_DB: composerguesser
      POSTGRES_USER: ...
      POSTGRES_PASSWORD: ...
    volumes:
      - db-data:/var/lib/postgresql/data

  audio-server:
    image: nginx:alpine
    volumes:
      - audio-files:/usr/share/nginx/html/audio:ro
    ports:
      - "8081:80"

volumes:
  db-data:
  audio-files:
```

The `audio-files` volume is populated manually by copying mp3 files into it on the host server. Filenames stored in the database must match the filenames in the volume exactly.

---

## Data Model

### `tbl_composer`
| Column                 | Type         | Notes                                |
|------------------------|--------------|--------------------------------------|
| composer_id            | BIGINT       | Primary key, auto-increment          |
| first_name             | VARCHAR(100) | Not null                             |
| last_name              | VARCHAR(100) | Not null                             |
| birth_year             | INT          | Not null                             |
| death_year             | INT          | Nullable                             |
| era                    | VARCHAR(50)  | e.g. Baroque, Classical, Romantic    |
| nationality            | VARCHAR(100) |                                      |
| number_of_compositions | INT          | Nullable                             |

---

## API Design

All routes are prefixed with `/api` (configured in `application.properties`).

| Method | Route                  | Description                                            |
|--------|------------------------|--------------------------------------------------------|
| GET    | `/api/health`          | Health check                                           |
| GET    | `/api/composers`       | List all composers — returns `composer_id` and `name` only |
| GET    | `/api/composers/{id}`  | Get full details for a single composer                 |

### `/api/composers` response shape
```json
[
  { "composerId": 1, "name": "Ludwig van Beethoven" },
  { "composerId": 2, "name": "Johann Sebastian Bach" }
]
```

Used to populate the frontend composer search. The frontend sends back only the `composerId` with a guess — the backend resolves everything else.

### Audio URL Strategy

When audio endpoints are added, the backend will return a URL pointing at the nginx audio container rather than streaming the bytes itself. nginx handles HTTP Range requests natively, which is required for the browser `<audio>` element to support seeking.

In production both the audio server and backend sit behind a reverse proxy (e.g. Caddy), exposing clean URLs rather than bare ports.

---

## Frontend Changes Required

- `ComposerSearch.tsx` populates from `GET /api/composers` instead of hardcoded data.
- Remove hardcoded composers from `gameData.ts` once the API is wired up.
- Guess submission will move server-side — frontend sends `composerId`, backend evaluates and returns hint feedback.

---

## Development Workflow

In development you run the frontend and backend locally (with hot reload) and only spin up the infrastructure containers.

### docker-compose.override.yml

Docker Compose automatically merges `docker-compose.override.yml` on top of `docker-compose.yml` when you run `docker compose` without `-f` flags. Use this to disable the app containers and swap the named audio volume for a bind mount:

```yaml
# docker-compose.override.yml — automatically applied in dev, not used in prod
services:
  frontend:
    profiles: ["prod"]   # excludes this service from default dev startup

  backend:
    profiles: ["prod"]   # excludes this service from default dev startup

  db:
    ports:
      - "5432:5432"      # expose to localhost so the local backend can reach it

  audio-server:
    ports:
      - "8081:80"
    volumes:
      - ./audio-files:/usr/share/nginx/html/audio:ro   # bind mount instead of named volume
```

Then in dev:
```bash
# start only db + audio-server
docker compose up -d

# drop mp3s into ./audio-files/ — they're immediately served at http://localhost:8081/audio/<filename>
```

In prod (CI or server), use `docker compose --profile prod up -d` to start all four services with the named volume.

### Local backend config

The backend needs to connect to `localhost:5432` instead of `db:5432` (the Docker hostname only resolves inside the Docker network). Use a dev application properties file that Spring Boot picks up automatically:

`backend/src/main/resources/application-dev.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/composerguesser
spring.datasource.username=...
spring.datasource.password=...
```

Run the backend with the `dev` profile active:
```bash
./mvnw
```

The frontend dev server (Vite) runs as normal on `localhost:5173`:
```bash
cd frontend && npm run dev
```

---

## File Layout (target state)

```
ComposerGuesser/
├── frontend/           # React app + Dockerfile
├── backend/            # Spring Boot app + Dockerfile
├── docker-compose.yml
├── nginx/              # nginx config for audio-server
│   └── default.conf
└── db/
    └── changelogs/     # Liquibase migration files
```
