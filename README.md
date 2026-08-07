# HawkEye - Transaction Monitoring & Alert Management System

HawkEye is an enterprise-grade transaction monitoring and risk detection platform designed to identify suspicious financial activity, streamline alert investigations, and provide complete auditability for compliance teams.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture & Roles](#system-architecture--roles)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started & Installation](#getting-started--installation)
- [API & Core Workflows](#api--core-workflows)
- [Testing & Evaluation Guide](#testing--evaluation-guide)
- [Documentation Index](#documentation-index)

---

## 🔎 Overview

HawkEye continuously evaluates financial transactions against customizable rule engines (such as amount thresholds, velocity limits, daily caps, and new payee checks) to flag suspicious behaviors in real time. The platform provides a rich dashboard for metrics, complete alert lifecycle handling, and strict role-based access control.

### Core Objectives:
* **Real-time Monitoring:** Evaluate incoming transactions instantly.
* **Alert Lifecycle Management:** Track alerts from `OPEN` to `CLOSED` or `DISMISSED` with full context and auditability.
* **Flexible Rule Engine:** Dynamic configuration for fraud and risk prevention teams.
* **Role-Based Governance:** Tailored interfaces and permissions for Admin, Analyst, and Customer roles.

---

## ✨ Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
* **Admin:** Rule lifecycle management, full system configuration, user administration, operational dashboards, and health monitoring.
* **Analyst:** Alert investigation, transaction context review, status updates, and case histories.
* **Customer:** Personal account management, money transfers, and transaction history tracking.

### 💳 2. Transaction Processing & Risk Analysis
* Real-time transaction execution and history filtering (including custom calendar date ranges).
* Automated rule evaluation pipeline triggered upon transaction creation.

### 🛡️ 3. Dynamic Rule Engine
Manage detection logic dynamically across multiple rule categories:
* **Amount Threshold:** Triggers when a single transaction exceeds defined limits.
* **Velocity Checks:** Flags rapid successive transactions within short timeframes.
* **New Payee Detection:** Highlights transfers to unverified or new accounts.
* **Daily Accumulation Limits:** Captures cumulative daily volume spikes.

### 🚨 4. Alert Management Lifecycle
Complete state-machine handling for risk alerts:
```
[ OPEN ] ──► [ ACKNOWLEDGED ] ──► [ INVESTIGATING ] ──► [ CLOSED ]
   │
   └───────────────────────────────► [ DISMISSED ]
```
* Contextual transaction detail linking and historical audit logging for all actions.

### 📊 5. Dashboards & Analytics
* Operational overview with live metrics and transaction statistics.
* Reports module for trend analysis, risk distribution, and date-filtered exports.
* System health tracking and real-time event logs.

---

## 👥 System Architecture & Roles

```
                      +-----------------------------+
                      | User Accesses HawkEye System |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                                             |
              v                                             v
     +-----------------+                           +------------------+
     |   ADMIN ROLE    |                           |    USER ROLE     |
     +--------+--------+                           +--------+---------+
              |                                             |
   +----------+----------+                        +---------+---------+
   |                     |                        |                   |
   v                     v                        v                   v
Manage Rules   Configure Conditions          Customer Views      Analyst Views
   │                     │                   Account/Trans       Alerts & Cases
   +----------+----------+                        │                   │
              │                                   v                   │
              │                          Transaction Recorded         │
              │                                   │                   │
              +-------------------+---------------+-------------------+
                                  │
                                  v
                    Transaction Monitoring Process
                                  │
                                  v
                      Apply Monitoring Rules
                                  │
                   +--------------+--------------+
                   |                             |
                   v                             v
           Normal Activity               Suspicious Activity
                   │                             │
                   v                             v
           Complete Transaction            Generate Alert
                                                 │
                                                 v
                                        Alert Lifecycle Management
                                         (Open -> Closed / Dismissed)
                                                 │
                                                 v
                                           Audit Trail & 
                                        Dashboard Reporting
```

---

## 📂 Project Directory Structure

```
HawkEye/
├── README.md                           # Main Project Overview (This File)
├── FINAL_DOCUMENTATION.md              # Comprehensive System Evaluation Manual
├── EXECUTIVE_SUMMARY.md                # High-Level Management Summary
├── DOCUMENTATION_INDEX.md              # Documentation Hub
├── API_DOCUMENTATION.md                # REST API Specifications
├── TESTING_GUIDE.md                    # End-to-End Testing Procedure
├── HawkEye_Postman_Collection_Updated.json # Ready-to-run API Collection
├── Frontend/                           # Client Application (React / UI)
│   ├── README.md                       # Frontend Setup & Demo Credentials
│   ├── src/                            # Source Code
│   │   ├── components/                 # Shared UI Components
│   │   ├── pages/                      # Admin, Analyst, and Customer Views
│   │   └── services/                   # API Integrations
│   └── package.json
└── Backend/                            # Server Application (API & Rule Engine)
    ├── src/                            # Controller, Model, and Service Layers
    └── package.json
```

---

## 🚀 Getting Started & Installation

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm** or **yarn**
* Relevant database service (if running full persistent backend)

### 1. Repository Setup
```bash
git clone https://github.com/your-org/hawkeye.git
cd hawkeye
```

### 2. Backend Setup
```bash
cd Backend
npm install
npm run start
```
*The backend API server typically runs at `http://localhost:5000`.*

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
npm start
```
*The web interface will be accessible at `http://localhost:3000`.*

---

## 🔑 Demo Login Profiles

Refer to `Frontend/README.md` for pre-configured credentials:
* **Admin:** `admin@hawkeye.com` / `AdminPass123!`
* **Analyst:** `analyst@hawkeye.com` / `AnalystPass123!`
* **Customer:** `customer@hawkeye.com` / `CustomerPass123!`

---

## 🧪 Testing & Evaluation Guide

For evaluator review, follow this recommended verification order:

1. **Access Boundaries:** Log in as Admin, Analyst, and Customer to verify permission enforcement.
2. **Rule Configuration (Admin):** Create or update dynamic rules (e.g., flag transactions > $10,000).
3. **Transaction Execution (Customer):** Execute transactions and verify immediate rule processing.
4. **Alert Lifecycle (Analyst):** Review triggered alerts, inspect linked context, and transition status from `OPEN` to `INVESTIGATING` to `CLOSED`.
5. **Analytics & Date Filtering:** Navigate to Reports/Metrics and alter calendar ranges to confirm live filtering.
6. **Audit Verification:** Review historical logs for rule changes and alert updates.

---

## 📖 Documentation Index

| File | Description |
| :--- | :--- |
| [`FINAL_DOCUMENTATION.md`](./FINAL_DOCUMENTATION.md) | Complete system specification and evaluation manual |
| [`EXECUTIVE_SUMMARY.md`](./EXECUTIVE_SUMMARY.md) | High-level project summary and business value proposition |
| [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) | Detailed endpoint schema, request/response payload examples |
| [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) | Step-by-step evaluation, test cases, and test scripts |
| [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) | Central directory for all project documentation |

---

## 🛡️ Audit & Compliance
HawkEye maintains an immutable historical audit trail for:
* Monitoring rule additions, edits, and status toggles.
* State transitions for all risk alerts.
* User operational actions across all core modules.

*For detailed API technical specs or Postman evaluation, import `HawkEye_Postman_Collection_Updated.json` into Postman.*
