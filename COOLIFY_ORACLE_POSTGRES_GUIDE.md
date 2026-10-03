# DIGIHOS Production Deployment Guide: Coolify + Oracle Cloud + PostgreSQL

This guide provides the complete, production-ready blueprint to deploy the **DIGIHOS Hospital Management System** on **Oracle Cloud Infrastructure (OCI)** using **Coolify** and **PostgreSQL**.

---

## 1. Architecture Overview

```
+--------------------------------------------------------------------------------+
| Oracle Cloud Infrastructure (OCI Compute Instance - Ubuntu 22.04 / 24.04)      |
|                                                                                |
|   +------------------------------------------------------------------------+   |
|   | Coolify Orchestrator (Traefik Reverse Proxy + Automatic SSL)           |   |
|   |   https://hospital.yourdomain.com  -->  Port 5000                      |   |
|   +------------------------------------------------------------------------+   |
|                         |                                                      |
|       +-----------------+-------------------+                                  |
|       |                                     |                                  |
|       v                                     v                                  |
|  +-----------------------------+   +---------------------------------------+   |
|  | DIGIHOS Docker Container    |   | PostgreSQL 16 Enterprise Database     |   |
|  | - Vite React 19 Frontend    |   | - Hospital Schema Tables              |   |
|  | - Express REST API (18 pts) |<->| - JSONB Longitudinal Records          |   |
|  | - Socket.io WebSocket Bus   |   | - Auto-seeded Seed Records            |   |
|  | - Baileys WhatsApp Gateway  |   |   (digihos_hospital db)               |   |
|  +-----------------------------+   +---------------------------------------+   |
+--------------------------------------------------------------------------------+
```

---

## 2. Oracle Cloud Infrastructure (OCI) Prerequisites

### Step 2.1: Open OCI VCN Ingress Security List
Oracle Cloud instances block all inbound traffic except port 22 by default. You must open ports **80** and **443** in your OCI Virtual Cloud Network (VCN):

1. Log into your **Oracle Cloud Console**.
2. Navigate to **Networking** > **Virtual Cloud Networks**.
3. Select your VCN > Click on **Security Lists** > **Default Security List for...**.
4. Click **Add Ingress Rules**:
   * **Source CIDR**: `0.0.0.0/0`
   * **IP Protocol**: `TCP`
   * **Destination Port Range**: `80,443,8000` (8000 is default Coolify Dashboard port)
   * **Description**: `Allow HTTP, HTTPS, and Coolify Web UI`
5. Click **Add Ingress Rules**.

### Step 2.2: Open Host Firewall on the Oracle VM
SSH into your Oracle VM:
```bash
ssh -i /path/to/ssh-key ubuntu@<YOUR_ORACLE_PUBLIC_IP>
```

Oracle Cloud Ubuntu images include strict `iptables` rules. Run the following commands to allow traffic through the host firewall:
```bash
# Allow HTTP, HTTPS, and Coolify port
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT

# Save iptables rules permanently
sudo netfilter-persistent save
# (If netfilter-persistent is not installed: sudo apt install -y iptables-persistent)
```

---

## 3. Install Coolify on Oracle VM

Run the official Coolify installation script on your Oracle VM:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Once installation finishes:
1. Open your browser and navigate to: `http://<YOUR_ORACLE_PUBLIC_IP>:8000`
2. Create your admin root account.
3. Configure your initial server (Localhost / Docker Engine is selected automatically).

---

## 4. Deploying DIGIHOS via Coolify

There are **two 100% production-ready deployment options** in Coolify:

---

### Option A: 1-Click Deployment with Docker Compose (Recommended)
This method automatically provisions the DIGIHOS Application and the PostgreSQL database in an isolated Docker network.

1. In Coolify, click **Projects** > **New Project** > **+ New Resource**.
2. Select **Docker Compose**.
3. Paste the contents of [`docker-compose.yml`](file:///d:/Office/hospital/docker-compose.yml):
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: digihos_hospital_app
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=postgres://${POSTGRES_USER:-digihos_admin}:${POSTGRES_PASSWORD:-digihos_secure_password_2026}@postgres_db:5432/${POSTGRES_DB:-digihos_hospital}
    depends_on:
      postgres_db:
        condition: service_healthy
    volumes:
      - app_storage:/app/server/data

  postgres_db:
    image: postgres:16-alpine
    container_name: digihos_postgres_db
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-digihos_admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-digihos_secure_password_2026}
      POSTGRES_DB: ${POSTGRES_DB:-digihos_hospital}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-digihos_admin} -d ${POSTGRES_DB:-digihos_hospital}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  app_storage:
```
4. Under **Domains**, specify your hospital domain (e.g., `https://hospital.yourdomain.com`).
   * Coolify and Traefik will automatically provision a free **Let's Encrypt SSL certificate**!
5. Click **Deploy**.

---

### Option B: Git Application + Coolify Managed PostgreSQL

1. **Step 1: Create PostgreSQL Database**:
   * In Coolify, click **+ New Resource** > **Databases** > **PostgreSQL**.
   * Name: `digihos-postgres`.
   * Click **Deploy**.
   * Under **Configuration**, copy the internal connection URL:
     `postgres://postgres:password@<container_id>:5432/postgres`

2. **Step 2: Create Web Application**:
   * Click **+ New Resource** > **Public / Private Git Repository**.
   * Enter your GitHub / GitLab repository URL.
   * Build Pack: Select **Dockerfile**.
   * Port: Set to `5000`.
   * Under **Environment Variables**, add:
     ```env
     NODE_ENV=production
     PORT=5000
     DATABASE_URL=postgres://postgres:password@<postgres_container_name>:5432/postgres
     ```
   * Set your custom domain: `https://hospital.yourdomain.com`.
   * Click **Deploy**.

---

## 5. PostgreSQL Schema & Verification

* On initial startup, the backend checks for `DATABASE_URL`.
* The server connects via connection pool ([server/postgres.js](file:///d:/Office/hospital/server/postgres.js)) and executes:
  ```sql
  CREATE TABLE IF NOT EXISTS hospital_store (
    key VARCHAR(64) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```
* If tables are empty, all baseline hospital models (`patients`, `tokens`, `pharmacyStock`, `labOrders`, `prescriptions`, `bills`, `employees`, `attendance`, `whatsappLogs`, `historicalVisits`) are automatically seeded into PostgreSQL.
* Every operation in the hospital portals is written to PostgreSQL in real-time, and cached in-memory for sub-millisecond Socket.io broadcast.

---

## 6. Verifying Production Deployment

Once deployed, verify the endpoints:
1. **Health Check**:
   ```bash
   curl -s https://hospital.yourdomain.com/api/health
   # Expected response: {"status":"online","timestamp":"...","connectedSockets":1}
   ```
2. **PostgreSQL Sync Verification**:
   ```bash
   curl -s https://hospital.yourdomain.com/api/state
   # Returns complete state from PostgreSQL
   ```
3. **WhatsApp Baileys Status**:
   ```bash
   curl -s https://hospital.yourdomain.com/api/whatsapp/status
   # Returns connection status and active templates
   ```
4. **Token TV & Doctor Audio Announcements**:
   * Open the app in two tabs.
   * Doctor clicking **"Call on TV"** triggers live audio announcement across the internet over secure WebSockets (`wss://`).

---

## 7. Zero Downtime & Auto Updates

Coolify automatically supports Git webhook deployments:
* Whenever you `git push` to your repository branch (`main`), Coolify triggers a zero-downtime rolling container rebuild.
* PostgreSQL data is preserved continuously in the Docker named volume `postgres_data`.
