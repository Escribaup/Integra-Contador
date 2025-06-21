# SERPRO Integra Contador - Installation Guide

## Quick Setup

### 1. Install Dependencies

```bash
# Backend dependencies
npm install @neondatabase/serverless drizzle-orm drizzle-kit express express-session node-forge multer zod

# Frontend dependencies  
npm install @tanstack/react-query @hookform/resolvers react-hook-form wouter
```

### 2. Database Setup

Create PostgreSQL database and run:

```sql
-- From database/schema.ts
CREATE TABLE credentials (
  id SERIAL PRIMARY KEY,
  consumer_key VARCHAR(255) NOT NULL,
  consumer_secret VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  data TEXT NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_processed BOOLEAN DEFAULT FALSE,
  public_cert TEXT,
  private_key TEXT,
  cnpj VARCHAR(20),
  company_name VARCHAR(255),
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth_tokens (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,
  jwt_token TEXT NOT NULL,
  expires_in INTEGER NOT NULL,
  token_type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_requests (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(255) NOT NULL,
  request_data TEXT NOT NULL,
  response_data TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=your_host
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=your_database
```

### 4. SERPRO Configuration

1. Obtain OAuth2 credentials from SERPRO
2. Get A1/A3 digital certificate
3. Configure credentials in app interface
4. Upload and validate certificate

## Usage Examples

### Basic Authentication

```typescript
import { SerproAuthenticator } from './backend/authentication';

const auth = new SerproAuthenticator({
  consumerKey: "your_key",
  consumerSecret: "your_secret", 
  certificateData: "base64_certificate_data",
  certificatePassword: "cert_password"
});

const tokens = await auth.authenticate();
```

### Service Execution

```typescript
import { buildServiceRequest, getServiceConfig } from './backend/serpro-services';

const serviceRequest = buildServiceRequest(
  "mei-gerar-das-pdf",
  { periodoApuracao: "202507" },
  "10781350000196", // contratante
  "10781350000196", // autorPedidoDados
  "49698869000140"  // contribuinte
);

const response = await auth.executeService("/integra-contador/v1/Emitir", serviceRequest);
```

### PDF Document Processing

```typescript
// Convert base64 to PDF blob
const pdfData = response.pdf || response.documento;
const byteCharacters = atob(pdfData);
const byteNumbers = new Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteNumbers[i] = byteCharacters.charCodeAt(i);
}
const byteArray = new Uint8Array(byteNumbers);
const blob = new Blob([byteArray], { type: 'application/pdf' });

// Download file
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'das_mei.pdf';
link.click();
```

## Service Types

### Emitir (Issue Documents)
- DAS MEI generation
- CCMEI certificates  
- DAS Simples Nacional
- DARF generation

### Consultar (Query Data)
- MEI status queries
- Tax debt consultation
- Certificate validation

### Declarar (Submit Declarations)
- DCTFWeb transmission
- DASN submission

### Monitorar (Monitor)
- Message inbox
- Payment status
- Service monitoring

### Apoiar (Support)
- Support services
- Auxiliary functions

## Error Handling

The system includes comprehensive error handling for:
- Authentication failures
- Certificate validation errors
- Service endpoint mismatches
- SERPRO validation messages
- Network connectivity issues

## Security Features

- Digital certificate processing server-side only
- OAuth2 token automatic renewal
- HTTPS with certificate validation
- Encrypted credential storage
- Temporary file cleanup