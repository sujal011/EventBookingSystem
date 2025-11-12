# Event Booking System - Documentation Index

Welcome to the Event Booking System documentation! This index will help you find the information you need quickly.

## 📚 Documentation Overview

This documentation is organized into several sections covering different aspects of the system:

### Getting Started

Start here if you're new to the project:

1. **[README](../README.md)** - Project overview and quick start guide
2. **[Setup Guide](./SETUP.md)** - Detailed installation and deployment instructions
3. **[Configuration Guide](./configuration.md)** - Environment variables and configuration options

### API Documentation

Complete reference for all API endpoints:

1. **[API Overview](./API.md)** - Complete API documentation with examples
2. **[Authentication API](./auth-api.md)** - User registration, login, and JWT authentication
3. **[Events API](./api-events.md)** - Event management endpoints
4. **[Bookings API](./api-bookings.md)** - Booking creation and management
5. **[WebSocket API](./websockets.md)** - Real-time updates via WebSocket
6. **[Error Codes](./ERROR-CODES.md)** - Complete error codes reference

### Database Documentation

Everything about the database:

1. **[Database Schema](./DATABASE-SCHEMA.md)** - Complete schema documentation with diagrams
2. **[Migrations](../drizzle/README.md)** - Database migration files and history
3. **[Database Scripts](../scripts/README.md)** - Utility scripts for database management

### Additional Resources

1. **[WebSocket Code Walkthrough](./websocket-code-walkthrough.md)** - Detailed WebSocket implementation
2. **[WebSocket Flow Explained](./websocket-flow-explained.md)** - WebSocket message flow
3. **[WebSocket Testing Guide](./websocket-testing-guide.md)** - How to test WebSocket connections

## 🚀 Quick Navigation

### I want to...

#### Set up the project
→ [Setup Guide](./SETUP.md)

#### Understand the API
→ [API Overview](./API.md)

#### Configure the application
→ [Configuration Guide](./configuration.md)

#### Work with the database
→ [Database Schema](./DATABASE-SCHEMA.md)

#### Handle errors
→ [Error Codes Reference](./ERROR-CODES.md)

