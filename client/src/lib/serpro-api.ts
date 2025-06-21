// SERPRO API integration utilities
export const SERPRO_ENDPOINTS = {
  AUTH: "https://autenticacao.sapi.serpro.gov.br/authenticate",
  GATEWAY: "https://gateway.apiserpro.serpro.gov.br/integra-contador/v1/",
};

export interface AuthResponse {
  access_token: string;
  jwt_token: string;
  expires_in: number;
  token_type: string;
}

export interface ServiceRequest {
  contratante: string;
  autorPedidoDados: string;
  contribuinte: {
    numero: string;
    tipo: string;
  };
  idSistema?: string;
  idServico?: string;
  versaoSistema?: string;
  dados?: any;
}

export interface ServiceResponse {
  codigo: string;
  mensagem: string;
  documento?: string;
  timestamp: string;
}

export class SerproApiClient {
  private credentials: {
    consumerKey: string;
    consumerSecret: string;
  } | null = null;

  private certificate: {
    data: string;
    password: string;
  } | null = null;

  private tokens: {
    accessToken: string;
    jwtToken: string;
    expiresAt: Date;
  } | null = null;

  setCredentials(consumerKey: string, consumerSecret: string) {
    this.credentials = { consumerKey, consumerSecret };
  }

  setCertificate(data: string, password: string) {
    this.certificate = { data, password };
  }

  async authenticate(): Promise<AuthResponse> {
    if (!this.credentials) {
      throw new Error("Credentials not configured");
    }

    if (!this.certificate) {
      throw new Error("Certificate not configured");
    }

    const auth = btoa(`${this.credentials.consumerKey}:${this.credentials.consumerSecret}`);
    
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Role-Type': 'TERCEIROS',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await fetch(SERPRO_ENDPOINTS.AUTH, {
      method: 'POST',
      headers,
      body: 'grant_type=client_credentials',
      // In a real implementation, you would also attach the certificate here
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data: AuthResponse = await response.json();
    
    this.tokens = {
      accessToken: data.access_token,
      jwtToken: data.jwt_token,
      expiresAt: new Date(Date.now() + parseInt(data.expires_in) * 1000),
    };

    return data;
  }

  async executeService(serviceName: string, request: ServiceRequest): Promise<ServiceResponse> {
    if (!this.tokens || this.tokens.expiresAt <= new Date()) {
      throw new Error("Authentication required");
    }

    const headers = {
      'Authorization': `Bearer ${this.tokens.accessToken}`,
      'Content-Type': 'application/json',
      'jwt_token': this.tokens.jwtToken,
      'Accept': 'application/json',
    };

    const response = await fetch(`${SERPRO_ENDPOINTS.GATEWAY}${serviceName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Service execution failed: ${response.status}`);
    }

    return await response.json();
  }

  isAuthenticated(): boolean {
    return this.tokens !== null && this.tokens.expiresAt > new Date();
  }

  getTokens() {
    return this.tokens;
  }
}

export const serproApi = new SerproApiClient();
