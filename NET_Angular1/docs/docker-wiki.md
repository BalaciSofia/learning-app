# Docker Wiki: Build and Run Guide

This page documents the required order and structure for running the LearningApp stack with Docker.

## Required folder structure

The docker-compose.yml in AngularApp uses relative build contexts (../AuthApp and ../QuizModule). The three repositories must be sibling folders inside the same parent folder.

The parent folder can have any name. Example:

```text
<parent-folder>/
  AngularApp/
    docker-compose.yml
    Dockerfile
    certs/
    src/
    ...
  AuthApp/
    Dockerfile
    AuthenticationApp/
    ...
  QuizModule/
    Dockerfile
    Docker/
      SQL Server/
        docker-compose.yml
    ...
```

If AuthApp and QuizModule are not placed next to AngularApp under the same parent folder, `docker compose up --build` from AngularApp will fail because build contexts cannot be resolved.

## Overview

The Angular app container in this repository depends on sibling repositories/services:

- AuthApp (ASP.NET backend)
- QuizModule (ASP.NET backend)
- SQL Server (separate compose file under QuizModule)

Because of that, SQL Server must be started first, then the application stack.

## 1. Mandatory first step: start SQL Server

Before starting anything in AngularApp, run the SQL Server compose file from:

QuizModule/Docker/SQL Server

Use `<parent-folder>` as the folder that contains AngularApp, AuthApp, and QuizModule.

### PowerShell commands

```powershell
cd <parent-folder>\QuizModule\Docker\SQL Server
docker compose up -d
```

### Verify SQL Server is running

```powershell
docker ps --filter "name=sqlserver"
```

Expected:

- Container name: sqlserver
- Port mapping: 1433:1433

## 2. Go to AngularApp

```powershell
cd <parent-folder>\AngularApp
```

## 3. Build and start all app containers

From AngularApp root, build and run:

```powershell
docker compose up --build
```

This starts:

- auth-app-dev (port 5271)
- quiz-module-dev (port 7290)
- learning-app-dev (port 3000)

## 4. Access the application

Open:

- http://localhost:3000

## 4.1 Fix HTTPS certificate on a new Windows machine

The `quiz-module` service is exposed on `https://localhost:7290` using the bundled certificate in `AngularApp/certs/quizmodule.pfx`.
On a fresh machine, browsers do not trust it by default, which causes:

- `net::ERR_CERT_AUTHORITY_INVALID`

### Trust the certificate (Current User)

Run these commands from `AngularApp` root in PowerShell:

```powershell
$password = ConvertTo-SecureString "REMOVED" -AsPlainText -Force
Import-PfxCertificate -FilePath ".\certs\quizmodule.pfx" -Password $password -CertStoreLocation "Cert:\CurrentUser\Root"
```

Then restart the browser and verify:

- https://localhost:7290

If the certificate warning no longer appears there, Angular calls to `/api/quiz` and `/api/topic/user` should succeed.

### Optional: trust for all users (Admin PowerShell)

```powershell
$password = ConvertTo-SecureString "REMOVED" -AsPlainText -Force
Import-PfxCertificate -FilePath ".\certs\quizmodule.pfx" -Password $password -CertStoreLocation "Cert:\LocalMachine\Root"
```

## 5. Stop containers

Stop only the AngularApp stack:

```powershell
cd <parent-folder>\AngularApp
docker compose down
```

Stop SQL Server when needed:

```powershell
cd <parent-folder>\QuizModule\Docker\SQL Server
docker compose down
```

## 6. Full cleanup (optional)

Remove AngularApp stack containers, networks, and volumes:

```powershell
cd <parent-folder>\AngularApp
docker compose down -v
```

Remove SQL Server stack and persistent SQL volume:

```powershell
cd <parent-folder>\QuizModule\Docker\SQL Server
docker compose down -v
```

## Container and network notes

- AngularApp compose network: quiz-network
- Angular container reads APIs through internal service names:
  - API_AUTH_URL=http://auth-app:5271
  - API_QUIZ_URL=http://quiz-module:7290
- Backend services connect to SQL Server through host.docker.internal:1433 using the shared exam_app database.

## Quick start checklist

1. Start SQL Server first from QuizModule/Docker/SQL Server.
2. Start AngularApp stack from AngularApp root.
3. Open http://localhost:3000.
4. Confirm three app containers + sqlserver are healthy.