#### Deploy to production
→ [Setup Guide - Production Deployment](./SETUP.md#production-deployment)

#### Test the API
→ [API Overview - Testing](./API.md#testing-the-api)

#### Understand authentication
→ [Authentication API](./auth-api.md)

#### Manage events
→ [Events API](./api-events.md)

#### Handle bookings
→ [Bookings API](./api-bookings.md)

#### Implement real-time features
→ [WebSocket API](./websockets.md)

#### Seed sample data
→ [Database Scripts](../scripts/README.md)

## 📖 Documentation by Role

### For Developers

**Getting Started:**
1. [README](../README.md) - Project overview
2. [Setup Guide](./SETUP.md) - Local development setup
3. [Database Scripts](../scripts/README.md) - Initialize and seed database

**Development:**
1. [API Overview](./API.md) - API endpoints and usage
2. [Database Schema](./DATABASE-SCHEMA.md) - Database structure
3. [Configuration Guide](./configuration.md) - Environment setup

**Testing:**
1. [API Testing](./API.md#testing-the-api) - How to test endpoints
2. [WebSocket Testing](./websocket-testing-guide.md) - WebSocket testing
3. [Error Codes](./ERROR-CODES.md) - Error handling

### For Frontend Developers

**Essential Reading:**
1. [API Overview](./API.md) - Complete API reference
2. [Authentication API](./auth-api.md) - User authentication flow
3. [Events API](./api-events.md) - Event listing and details
4. [Bookings API](./api-bookings.md) - Booking operations
5. [WebSocket API](./websockets.md) - Real-time updates
6. [Error Codes](./ERROR-CODES.md) - Error handling

**Quick Start:**
```bash
# 1. Register a user
POST /api/auth/register

# 2. Login
POST /api/auth/login

# 3. List events
GET /api/events

# 4. Create booking
POST /api/bookings

# 5. Connect to WebSocket
WS /ws
```

### For DevOps/System Administrators

**Deployment:**
1. [Setup Guide](./SETUP.md) - Complete deployment instructions
2. [Configuration Guide](./configuration.md) - Environment configuration
3. [Database Schema](./DATABASE-SCHEMA.md) - Database setup

**Maintenance:**
1. [Database Scripts](../scripts/README.md) - Database management
2. [Migrations](../drizzle/README.md) - Schema migrations
3. [Setup Guide - Troubleshooting](./SETUP.md#troubleshooting) - Common issues

**Monitoring:**
1. [Database Schema - Monitoring](./DATABASE-SCHEMA.md#monitoring-and-maintenance) - Database monitoring
2. [Setup Guide - Production](./SETUP.md#production-deployment) - Production setup

### For API Consumers

**Getting Started:**
1. [API Overview](./API.md) - API introduction
2. [Authentication API](./auth-api.md) - How to authenticate
3. [Error Codes](./ERROR-CODES.md) - Error handling

**API Reference:**
1. [Events API](./api-events.md) - Event endpoints
2. [Bookings API](./api-bookings.md) - Booking endpoints
3. [WebSocket API](./websockets.md) - Real-time updates

**Examples:**
- [API Quick Start](./API.md#quick-start-examples)
- [Authentication Examples](./auth-api.md#usage-examples)
- [Event Examples](./api-events.md#endpoints)
- [Booking Examples](./api-bookings.md#integration-examples)

## 🔍 Documentation by Topic

### Authentication & Authorization

- [Authentication API](./auth-api.md) - Complete auth documentation
- [API Overview - Authentication](./API.md#authentication) - Auth overview
- [Configuration - JWT](./configuration.md#jwt-authentication-configuration) - JWT setup

### Event Management

- [Events API](./api-events.md) - Event endpoints
- [Database Schema - Events](./DATABASE-SCHEMA.md#events) - Event table structure
- [API Examples](./API.md#5-admin-operations) - Event creation examples

### Booking System

- [Bookings API](./api-bookings.md) - Booking endpoints
- [Database Schema - Bookings](./DATABASE-SCHEMA.md#bookings) - Booking table structure
- [Database Schema - Stored Procedures](./DATABASE-SCHEMA.md#stored-procedures) - Atomic operations

### Real-time Updates

- [WebSocket API](./websockets.md) - WebSocket documentation
- [WebSocket Flow](./websocket-flow-explained.md) - Message flow
- [WebSocket Testing](./websocket-testing-guide.md) - Testing guide

### Database

- [Database Schema](./DATABASE-SCHEMA.md) - Complete schema
- [Migrations](../drizzle/README.md) - Migration files
- [Database Scripts](../scripts/README.md) - Management scripts

### Configuration

- [Configuration Guide](./configuration.md) - All configuration options
- [Setup Guide - Configuration](./SETUP.md#configuration) - Setup instructions
- [Environment Variables](./configuration.md#environment-variables) - Variable reference

### Error Handling

- [Error Codes](./ERROR-CODES.md) - Complete error reference
- [API Overview - Error Handling](./API.md#error-handling) - Error handling guide
- [Troubleshooting](./SETUP.md#troubleshooting) - Common issues

## 📝 Document Summaries

### [README](../README.md)
Project overview, features, quick start, and project structure.

### [API.md](./API.md)
Complete API documentation including all endpoints, request/response formats, authentication, error handling, and examples.

### [SETUP.md](./SETUP.md)
Detailed setup and deployment guide covering prerequisites, installation, configuration, testing, production deployment, and troubleshooting.

### [configuration.md](./configuration.md)
Comprehensive configuration guide with all environment variables, validation, setup instructions, and best practices.

### [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md)
Complete database schema documentation with diagrams, table definitions, relationships, stored procedures, and performance optimizations.

### [ERROR-CODES.md](./ERROR-CODES.md)
Reference guide for all error codes with descriptions, examples, and solutions.

### [auth-api.md](./auth-api.md)
Authentication API documentation covering registration, login, JWT tokens, middleware, and security features.

### [api-events.md](./api-events.md)
Events API documentation with all event management endpoints, validation rules, and examples.

### [api-bookings.md](./api-bookings.md)
Bookings API documentation covering booking creation, cancellation, and management with atomic operations.

### [websockets.md](./websockets.md)
WebSocket API documentation for real-time seat availability updates.

## 🎯 Common Tasks

### Setting Up Development Environment

1. Read [README](../README.md) for overview
2. Follow [Setup Guide](./SETUP.md) for installation
3. Configure [Environment Variables](./configuration.md)
4. Run [Database Scripts](../scripts/README.md) to seed data
5. Start development server

### Integrating with Frontend

1. Review [API Overview](./API.md)
2. Implement [Authentication](./auth-api.md)
3. Integrate [Events API](./api-events.md)
4. Integrate [Bookings API](./api-bookings.md)
5. Add [WebSocket Support](./websockets.md)
6. Handle [Errors](./ERROR-CODES.md)

### Deploying to Production

1. Review [Production Checklist](./SETUP.md#pre-deployment-checklist)
2. Configure [Environment](./configuration.md)
3. Set up [Database](./DATABASE-SCHEMA.md)
4. Follow [Deployment Guide](./SETUP.md#production-deployment)
5. Set up [Monitoring](./DATABASE-SCHEMA.md#monitoring-and-maintenance)

### Troubleshooting Issues

1. Check [Troubleshooting Guide](./SETUP.md#troubleshooting)
2. Review [Error Codes](./ERROR-CODES.md)
3. Check [Database Schema](./DATABASE-SCHEMA.md#troubleshooting)
4. Review application logs
5. Check database status

## 🔗 External Resources

- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Zod Documentation](https://zod.dev/)

## 📞 Getting Help

If you can't find what you're looking for:

1. Search this documentation
2. Check the [Troubleshooting Guide](./SETUP.md#troubleshooting)
3. Review [Error Codes](./ERROR-CODES.md)
4. Check GitHub Issues
5. Create a new issue with details

## 🔄 Documentation Updates

This documentation is maintained alongside the codebase. If you find any issues or have suggestions:

1. Check if the issue is already reported
2. Create a new issue or pull request
3. Include specific details and examples
4. Reference relevant documentation sections

## 📊 Documentation Statistics

- **Total Documents**: 15+
- **API Endpoints Documented**: 15+
- **Error Codes Documented**: 30+
- **Configuration Options**: 20+
- **Database Tables**: 4
- **Stored Procedures**: 2

---

**Last Updated**: November 2024

**Version**: 1.0.0

**Maintained By**: Event Booking System Team
