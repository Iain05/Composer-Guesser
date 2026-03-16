# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Spring Boot — run from `backend/`)
```bash
./mvnw                  # Run backend (default goal: spring-boot:run)
./mvnw test             # Run tests
./mvnw package          # Build JAR
```

### Frontend (run from `frontend/`)
```bash
npm run dev             # Start Vite dev server with HMR
npm run build           # Type-check + production build
npm run lint            # ESLint
```

### Infrastructure
```bash
docker compose up -d                        # Start db + audio-server (dev)
docker compose --profile prod up -d         # Start all four services (prod)
```

## Architecture

ComposerGuesser is a daily classical music guessing game (Wordle-style). Users listen to an audio excerpt and guess the composer using hint-based feedback.

### Services
- **frontend** — React 19 SPA (Vite), served by nginx in prod
- **backend** — Spring Boot 4, Java 17 (`backend/`)
- **db** — PostgreSQL 17 (always running via Docker)
- **audio-server** — nginx serving mp3 files from `./audio-files/`

In dev, only `db` and `audio-server` run in Docker. Frontend and backend run locally. The Vite dev server proxies `/api` → `http://localhost:8080` and `/audio` → `http://localhost:8081`. In prod, the frontend nginx handles both proxies.

### Backend package structure (`backend/src/main/java/org/composerguesser/backend/`)
- `controller/` — REST controllers (`/api` prefix set in `application.properties`)
- `service/` — Business logic (currently `GuessService`)
- `model/` — JPA entities (`Composer`, `Excerpt`, `ExcerptDay`, `Era` enum)
- `repository/` — Spring Data JPA repositories
- `dto/` — Request/response DTOs

**Config:** `application.properties` imports `backend/.env` via `spring.config.import`. The `.env` file holds datasource URL, credentials, and `audio.base-url`. The JVM timezone is forced to `America/Vancouver` via `pom.xml` `jvmArguments` — this is required because PostgreSQL 17 rejects the legacy `Canada/Pacific` system timezone.

**Database migrations:** Liquibase runs automatically on startup. Changelogs live in `backend/src/main/resources/db/changelog/changes/` and are registered in `master.xml`. Always add new changesets as new numbered files.

**Daily challenge date:** Resolved server-side using `America/Vancouver` timezone — never from the client.

### Frontend structure (`frontend/src/`)
- `api/` — All fetch calls (`composer.ts`, `excerpt.ts`, `guess.ts`). Add new endpoints here.
- `pages/DailyComposer/` — The only page. Fetches the daily challenge and composer list on mount, owns `excerptId` and `composers` state, passes them down.
- `hooks/useGameState.ts` — Manages `guesses: GuessResult[]` state. `submitGuess(composerId)` calls `POST /api/guess` and appends the result. `isGameOver` and `won` are derived from guesses.
- `components/` — `AudioPlayer`, `ComposerSearch`, `GuessControls`, `GuessGrid`, `HintCard`, `GameStatus`
- `data/gameData.ts` — Only `MAX_PLAYS` and `MAX_GUESSES` constants remain
- `types/game.ts` — Only `HintStatus = 'correct' | 'close' | 'wrong'`

**Path alias:** `@src/*` → `src/*`

**React Compiler** is enabled — avoid manual `useMemo`/`useCallback`.

### Guess flow
1. `GET /api/excerpt/daily-challenge` → `{ excerptId, audioUrl }`
2. `GET /api/composers` → `[{ composerId, name }]` (populates search dropdown)
3. User selects a composer → `ComposerSearch` calls `onSelect(ComposerSummary)` to give `GuessControls` the `composerId`
4. `POST /api/guess` with `{ excerptId, composerId }` → `GuessResult` with hint fields (`composerHint`, `yearHint`, `eraHint`, `nationalityHint`) and always includes `targetComposerName` + `pieceTitle` for the end screen

### Era enum
PostgreSQL `era_type`: `BAROQUE`, `CLASSICAL`, `EARLY_ROMANTIC`, `LATE_ROMANTIC`, `MODERN`. Java `Era` enum matches. Era adjacency (one step apart = "close") is computed by `ordinal()` comparison in `GuessService`.
