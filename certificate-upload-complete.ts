// ===== FRONTEND CERTIFICATE UPLOAD COMPONENT =====

// certificate-module.tsx
import { useState, useRef } from "react";
import { FileText, Upload, AlertTriangle, CheckCircle, Settings, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCertificate } from "@/hooks/use-certificate";
import { useToast } from "@/hooks/use-toast";

export default function CertificateModule() {
  const [showPassword, setShowPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: certificate, uploadCertificateMutation } = useCertificate();
  const { toast } = useToast();

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.p12') || file.name.endsWith('.pfx')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Apenas arquivos .p12 e .pfx são aceitos",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !password) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um certificado e informe a senha",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('certificate', selectedFile);
    formData.append('password', password);

    try {
      await uploadCertificateMutation.mutateAsync(formData);
      toast({
        title: "Sucesso",
        description: "Certificado processado com sucesso!",
      });
      setSelectedFile(null);
      setPassword("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao processar certificado",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center space-x-3">
            <FileText className="text-primary" />
            <div>
              <h2 className="text-lg font-medium text-foreground">Certificado Digital e-CNPJ</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload e processamento do certificado digital para autenticação
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {!certificate?.isProcessed ? (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Arraste o certificado aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: .p12, .pfx (máx. 10MB)
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar Arquivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".p12,.pfx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected file display */}
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remover
                  </Button>
                </div>
              )}

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha do Certificado</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha do certificado"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Upload button */}
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || !password || uploadCertificateMutation.isPending}
                className="w-full"
              >
                {uploadCertificateMutation.isPending ? "Processando..." : "Processar Certificado"}
              </Button>
            </div>
          ) : (
            // Certificate status display
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Certificado digital configurado e validado com sucesso
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">CNPJ</p>
                  <p className="text-sm text-muted-foreground">{certificate.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Empresa</p>
                  <p className="text-sm text-muted-foreground">{certificate.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Validade</p>
                  <p className="text-sm text-muted-foreground">
                    {certificate.expirationDate 
                      ? new Date(certificate.expirationDate).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Status</p>
                  <p className="text-sm text-green-600">Ativo</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ===== FRONTEND HOOK FOR CERTIFICATE MANAGEMENT =====

// use-certificate.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Certificate } from "@shared/schema";

export function useCertificate() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Certificate>({
    queryKey: ["/api/certificate"],
  });

  const uploadCertificateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/certificate/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificate"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    uploadCertificateMutation,
  };
}

// ===== BACKEND CERTIFICATE PROCESSING =====

// backend-certificate-processing.ts
import express from 'express';
import multer from 'multer';
import forge from 'node-forge';
import crypto from 'crypto';

// Multer configuration for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.p12') || file.originalname.endsWith('.pfx')) {
      cb(null, true);
    } else {
      cb(new Error('Only .p12 and .pfx files are allowed'), false);
    }
  }
});

