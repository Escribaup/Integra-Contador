import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';
import forge from 'node-forge';

export interface AuthenticationConfig {
  consumerKey: string;
  consumerSecret: string;
  certificateData: string;
  certificatePassword: string;
}

export interface AuthTokens {
  accessToken: string;
  jwtToken: string;
  expiresIn: number;
  tokenType: string;
  expiresAt: Date;
}

export class SerproAuthenticator {
  private config: AuthenticationConfig;
  private tokens: AuthTokens | null = null;

  constructor(config: AuthenticationConfig) {
    this.config = config;
  }

  async authenticate(): Promise<AuthTokens> {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');

    const requestOptions: https.RequestOptions = {
      hostname: 'gateway.apiserpro.serpro.gov.br',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    };

    // Process certificate for HTTPS client authentication
    const tempDir = os.tmpdir();
    const certPath = path.join(tempDir, `cert_${Date.now()}.pem`);
    const keyPath = path.join(tempDir, `key_${Date.now()}.key`);

    try {
      // Convert P12 to PEM format
      const base64Data = this.config.certificateData.replace(/^data:application\/x-pkcs12;base64,/, '');
      const p12Buffer = Buffer.from(base64Data, 'base64');
      
      const p12Der = forge.util.encode64(p12Buffer.toString('binary'));
      const p12Asn1 = forge.asn1.fromDer(forge.util.decode64(p12Der));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, this.config.certificatePassword);

      const certBags = p12.getBags({bagType: forge.pki.oids.certBag});
      const keyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});

      if (!certBags || !keyBags || Object.keys(certBags).length === 0) {
        throw new Error("Certificate does not contain necessary information");
      }

      const certBag = certBags[forge.pki.oids.certBag]?.[0];
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

      if (!certBag?.cert || !keyBag?.key) {
        throw new Error("Could not extract certificate or private key");
      }

      const publicCert = forge.pki.certificateToPem(certBag.cert);
      const privateKey = forge.pki.privateKeyToPem(keyBag.key);

      fs.writeFileSync(certPath, publicCert.trim());
      fs.writeFileSync(keyPath, privateKey.trim());

      requestOptions.cert = fs.readFileSync(certPath);
      requestOptions.key = fs.readFileSync(keyPath);

      const cleanup = () => {
        try {
          fs.unlinkSync(certPath);
          fs.unlinkSync(keyPath);
        } catch (e) {
          console.warn('Failed to cleanup certificate files:', e);
        }
      };

      const authResponse = await new Promise<any>((resolve, reject) => {
        const req = https.request(requestOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            cleanup();
            if (res.statusCode === 200) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error(`Invalid JSON response: ${data}`));
              }
            } else {
              reject(new Error(`Authentication failed: ${res.statusCode} - ${data}`));
            }
          });
        });

        req.on('error', (error) => {
          cleanup();
          reject(error);
        });

        req.write('grant_type=client_credentials');
        req.end();
      });

      this.tokens = {
        accessToken: authResponse.access_token,
        jwtToken: authResponse.jwt_token,
        expiresIn: authResponse.expires_in,
        tokenType: authResponse.token_type,
        expiresAt: new Date(Date.now() + (authResponse.expires_in * 1000))
      };

      return this.tokens;

    } catch (error) {
      // Cleanup on error
      try {
        fs.unlinkSync(certPath);
        fs.unlinkSync(keyPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.tokens !== null && new Date() < this.tokens.expiresAt;
  }

  getTokens(): AuthTokens | null {
    if (this.isAuthenticated()) {
      return this.tokens;
    }
    return null;
  }

  async executeService(endpoint: string, requestBody: any): Promise<any> {
    if (!this.isAuthenticated()) {
      await this.authenticate();
    }

    const tokens = this.getTokens();
    if (!tokens) {
      throw new Error('Authentication required');
    }

    const serviceHeaders = {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
      'jwt_token': tokens.jwtToken,
      'Accept': 'application/json'
    };

    const serviceRequestOptions: https.RequestOptions = {
      hostname: 'gateway.apiserpro.serpro.gov.br',
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: serviceHeaders
    };

    // Add certificate for service calls
    const tempDir = os.tmpdir();
    const certPath = path.join(tempDir, `service_cert_${Date.now()}.pem`);
    const keyPath = path.join(tempDir, `service_key_${Date.now()}.key`);

    try {
      const base64Data = this.config.certificateData.replace(/^data:application\/x-pkcs12;base64,/, '');
      const p12Buffer = Buffer.from(base64Data, 'base64');
      
      const p12Der = forge.util.encode64(p12Buffer.toString('binary'));
      const p12Asn1 = forge.asn1.fromDer(forge.util.decode64(p12Der));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, this.config.certificatePassword);

      const certBags = p12.getBags({bagType: forge.pki.oids.certBag});
      const keyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});

      const certBag = certBags[forge.pki.oids.certBag]?.[0];
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

      if (!certBag?.cert || !keyBag?.key) {
        throw new Error("Could not extract certificate or private key");
      }

      const publicCert = forge.pki.certificateToPem(certBag.cert);
      const privateKey = forge.pki.privateKeyToPem(keyBag.key);

      fs.writeFileSync(certPath, publicCert.trim());
      fs.writeFileSync(keyPath, privateKey.trim());

      serviceRequestOptions.cert = fs.readFileSync(certPath);
      serviceRequestOptions.key = fs.readFileSync(keyPath);

      const cleanup = () => {
        try {
          fs.unlinkSync(certPath);
          fs.unlinkSync(keyPath);
        } catch (e) {
          console.warn('Failed to cleanup service certificate files:', e);
        }
      };

      const serviceResponse = await new Promise<any>((resolve, reject) => {
        const req = https.request(serviceRequestOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            cleanup();
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Invalid JSON response: ${data}`));
            }
          });
        });

        req.on('error', (error) => {
          cleanup();
          reject(error);
        });

        req.write(JSON.stringify(requestBody));
        req.end();
      });

      return serviceResponse;

    } catch (error) {
      // Cleanup on error
      try {
        fs.unlinkSync(certPath);
        fs.unlinkSync(keyPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      throw error;
    }
  }
}