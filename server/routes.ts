import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCredentialsSchema, insertCertificateSchema, insertAuthTokensSchema, insertServiceRequestSchema } from "@shared/schema";
import multer from "multer";
import crypto from "crypto";
import forge from "node-forge";
import https from "https";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import { getServiceConfig, buildServiceRequest } from "./serpro-services";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.p12', '.pfx'];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only .p12 and .pfx files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Credentials endpoints
  app.get("/api/credentials", async (req, res) => {
    try {
      const credentials = await storage.getCredentials();
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Failed to get credentials" });
    }
  });

  app.post("/api/credentials", async (req, res) => {
    try {
      const credentials = insertCredentialsSchema.parse(req.body);
      const saved = await storage.saveCredentials(credentials);
      res.json(saved);
    } catch (error) {
      res.status(400).json({ message: "Invalid credentials data" });
    }
  });

  // Certificate endpoints
  app.get("/api/certificate", async (req, res) => {
    try {
      const certificate = await storage.getCertificate();
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to get certificate" });
    }
  });

  app.post("/api/certificate/upload", upload.single('certificate'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No certificate file provided" });
      }

      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Certificate password is required" });
      }

      const fileName = `cert_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      const certificateData = {
        fileName,
        originalName: req.file.originalname,
        password,
      };

      const saved = await storage.saveCertificate(certificateData);
      
      // Real certificate validation and processing using node-forge
      try {
        const base64Data = req.file.buffer.toString('base64');
        
        // Convert buffer to binary string for node-forge
        const p12Der = forge.util.encode64(req.file.buffer.toString('binary'));
        const p12Asn1 = forge.asn1.fromDer(forge.util.decode64(p12Der));
        
        try {
          // Attempt to decrypt the PKCS#12 file with the provided password
          const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
          
          // Extract certificate bags
          const certBags = p12.getBags({bagType: forge.pki.oids.certBag});
          const keyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
          
          if (!certBags || !keyBags || Object.keys(certBags).length === 0) {
            throw new Error("Certificado não contém as informações necessárias");
          }
          
          // Get the certificate
          const certBag = certBags[forge.pki.oids.certBag]?.[0];
          const certificate = certBag?.cert;
          
          if (!certificate) {
            throw new Error("Não foi possível extrair o certificado");
          }
          
          // Extract information from certificate
          let cnpj = "";
          let companyName = "";
          
          // Look for CNPJ in subject or extensions
          const subject = certificate.subject;
          
          // Extract company name from subject CN (Common Name)
          for (const attr of subject.attributes) {
            if (attr.name === 'commonName') {
              companyName = typeof attr.value === 'string' ? attr.value : '';
              break;
            }
          }
          
          // Try to extract CNPJ from subject or extensions
          for (const attr of subject.attributes) {
            if (attr.name === 'serialNumber' || attr.shortName === 'serialNumber') {
              const serial = attr.value;
              if (typeof serial === 'string') {
                // CNPJ pattern: 14 digits
                const cnpjMatch = serial.match(/\d{14}/);
                if (cnpjMatch) {
                  cnpj = cnpjMatch[0];
                  break;
                }
              }
            }
          }
          
          // Get expiration date
          const expirationDate = certificate.validity.notAfter;
          
          // Convert private key to PEM format
          const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
          const privateKey = keyBag?.key;
          
          if (!privateKey) {
            throw new Error("Não foi possível extrair a chave privada do certificado");
          }
          
          const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
          
          // Convert certificate to PEM format
          const certificatePem = forge.pki.certificateToPem(certificate);
          
          const certData = {
            certificateData: base64Data,
            isProcessed: true,
            cnpj: cnpj || "Não encontrado",
            companyName: companyName || "Não encontrado",
            expirationDate: expirationDate,
            privateKey: privateKeyPem,
            publicCert: certificatePem,
          };

          await storage.updateCertificate(saved.id, certData);
          
          // Return the updated certificate
          const updatedCert = await storage.getCertificate();
          res.json(updatedCert);
          
        } catch (p12Error) {
          // PKCS#12 decryption failed - likely wrong password
          throw new Error("Senha do certificado incorreta ou arquivo corrompido");
        }
        
      } catch (certError) {
        // Certificate processing failed - update with error status
        await storage.updateCertificate(saved.id, {
          isProcessed: false,
        });
        
        const errorMessage = certError instanceof Error ? certError.message : 
          "Falha na validação do certificado. Verifique se a senha está correta e se o arquivo é um certificado digital válido (.p12 ou .pfx).";
        
        return res.status(400).json({ 
          message: errorMessage 
        });
      }

    } catch (error) {
      res.status(500).json({ message: "Failed to upload certificate" });
    }
  });

  // Authentication endpoints
  app.get("/api/auth/tokens", async (req, res) => {
    try {
      const tokens = await storage.getValidAuthTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to get auth tokens" });
    }
  });

  app.post("/api/auth/authenticate", async (req, res) => {
    try {
      const credentials = await storage.getCredentials();
      const certificate = await storage.getCertificate();

      if (!credentials) {
        return res.status(400).json({ message: "Credentials not configured" });
      }

      if (!certificate || !certificate.isProcessed) {
        return res.status(400).json({ message: "Certificate not configured" });
      }

      // Real OAuth2 request to SERPRO
      const auth = Buffer.from(`${credentials.consumerKey}:${credentials.consumerSecret}`).toString('base64');
      
      const authHeaders = {
        'Authorization': `Basic ${auth}`,
        'Role-Type': 'TERCEIROS',
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      try {
        // Use native Node.js HTTPS for certificate-based authentication
        // fetch() doesn't properly support client certificates in Node.js
        const requestOptions: https.RequestOptions = {
          hostname: 'autenticacao.sapi.serpro.gov.br',
          port: 443,
          path: '/authenticate',
          method: 'POST',
          headers: authHeaders
        };

        // Write certificate and key to temporary files (like Python approach)
        if (certificate.publicCert && certificate.privateKey) {
          const tempDir = os.tmpdir();
          const certPath = path.join(tempDir, `cert_${Date.now()}.pem`);
          const keyPath = path.join(tempDir, `key_${Date.now()}.key`);
          
          try {
            // Write certificate and key to temporary files
            fs.writeFileSync(certPath, certificate.publicCert.trim());
            fs.writeFileSync(keyPath, certificate.privateKey.trim());
            
            // Use file paths like Python requests
            requestOptions.cert = fs.readFileSync(certPath);
            requestOptions.key = fs.readFileSync(keyPath);
            requestOptions.rejectUnauthorized = false;
            
            console.log('Using certificate files:', { certPath, keyPath });
            
            // Clean up files after request
            const cleanup = () => {
              try {
                fs.unlinkSync(certPath);
                fs.unlinkSync(keyPath);
              } catch (e) {
                console.warn('Failed to cleanup certificate files:', e);
              }
            };
            
            // Set cleanup to run after the request
            setTimeout(cleanup, 10000); // Cleanup after 10 seconds
            
          } catch (fileError) {
            throw new Error(`Erro ao processar certificado: ${fileError}`);
          }
        } else {
          throw new Error("Certificado digital não está configurado corretamente");
        }
        
        const authResponse = await new Promise<any>((resolve, reject) => {
          const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
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
            reject(error);
          });

          req.write('grant_type=client_credentials');
          req.end();
        });

        const authData = authResponse;
        
        const tokenData = {
          accessToken: authData.access_token,
          jwtToken: authData.jwt_token,
          expiresIn: authData.expires_in.toString(),
          tokenType: authData.token_type || "Bearer",
          expiresAt: new Date(Date.now() + parseInt(authData.expires_in) * 1000),
        };

        const saved = await storage.saveAuthTokens(tokenData);
        res.json(saved);
      } catch (authError) {
        console.error('SERPRO Authentication Error:', authError);
        return res.status(401).json({ 
          message: `Falha na autenticação com SERPRO: ${authError instanceof Error ? authError.message : 'Erro desconhecido'}` 
        });
      }
    } catch (error) {
      console.error('Authentication Error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Service endpoints
  app.get("/api/services/requests", async (req, res) => {
    try {
      const requests = await storage.getServiceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get service requests" });
    }
  });

  app.post("/api/services/execute", async (req, res) => {
    try {
      const tokens = await storage.getValidAuthTokens();
      if (!tokens) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { serviceName, parameters } = req.body;
      if (!serviceName || !parameters) {
        return res.status(400).json({ message: "Service name and parameters are required" });
      }

      // Save the service request
      const requestData = {
        serviceName,
        requestData: JSON.stringify(parameters),
        status: "pending" as const,
      };

      const serviceRequest = await storage.saveServiceRequest(requestData);

      // Get service configuration and build request
      const serviceConfig = getServiceConfig(serviceName);
      if (!serviceConfig) {
        return res.status(400).json({ 
          message: `Serviço não suportado: ${serviceName}. Serviços disponíveis: consultar-das, gerar-das, gerar-das-mei, mei, consultar-situacao` 
        });
      }

      const apiRequestBody = buildServiceRequest(
        serviceName,
        parameters,
        parameters.contratante,
        parameters.autorPedidoDados,
        parameters.contribuinte
      );

      console.log('API Request Body:', JSON.stringify(apiRequestBody, null, 2));
      console.log('Service Config:', serviceConfig);

      // Real API call to SERPRO Integra Contador
      const serviceHeaders = {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
        'jwt_token': tokens.jwtToken,
        'Accept': 'application/json'
      };

      try {
        // Use the same HTTPS approach with certificate for service calls
        const certificate = await storage.getCertificate();
        
        const serviceRequestOptions: https.RequestOptions = {
          hostname: 'gateway.apiserpro.serpro.gov.br',
          port: 443,
          path: serviceConfig.endpoint,
          method: 'POST',
          headers: serviceHeaders
        };

        // Write certificate and key to temporary files for service calls
        if (certificate?.publicCert && certificate.privateKey) {
          const tempDir = os.tmpdir();
          const certPath = path.join(tempDir, `service_cert_${Date.now()}.pem`);
          const keyPath = path.join(tempDir, `service_key_${Date.now()}.key`);
          
          try {
            // Write certificate and key to temporary files
            fs.writeFileSync(certPath, certificate.publicCert.trim());
            fs.writeFileSync(keyPath, certificate.privateKey.trim());
            
            // Use file buffers like Python requests
            serviceRequestOptions.cert = fs.readFileSync(certPath);
            serviceRequestOptions.key = fs.readFileSync(keyPath);
            serviceRequestOptions.rejectUnauthorized = false;
            
            // Clean up files after request
            const cleanup = () => {
              try {
                fs.unlinkSync(certPath);
                fs.unlinkSync(keyPath);
              } catch (e) {
                console.warn('Failed to cleanup service certificate files:', e);
              }
            };
            
            setTimeout(cleanup, 10000); // Cleanup after 10 seconds
            
          } catch (fileError) {
            throw new Error(`Erro ao processar certificado para serviço: ${fileError}`);
          }
        } else {
          throw new Error("Certificado digital não está configurado corretamente");
        }

        const serviceResponse = await new Promise<any>((resolve, reject) => {
          const req = https.request(serviceRequestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              if (res.statusCode === 200) {
                try {
                  resolve(JSON.parse(data));
                } catch (e) {
                  reject(new Error(`Invalid JSON response: ${data}`));
                }
              } else {
                // For non-200 responses, try to parse as JSON to get SERPRO error details
                try {
                  const errorData = JSON.parse(data);
                  if (errorData.mensagens && errorData.mensagens.length > 0) {
                    // Return structured SERPRO error response
                    resolve({
                      status: res.statusCode,
                      success: false,
                      mensagens: errorData.mensagens,
                      responseId: errorData.responseId,
                      responseDateTime: errorData.responseDateTime
                    });
                  } else {
                    reject(new Error(`Service call failed: ${res.statusCode} - ${data}`));
                  }
                } catch (e) {
                  reject(new Error(`Service call failed: ${res.statusCode} - ${data}`));
                }
              }
            });
          });

          req.on('error', (error) => {
            reject(error);
          });

          req.write(JSON.stringify(apiRequestBody));
          req.end();
        });

        const responseData = serviceResponse;

        // Update the request with the response
        await storage.saveServiceRequest({
          ...requestData,
          responseData: JSON.stringify(responseData),
          status: "success" as const,
        });

        res.json(responseData);

      } catch (serviceError) {
        console.error('SERPRO Service Error:', serviceError);
        
        // Update the request with error status
        await storage.saveServiceRequest({
          ...requestData,
          status: "error" as const,
          errorMessage: serviceError instanceof Error ? serviceError.message : 'Erro desconhecido',
        });

        return res.status(400).json({ 
          message: `Falha na execução do serviço: ${serviceError instanceof Error ? serviceError.message : 'Erro desconhecido'}` 
        });
      }

    } catch (error) {
      console.error('Service execution error:', error);
      res.status(500).json({ message: "Service execution failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
