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
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Requisitos do Certificado:</p>
              <ul className="text-sm space-y-1">
                <li>• Arquivo do certificado digital do tipo <strong>.p12 ou .pfx</strong></li>
                <li>• Senha do certificado (mínimo 6 caracteres)</li>
                <li>• Certificado digital e-CNPJ válido (padrão ICP-Brasil)</li>
                <li>• O sistema validará a senha antes do processamento</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Certificate Upload Area */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Arquivo do Certificado <span className="text-destructive">*</span>
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <Upload className="text-4xl text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-primary">Clique para selecionar</span> ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-muted-foreground">Formatos aceitos: .p12, .pfx (Máx. 5MB)</p>
                  {selectedFile && (
                    <p className="text-sm text-foreground mt-2 font-medium">
                      Arquivo selecionado: {selectedFile.name}
                    </p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".p12,.pfx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {/* Certificate Password */}
            <div>
              <Label htmlFor="certificate-password">
                Senha do Certificado <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <Input
                  id="certificate-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a senha do certificado"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Certificate Info (when loaded) */}
            {certificate && certificate.isProcessed && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <h4 className="text-sm font-medium mb-2">Certificado Carregado</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Nome:</strong> {certificate.companyName || "N/A"}</p>
                    <p><strong>CNPJ:</strong> {certificate.cnpj || "N/A"}</p>
                    <p><strong>Arquivo:</strong> {certificate.originalName}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Processing Status */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Status do Processamento</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 border-2 rounded-full ${
                      selectedFile ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    }`}></div>
                    <span className="text-sm text-muted-foreground">Validação do arquivo</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 border-2 rounded-full ${
                      password ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    }`}></div>
                    <span className="text-sm text-muted-foreground">Verificação da senha</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 border-2 rounded-full ${
                      certificate?.isProcessed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    }`}></div>
                    <span className="text-sm text-muted-foreground">Conversão para PEM/KEY (se necessário)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || !password || uploadCertificateMutation.isPending}
                className="bg-primary hover:bg-primary-600"
              >
                <Settings className="mr-2" size={16} />
                {uploadCertificateMutation.isPending ? "Processando..." : "Carregar e Processar Certificado"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