// Certificate upload and processing route
app.post("/api/certificate/upload", upload.single('certificate'), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ message: "No certificate file provided" });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Certificate password is required" });
    }

    // Generate unique filename
    const fileName = `cert_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    
    // Initial certificate data
    const certificateData = {
      fileName,
      originalName: req.file.originalname,
      password,
    };

    // Save initial record to database
    const saved = await storage.saveCertificate(certificateData);
    
    // Process certificate with node-forge
    try {
      const base64Data = req.file.buffer.toString('base64');
      
      // Convert buffer to binary string for node-forge
      const p12Der = forge.util.encode64(req.file.buffer.toString('binary'));
      const p12Asn1 = forge.asn1.fromDer(forge.util.decode64(p12Der));
      
      try {
        // Decrypt PKCS#12 file with provided password
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
        
        // Extract certificate and key bags
        const certBags = p12.getBags({bagType: forge.pki.oids.certBag});
        const keyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
        
        if (!certBags || !keyBags || Object.keys(certBags).length === 0) {
          throw new Error("Certificado não contém as informações necessárias");
        }
        
        // Get certificate and private key
        const certBag = certBags[forge.pki.oids.certBag]?.[0];
        const certificate = certBag?.cert;
        
        if (!certificate) {
          throw new Error("Não foi possível extrair o certificado");
        }
        
        // Extract certificate information
        let cnpj = "";
        let companyName = "";
        
        // Extract company name from subject CN (Common Name)
        const subject = certificate.subject;
        for (const attr of subject.attributes) {
          if (attr.name === 'commonName') {
            companyName = typeof attr.value === 'string' ? attr.value : '';
            break;
          }
        }
        
        // Extract CNPJ from serial number or subject
        for (const attr of subject.attributes) {
          if (attr.name === 'serialNumber' || attr.shortName === 'serialNumber') {
            const serial = attr.value;
            if (typeof serial === 'string') {
              // Look for 14-digit CNPJ pattern
              const cnpjMatch = serial.match(/\d{14}/);
              if (cnpjMatch) {
                cnpj = cnpjMatch[0];
                break;
              }
            }
          }
        }
        
        // Get certificate expiration date
        const expirationDate = certificate.validity.notAfter;
        
        // Extract private key
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
        const privateKey = keyBag?.key;
        
        if (!privateKey) {
          throw new Error("Não foi possível extrair a chave privada do certificado");
        }
        
        // Convert to PEM format for storage and HTTPS usage
        const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
        const certificatePem = forge.pki.certificateToPem(certificate);
        
        // Prepare processed certificate data
        const processedCertData = {
          certificateData: base64Data,
          isProcessed: true,
          cnpj: cnpj || "Não encontrado",
          companyName: companyName || "Não encontrado", 
          expirationDate: expirationDate,
          privateKey: privateKeyPem,
          publicCert: certificatePem,
        };

        // Update certificate record with processed data
        await storage.updateCertificate(saved.id, processedCertData);
        
        // Return updated certificate info
        const updatedCert = await storage.getCertificate();
        res.json(updatedCert);
        
      } catch (p12Error) {
        // PKCS#12 decryption failed - wrong password
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
    console.error('Certificate upload error:', error);
    res.status(500).json({ message: "Failed to upload certificate" });
  }
});

// ===== DATABASE SCHEMA =====

// schema.ts - Certificate table definition
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  fileName: text("filename").notNull(),
  originalName: text("original_name"),
  password: text("password").notNull(),
  certificateData: text("certificate_data"), // Base64 encoded P12 file
  isProcessed: boolean("is_processed").default(false),
  privateKey: text("private_key"), // Extracted private key (PEM format)
  publicCert: text("public_cert"), // Extracted certificate (PEM format)
  cnpj: text("cnpj"),
  companyName: text("company_name"), 
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== STORAGE INTERFACE =====

// storage.ts - Certificate storage methods
export interface IStorage {
  saveCertificate(cert: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: number, updates: Partial<Certificate>): Promise<Certificate>;
  getCertificate(): Promise<Certificate | undefined>;
}

export class DatabaseStorage implements IStorage {
  async saveCertificate(cert: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db
      .insert(certificates)
      .values(cert)
      .returning();
    return certificate;
  }

  async updateCertificate(id: number, updates: Partial<Certificate>): Promise<Certificate> {
    const [certificate] = await db
      .update(certificates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(certificates.id, id))
      .returning();
    return certificate;
  }

  async getCertificate(): Promise<Certificate | undefined> {
    const [certificate] = await db
      .select()
      .from(certificates)
      .orderBy(desc(certificates.createdAt))
      .limit(1);
    return certificate || undefined;
  }
}

// ===== USAGE IN SERPRO AUTHENTICATION =====

// Using the processed certificate for SERPRO API authentication
async function authenticateWithSerpro(certificate: Certificate) {
  const tempDir = os.tmpdir();
  const certPath = path.join(tempDir, `auth_cert_${Date.now()}.pem`);
  const keyPath = path.join(tempDir, `auth_key_${Date.now()}.key`);

  try {
    // Write PEM files for HTTPS client authentication
    fs.writeFileSync(certPath, certificate.publicCert.trim());
    fs.writeFileSync(keyPath, certificate.privateKey.trim());

    const requestOptions: https.RequestOptions = {
      hostname: 'gateway.apiserpro.serpro.gov.br',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };

    // Make authenticated request to SERPRO
    // ... authentication logic

  } finally {
    // Cleanup temporary files
    try {
      fs.unlinkSync(certPath);
      fs.unlinkSync(keyPath);
    } catch (e) {
      console.warn('Failed to cleanup certificate files:', e);
    }
  }
}