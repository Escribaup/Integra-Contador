import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCredentialsSchema, insertCertificateSchema, insertAuthTokensSchema, insertServiceRequestSchema } from "@shared/schema";
import multer from "multer";
import crypto from "crypto";
import forge from "node-forge";

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

      // In a real implementation, make the actual OAuth2 request to SERPRO
      // For now, simulate the response
      const authData = {
        accessToken: `bearer_${crypto.randomBytes(32).toString('hex')}`,
        jwtToken: `jwt_${crypto.randomBytes(32).toString('hex')}`,
        expiresIn: "3600", // 1 hour
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      const saved = await storage.saveAuthTokens(authData);
      res.json(saved);
    } catch (error) {
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
        status: "pending",
      };

      const serviceRequest = await storage.saveServiceRequest(requestData);

      // In a real implementation, make the actual API call to SERPRO
      // For now, simulate a successful response
      const responseData = {
        codigo: "00",
        mensagem: "Processamento realizado com sucesso",
        documento: `JVBERi0xLjMNCiXi48/TDQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9PdXRsaW5lcyAyIDAgUg0KL1BhZ2VzIDMgMCBSDQo+Pg0KZW5kb2JqDQoyIDAgb2JqDQo8PA0KL1R5cGUgL091dGxpbmVzDQovQ291bnQgMA0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFs0IDAgUl0NCj4+DQplbmRvYmoNCjQgMCBvYmoNCjw8DQovVHlwZSAvUGFnZQ0KL1BhcmVudCAzIDAgUg0KL01lZGlhQm94IFswIDAgNjEyIDc5Ml0NCi9Db250ZW50cyA1IDAgUg0KPj4NCmVuZG9iag0K...`,
        timestamp: new Date().toISOString(),
      };

      // Update the request with the response
      await storage.saveServiceRequest({
        ...requestData,
        responseData: JSON.stringify(responseData),
        status: "success",
      });

      res.json(responseData);
    } catch (error) {
      res.status(500).json({ message: "Service execution failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
