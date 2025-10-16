# Containerization Documentation

## Docker Files Structure

### docker-compose.yml

**Operations performed:**
- **Constants definition**: Uses x-constants to centralize connection configurations (host, ports, database credentials)
- **Services orchestration**: Configures three interconnected services:
  - **Frontend**: Uses the pre-built image `smpolito/geocontrolui:latest`
  - **Backend**: Builds the image from the local Dockerfile
  - **Database**: Uses the official MySQL 8.0 image

**Database configurations:**
The database variables are defined in the constants and reused in the services:
```yaml
database_name: geocontrol_db
database_username: geocontrol_user
database_password: secret
database_port: 3306
```

**Exposed ports:**
- Frontend: 5173 (mapped on host)
- Backend: 5000 (host port) → 5000 (container port)
- Database: 5002 (host port) → 3306 (container port)

### backend/Dockerfile
Configures the execution environment for the Node.js backend.

**Operations performed:**
1. **Base image**: Uses `node:latest` as starting image
2. **Environment setup**: Sets `/app` as working directory
3. **Code copy**: Transfers all source code into the container
4. **Dependencies installation**: Executes `npm install` to install Node.js modules
5. **Script configuration**: Converts line endings of entrypoint.sh file from Windows to Unix and makes it executable
6. **Port exposure**: Exposes port 5000 for communication
7. **Application startup**: Executes the entrypoint.sh script through bash

### db/init.sql
This file is not used in the Docker configuration. The database is created with the same variables, but written directly in the docker-compose.yml:
- `MYSQL_DATABASE`: geocontrol_db
- `MYSQL_USER`: geocontrol_user
- `MYSQL_PASSWORD`: secret
- `MYSQL_ROOT_PASSWORD`: secret

## Support Scripts

### scripts/entrypoint.sh
Backend initialization script executed at container startup.

**Operations performed:**
1. **Initialization check**: Verifies if the container has already been initialized through the `.initialized` flag file
2. **First execution**: If it's the first time:
   - Executes `npm run create-root` to create the root user
   - Creates an .initialized flag file to avoid re-initializations
3. **Application startup**: Executes `npm start` to start the backend server

## Services Dependencies
```
Database (independent)
    ↓
Backend (depends_on: database)
    ↓
Frontend (depends_on: backend)
```

## Volumes and Persistence

- **db_data**: Docker volume for MySQL data persistence