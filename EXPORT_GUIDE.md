# SERPRO Integra Contador - Export Guide

## Overview
This guide helps you export and reuse the SERPRO integration components in other applications.

## Core Components to Export

### 1. Backend Components

#### Authentication & Certificate Management
- `server/db.ts` - Database connection
- `server/storage.ts` - Storage interface and implementations
- `server/serpro-services.ts` - Service catalog and configurations
- `shared/schema.ts` - Database schema and types

#### API Integration
- `server/routes.ts` - API endpoints for SERPRO integration
- Authentication logic with OAuth2 and digital certificates
- Service execution with real SERPRO API calls

### 2. Frontend Components

#### Core UI Components
- `client/src/components/credentials-module.tsx` - OAuth2 credentials management
- `client/src/components/certificate-module.tsx` - Digital certificate upload/validation
- `client/src/components/authentication-module.tsx` - Authentication flow
- `client/src/components/services-module.tsx` - Service execution interface
- `client/src/components/service-catalog.tsx` - Service management catalog

#### Hooks and Utilities
- `client/src/hooks/use-credentials.ts` - Credentials management
- `client/src/hooks/use-certificate.ts` - Certificate handling
- `client/src/hooks/use-authentication.ts` - Authentication state
- `client/src/lib/serpro-api.ts` - SERPRO API client
- `client/src/lib/queryClient.ts` - API request utilities

### 3. Database Schema
- PostgreSQL tables for credentials, certificates, auth tokens, service requests
- Drizzle ORM configuration

## Key Features Included

### Authentication System
- Real OAuth2 integration with SERPRO
- Digital certificate (A1/A3) validation and processing
- Token management with automatic renewal
- Secure credential storage

### Service Management
- Complete catalog of 20+ SERPRO services
- Organized by 5 API types (Apoiar, Consultar, Declarar, Emitir, Monitorar)
- Enable/disable services through interface
- Parameter validation and service-specific data structures

### Document Processing
- PDF generation and download (DAS, DARF, certificates)
- Base64 to PDF conversion
- Document viewing in browser
- File download functionality

### Error Handling
- SERPRO message display and validation
- Proper error states and user feedback
- Service endpoint validation

## Environment Variables Required

```env
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
```

## Dependencies Required

### Backend
```json
{
  "@neondatabase/serverless": "^0.x.x",
  "drizzle-orm": "^0.x.x",
  "drizzle-kit": "^0.x.x",
  "express": "^4.x.x",
  "express-session": "^1.x.x",
  "node-forge": "^1.x.x",
  "multer": "^1.x.x",
  "https": "^1.x.x",
  "zod": "^3.x.x"
}
```

### Frontend
```json
{
  "@tanstack/react-query": "^5.x.x",
  "@hookform/resolvers": "^3.x.x",
  "react-hook-form": "^7.x.x",
  "wouter": "^3.x.x",
  "zod": "^3.x.x"
}
```

## Integration Steps

1. **Copy Core Files**: Export all components listed above
2. **Install Dependencies**: Add required packages to your project
3. **Database Setup**: Create PostgreSQL database with provided schema
4. **Environment Configuration**: Set up required environment variables
5. **SERPRO Credentials**: Obtain OAuth2 credentials and digital certificate
6. **API Integration**: Configure endpoints and authentication flow

## Service Configuration

The system uses a modular service catalog where each service has:
- Endpoint type (Apoiar, Consultar, Declarar, Emitir, Monitorar)
- System ID and Service ID
- Required/optional parameters
- Output type (PDF, JSON, XML)
- Enable/disable status

## Security Considerations

- Digital certificates are processed server-side only
- OAuth2 tokens have automatic expiration
- All API calls use HTTPS with certificate validation
- Credentials are encrypted in database storage

## Testing

The system includes real SERPRO integration with:
- Authentic API responses
- Production endpoint validation
- Real document generation
- Error message handling from SERPRO systems

## Extension Points

- Add new services by updating `serpro-services.ts`
- Extend UI components for additional functionality
- Add new document types and processing
- Implement additional authentication methods