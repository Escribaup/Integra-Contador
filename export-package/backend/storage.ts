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
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getCredentials(): Promise<Credentials | undefined> {
    const [credential] = await db.select().from(credentials).limit(1);
    return credential || undefined;
  }

  async saveCredentials(creds: InsertCredentials): Promise<Credentials> {
    // Delete existing credentials (only keep one set)
    await db.delete(credentials);
    
    const [saved] = await db
      .insert(credentials)
      .values(creds)
      .returning();
    return saved;
  }

  async getCertificate(): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).limit(1);
    return certificate || undefined;
  }

  async saveCertificate(cert: InsertCertificate): Promise<Certificate> {
    // Delete existing certificates (only keep one)
    await db.delete(certificates);
    
    const [saved] = await db
      .insert(certificates)
      .values(cert)
      .returning();
    return saved;
  }

  async updateCertificate(id: number, updates: Partial<Certificate>): Promise<Certificate> {
    const [updated] = await db
      .update(certificates)
      .set(updates)
      .where(eq(certificates.id, id))
      .returning();
    
    if (!updated) {
      throw new Error("Certificate not found");
    }
    return updated;
  }

  async getValidAuthTokens(): Promise<AuthTokens | undefined> {
    const [tokens] = await db
      .select()
      .from(authTokens)
      .orderBy(desc(authTokens.createdAt))
      .limit(1);
    
    if (!tokens || new Date(tokens.expiresAt) <= new Date()) {
      return undefined;
    }
    return tokens;
  }

  async saveAuthTokens(tokens: InsertAuthTokens): Promise<AuthTokens> {
    // Delete existing tokens (only keep latest)
    await db.delete(authTokens);
    
    const [saved] = await db
      .insert(authTokens)
      .values(tokens)
      .returning();
    return saved;
  }

  async saveServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [saved] = await db
      .insert(serviceRequests)
      .values(request)
      .returning();
    return saved;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id))
      .limit(1);
    return request || undefined;
  }
}

export const storage = new DatabaseStorage();
