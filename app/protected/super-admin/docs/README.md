# Super Admin Module: Overview

The Super Admin module is the central management hub for the CRM Platform. It provides global administrative capabilities for managing multi-tenant isolation, user roles, telephony infrastructure, and system-wide configuration.

## Table of Contents

- [Architecture & Design](./architecture.md)
- [Database Schema](./schema.md)
- [Operation Manual](./operations.md)
- [Security & Compliance](./security.md)
- [Access & Running Tests](./access-and-run.md)

## Core Capabilities

### 🏢 Tenant Management
Multi-tenant orchestration for onboarding and offboarding companies. Supports full isolation, archiving, and purging of tenant data.

### 👥 User & RBAC Control
Global user management and Role-Based Access Control (RBAC). Super Admins can adjust roles and permissions across any tenant.

### 📞 Telephony Infrastructure
Management of VoIP gateways, SIM ports, and virtual number provisioning. Centralized control over the platform's telephony nodes.

### ⚙️ System Configuration
Platform-wide environment variables and behavior settings (e.g., maintenance mode, public signup toggles).

### 📋 Audit Logging
Detailed tracking of all administrative actions for security and compliance reporting.
