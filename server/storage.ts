import { 
  credentials, 
  certificates, 
  authTokens, 
  serviceRequests,
  type Credentials, 
  type Certificate, 
  type AuthTokens,
  type ServiceRequest,
  type InsertCredentials, 
  type InsertCertificate,
  type InsertAuthTokens,
  type InsertServiceRequest
} from "@shared/schema";

export interface IStorage {
  // Credentials
  getCredentials(): Promise<Credentials | undefined>;
  saveCredentials(creds: InsertCredentials): Promise<Credentials>;
  
  // Certificates
  getCertificate(): Promise<Certificate | undefined>;
  saveCertificate(cert: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: number, updates: Partial<Certificate>): Promise<Certificate>;
  
  // Auth Tokens
  getValidAuthTokens(): Promise<AuthTokens | undefined>;
  saveAuthTokens(tokens: InsertAuthTokens): Promise<AuthTokens>;
  
  // Service Requests
  saveServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
}

export class MemStorage implements IStorage {
  private credentials: Map<number, Credentials>;
  private certificates: Map<number, Certificate>;
  private authTokens: Map<number, AuthTokens>;
  private serviceRequests: Map<number, ServiceRequest>;
  private currentId: number;

  constructor() {
    this.credentials = new Map();
    this.certificates = new Map();
    this.authTokens = new Map();
    this.serviceRequests = new Map();
    this.currentId = 1;
  }

  async getCredentials(): Promise<Credentials | undefined> {
    return Array.from(this.credentials.values())[0];
  }

  async saveCredentials(creds: InsertCredentials): Promise<Credentials> {
    this.credentials.clear(); // Only keep one set of credentials
    const id = this.currentId++;
    const credential: Credentials = { 
      ...creds, 
      id, 
      createdAt: new Date() 
    };
    this.credentials.set(id, credential);
    return credential;
  }

  async getCertificate(): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values())[0];
  }

  async saveCertificate(cert: InsertCertificate): Promise<Certificate> {
    this.certificates.clear(); // Only keep one certificate
    const id = this.currentId++;
    const certificate: Certificate = { 
      ...cert, 
      id, 
      isProcessed: false,
      certificateData: null,
      privateKey: null,
      publicCert: null,
      cnpj: null,
      companyName: null,
      expirationDate: null,
      createdAt: new Date() 
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async updateCertificate(id: number, updates: Partial<Certificate>): Promise<Certificate> {
    const existing = this.certificates.get(id);
    if (!existing) {
      throw new Error("Certificate not found");
    }
    const updated = { ...existing, ...updates };
    this.certificates.set(id, updated);
    return updated;
  }

  async getValidAuthTokens(): Promise<AuthTokens | undefined> {
    const tokens = Array.from(this.authTokens.values()).find(token => 
      new Date(token.expiresAt) > new Date()
    );
    return tokens;
  }

  async saveAuthTokens(tokens: InsertAuthTokens): Promise<AuthTokens> {
    this.authTokens.clear(); // Only keep latest tokens
    const id = this.currentId++;
    const authToken: AuthTokens = { 
      ...tokens, 
      id, 
      tokenType: tokens.tokenType || "Bearer",
      createdAt: new Date() 
    };
    this.authTokens.set(id, authToken);
    return authToken;
  }

  async saveServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const id = this.currentId++;
    const serviceRequest: ServiceRequest = { 
      ...request, 
      id, 
      responseData: request.responseData || null,
      errorMessage: request.errorMessage || null,
      createdAt: new Date() 
    };
    this.serviceRequests.set(id, serviceRequest);
    return serviceRequest;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }
}

export const storage = new MemStorage();
