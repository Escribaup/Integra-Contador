import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCredentialsSchema, insertCertificateSchema, insertAuthTokensSchema, insertServiceRequestSchema } from "@shared/schema";
import multer from "multer";
import crypto from "crypto";

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
      
      // Store the actual certificate data (in a real app, you'd process the certificate here)
      const base64Data = req.file.buffer.toString('base64');
      await storage.updateCertificate(saved.id, {
        certificateData: base64Data,
        isProcessed: true,
        // In a real implementation, you would parse the certificate to extract:
        // cnpj, companyName, expirationDate, privateKey, publicCert
      });

      res.json(saved);
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
