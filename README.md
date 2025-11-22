# 📦 Microservices Tracing & Observability with OpenTelemetry & Jaeger

**Team 16 – UIT**

## 📄 Full Report & Demo Videos

https://drive.google.com/drive/folders/1t0vEr8jYtBt6YH4LpGW9O3z4TqTap60N?usp=sharing

---

## 🚀 Project Overview

This project implements an end-to-end observability system for a microservices-based e‑commerce application. We use:

- **OpenTelemetry** – collect and export distributed traces
- **OpenTelemetry Collector** – receive, process and forward telemetry data
- **Jaeger** – visualize traces and analyze bottlenecks
- **Locust** – generate traffic and run load tests
- **Toxiproxy** – inject network faults and latency

The demo system is deployed with Docker Compose and includes:

- customer-service
- products-service
- shopping-service
- gateway (Nginx reverse proxy)
- nosql-db (MongoDB)
- rabbitmq
- otel-collector
- jaeger

---

## 📁 Repository Structure
```
├── customer-service/
├── products-service/
├── shopping-service/
├── gateway/
├── proxy/
├── otel-collector-config.yaml
└── docker-compose.yml
```

---

## 🔍 Core Services

- **customer-service** – user registration, login, profile, and customer data
- **products-service** – product catalog, categories, wishlist and cart APIs
- **shopping-service** – shopping cart, orders, and integration with RabbitMQ events

All three services are instrumented with OpenTelemetry SDK for Node.js. Each service sends traces to the OTLP HTTP endpoint of the OTel Collector (`http://otel-collector:4318/v1/traces`), which then forwards them to Jaeger over OTLP/gRPC.

---

## 🧪 Test Scenarios

The project evaluates the system using four main scenarios, aligned with the approved thesis proposal.

### 1️⃣ Load Test – Increasing Traffic with Locust

We generate a high number of concurrent requests to the system using Locust in order to:

- Measure requests per second (RPS)
- Observe latency for each service
- Track error rate under load

This scenario represents the normal case where all services are healthy and the database responds normally.

---

### 2️⃣ Database Bottleneck – Slow MongoDB Responses

We use Toxiproxy to inject artificial latency into MongoDB. A proxy named `mongodb_proxy` listens on a local port and forwards traffic to `nosql-db:27017` while adding delay:
```powershell
# Create MongoDB proxy
Invoke-WebRequest -Uri "http://localhost:8474/proxies" `
  -Method POST `
  -Headers @{ "User-Agent" = "curl" } `
  -ContentType "application/json" `
  -Body '{"name":"mongodb_proxy","listen":"0.0.0.0:8666","upstream":"nosql-db:27017"}'

# Inject latency fault
Invoke-WebRequest -Uri "http://localhost:8474/proxies/mongodb_proxy/toxics" `
  -Method POST `
  -Headers @{ "User-Agent"="curl" } `
  -ContentType "application/json" `
  -Body '{"name":"mongo_delay","type":"latency","attributes":{"latency":500,"jitter":100}}'

# Remove the fault
Invoke-WebRequest -Uri "http://localhost:8474/proxies/mongodb_proxy/toxics/mongo_delay" `
  -Method DELETE `
  -Headers @{ "User-Agent" = "curl" }
```

In Jaeger, the MongoDB-related spans become significantly longer, clearly indicating that the database layer is the bottleneck.

---

### 3️⃣ Application Error – HTTP 500

In this scenario, we intentionally trigger an HTTP 500 error from one of the services (for example, by throwing an exception inside a handler).

In Jaeger we can see:

- The root span marked with error
- The failing operation highlighted
- How the error propagates through other spans in the same trace

This helps demonstrate how distributed tracing can be used to pinpoint the exact failing component and understand the impact of an application bug.

---

### 4️⃣ Service Downtime – Stopping a Container

We simulate a partial system outage by stopping one microservice while requests are still being sent, for example:
```bash
docker compose stop shopping-service
```

The results seen in Jaeger:

- Traces show failed calls to the missing service
- Spans that call this service contain connection errors or timeouts
- We can observe how a single failing dependency affects the end-to-end request flow

This scenario highlights how tracing helps debug incidents and dependency failures in a microservices architecture.

---

## 📊 Locust User Flow

The load test is implemented in `locustfile.py`. Each virtual user performs a realistic e‑commerce flow:

1. **Authenticate** – sign up (optional) and log in to obtain a JWT token
2. **Browse products** – list products, filter by category, view product details
3. **Wishlist actions** – view wishlist, add an item to wishlist
4. **Cart actions** – add item to cart, remove item from cart
5. **Shopping APIs** – view current cart, view order history, create an order

All requests go through the Nginx gateway (`http://localhost:8080`) so that distributed traces represent a full end‑to‑end path from gateway → services → MongoDB.

---

## 🛠️ Technology Stack

| Layer | Tools / Technologies |
|-------|---------------------|
| **Backend** | Node.js, Express, Mongoose |
| **Data** | MongoDB |
| **Messaging** | RabbitMQ |
| **Gateway** | Nginx (reverse proxy) |
| **Observability** | OpenTelemetry SDK, OpenTelemetry Collector, Jaeger |
| **Load Testing** | Locust |
| **Fault Injection** | Toxiproxy |
| **Deployment** | Docker, Docker Compose |

---

## ▶️ How to Run

### 1. Start the stack
```bash
docker compose up --build
```

### 2. Access main components

- **Application (via gateway)**: http://localhost:8080
- **Jaeger UI**: http://localhost:16686

### 3. Run Locust
```bash
locust -f locustfile.py
```

Open the Locust web UI (usually http://localhost:8089), configure number of users and spawn rate, and start the test.
