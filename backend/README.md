# ComposerGuesser Backend

Spring Boot REST API for the ComposerGuesser app.

## Running the app

From the `backend/` directory:

```bash
./mvnw
```

The app runs on `http://localhost:8080` by default.

## Health check

```bash
curl http://localhost:8080/api/health
# {"status":"UP"}
```

## Hot reloading with DevTools

`spring-boot-devtools` is included as a dependency. It watches the classpath for changes and automatically restarts the app when recompiled — much faster than a full restart since only your code is reloaded.

**Workflow (two terminals):**

- Terminal 1: `./mvnw` — keeps the app running
- Terminal 2: `./mvnw compile` — run this after making changes to trigger a restart

**IntelliJ auto-compile:**

To avoid running `./mvnw compile` manually, enable auto-build in IntelliJ:

> Settings → Build, Execution, Deployment → Compiler → "Build project automatically"

IntelliJ will recompile on save and DevTools will pick up the changes automatically.
