# SERPRO Integra Contador - Export Package

This package contains a complete SERPRO Integra Contador API integration system for Brazilian accounting firms. It provides real OAuth2 authentication, digital certificate processing, and access to all SERPRO tax services.

## 📁 Package Structure

```
export-package/
├── backend/
│   ├── authentication.ts      # OAuth2 + certificate authentication
│   ├── serpro-services.ts     # Service catalog and configuration
│   ├── db.ts                  # Database connection
│   └── storage.ts             # Data storage interface
├── frontend/
│   ├── credentials-module.tsx # OAuth2 credentials management
│   ├── certificate-module.tsx # Digital certificate upload
│   ├── authentication-module.tsx # Authentication flow
│   ├── services-module.tsx    # Service execution interface
│   ├── service-catalog.tsx    # Service management
│   ├── hooks/                 # React hooks for API integration
│   └── lib/                   # Utilities and API client
├── database/
│   └── schema.ts              # PostgreSQL schema definitions
├── docs/
│   └── installation-guide.md # Detailed setup instructions
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup database:**
   - Create PostgreSQL database
   - Run schema from `database/schema.ts`
   - Set environment variables

3. **Configure SERPRO:**
   - Obtain OAuth2 credentials from SERPRO
   - Get A1/A3 digital certificate
   - Upload through interface

4. **Start using services:**
   - Enable desired services in catalog
   - Execute with real SERPRO validation
   - Download generated documents

## 🔧 Core Features

### Authentication System
- Real OAuth2 integration with SERPRO
- Digital certificate (A1/A3) processing
- Automatic token renewal
- Secure credential storage

### Service Management
- 20+ SERPRO services organized by API type
- Enable/disable services as needed
- Parameter validation for each service
- Real-time SERPRO endpoint validation

### Document Processing
- PDF generation (DAS, DARF, certificates)
- Base64 to PDF conversion
- Browser viewing and download
- Authentic SERPRO document generation

### API Types Supported
- **Emitir**: Issue documents (DAS, certificates)
- **Consultar**: Query data and status
- **Declarar**: Submit declarations
- **Monitorar**: Monitor services and messages
- **Apoiar**: Support and auxiliary functions

## 📊 Service Examples

### MEI DAS Generation
```typescript
const response = await executeService("mei-gerar-das-pdf", {
  periodoApuracao: "202507",
  contratante: "10781350000196",
  contribuinte: "49698869000140"
});
```

### CCMEI Certificate
```typescript
const response = await executeService("ccmei-emitir", {
  contratante: "10781350000196",
  contribuinte: "49698869000140"
});
```

## 🔒 Security Features

- Server-side certificate processing only
- HTTPS with client certificate validation
- Encrypted storage of sensitive data
- Automatic cleanup of temporary files
- OAuth2 token secure handling

## 📋 Requirements

- Node.js 18+
- PostgreSQL database
- SERPRO OAuth2 credentials
- Valid A1/A3 digital certificate
- Brazilian tax registration (CNPJ)

## 🛠 Integration Guide

1. Copy relevant files to your project
2. Install required dependencies
3. Configure database schema
4. Set up authentication credentials
5. Enable desired services
6. Start processing tax documents

## 📞 SERPRO Services Available

### Integra-MEI
- DAS PDF generation
- CCMEI certificate emission
- Benefit management
- Tax debt consultation

### Integra-SN (Simples Nacional)
- DAS generation
- DASN declarations
- Regime consultation
- Installment management

### Integra-DCTFWeb
- Declaration transmission
- Guide generation
- Receipt processing

### Integra-Sicalc
- DARF generation
- Tax calculation
- Revenue consultation

### Integra-CaixaPostal
- Message management
- Notification handling

### Integra-Pagamento
- Payment verification
- Receipt consultation

## 🔄 System Validation

The system includes real SERPRO validation:
- Endpoint verification for each service type
- Parameter validation per service
- Authentic error messages from SERPRO
- Production-ready authentication flow

## 📖 Documentation

See `docs/installation-guide.md` for detailed setup instructions and usage examples.

## 🏢 Use Cases

- Brazilian accounting firms
- MEI service providers
- Tax compliance software
- Corporate tax management
- Automated document generation

This package provides a complete, production-ready integration with SERPRO's official tax services, enabling Brazilian businesses to automate their tax compliance processes with authentic government validation.