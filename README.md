# 📦 Microservices Tracing & Observability with OpenTelemetry & Jaeger

### **Team 16 – UIT**

📄 **Full Report & Demo Videos:**
👉 [https://drive.google.com/drive/folders/1t0vEr8jYtBt6YH4LpGW9O3z4TqTap60N?usp=sharing](https://drive.google.com/drive/folders/1t0vEr8jYtBt6YH4LpGW9O3z4TqTap60N?usp=sharing)

---

## 🚀 Overview

This project builds an end-to-end **observability system** for a microservices-based e-commerce platform using:

* **OpenTelemetry** → Collect trace data
* **Jaeger** → Visualize distributed traces
* **Locust** → Load testing
* **Toxiproxy** → Fault injection

System deployed via **Docker Compose**, including services:

* customer-service
* products-service
* shopping-service
* gateway (Nginx)
* MongoDB, RabbitMQ
* OpenTelemetry Collector
* Jaeger UI

---

## 📁 Repository Structure

```
├── customer-service/
├── products-service/
├── shopping-service/
├── proxy/
├── otel-collector-config.yaml
└── docker-compose.yml
```

---

## 🏗️ System Architecture

```
Client → Nginx Gateway → Microservices → MongoDB + RabbitMQ
              ↓
       OpenTelemetry SDK
              ↓
     OpenTelemetry Collector
              ↓
             Jaeger UI
```

---

# 🧪 Test Scenarios

Below are the **4 test scenarios** implemented in the project.

### **1️⃣ Load Testing (Locust)**

Simulates real users performing actions:

* Signup/Login
* Browse product list and categories
* View product details
* Add/remove items
* Create orders

**Goal:** Measure throughput (RPS), latency (p50/p95), failures, and analyze Jaeger traces under normal load.

---

### **2️⃣ Database Bottleneck Simulation (Toxiproxy)**

Injected latency into MongoDB:

```
500ms + 100ms jitter
```

**Goal:** Visualize DB slowdown in Jaeger, find bottlenecks, evaluate microservice dependencies.

---

### **3️⃣ Spike Testing**

Increase users abruptly:

```
0 → 1000 users
```

**Goal:** Evaluate system behavior under sudden high load.

---

### **4️⃣ Partial Service Failure**

Stop one service during runtime:

```
docker compose stop products-service
```

**Goal:** Check system resilience, failure propagation, and trace consistency.

---

# 📊 Expected Jaeger Results

When system is **not overloaded**:

* Low latency (<50–80ms)
* Stable throughput
* Smooth end-to-end traces
* No abnormal bottlenecks

---

# 🛠️ Technology Stack

| Component      | Purpose                       |
| -------------- | ----------------------------- |
| Node.js        | Backend services              |
| MongoDB        | Database                      |
| RabbitMQ       | Event bus                     |
| Nginx          | API gateway                   |
| OpenTelemetry  | Trace collection              |
| OTEL Collector | Trace processing & exporting  |
| Jaeger         | Distributed tracing dashboard |
| Locust         | Load testing                  |
| Toxiproxy      | Fault injection               |

---

# ▶️ How to Run

### **1. Start system**

```
docker compose up --build
```

### **2. Access Jaeger**

```
http://localhost:16686
```

### **3. Run Locust**

```
locust -f locustfile.py
```

### **4. Inject DB latency**

```
Invoke-WebRequest -Uri "http://localhost:8474/proxies/mongodb_proxy/toxics" -Method POST ...
```

---

# 📌 Documentation & Demos

📄 **Report + Video:**
[https://drive.google.com/drive/folders/1t0vEr8jYtBt6YH4LpGW9O3z4TqTap60N?usp=sharing](https://drive.google.com/drive/folders/1t0vEr8jYtBt6YH4LpGW9O3z4TqTap60N?usp=sharing)
