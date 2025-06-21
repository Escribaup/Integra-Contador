import { Shield, Key, CheckCircle, XCircle, Users, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuthentication } from "@/hooks/use-authentication";
import { useCredentials } from "@/hooks/use-credentials";
import { useCertificate } from "@/hooks/use-certificate";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AuthenticationModule() {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const { data: tokens, authenticateMutation } = useAuthentication();
  const { data: credentials } = useCredentials();
  const { data: certificate } = useCertificate();
  const { toast } = useToast();

  const handleAuthenticate = async () => {
    try {
      await authenticateMutation.mutateAsync();
      toast({
        title: "Sucesso",
        description: "Autenticação realizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha na autenticação",
        variant: "destructive",
      });
    }
  };

  const isCredentialsConfigured = !!credentials;
  const isCertificateConfigured = !!certificate?.isProcessed;
  const canAuthenticate = isCredentialsConfigured && isCertificateConfigured;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="text-primary" />
              <div>
                <h2 className="text-lg font-medium text-foreground">Autenticação SERPRO</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Obtenha tokens de acesso para consumir as APIs do Integra Contador
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                tokens && new Date(tokens.expiresAt) > new Date() 
                  ? 'bg-green-500' 
                  : 'bg-muted'
              }`}></div>
              <span className="text-sm text-muted-foreground">
                {tokens && new Date(tokens.expiresAt) > new Date() ? 'Autenticado' : 'Não autenticado'}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Alert className="mb-6">
            <AlertDescription>
              <p className="font-medium mb-1">Integração Real com SERPRO:</p>
              <p>
                O sistema conecta diretamente com a API oficial do SERPRO em{" "}
                <code className="bg-muted px-1 rounded text-sm">
                  https://autenticacao.sapi.serpro.gov.br/authenticate
                </code>{" "}
                usando suas credenciais válidas e certificado digital e-CNPJ para obter tokens de acesso reais.
              </p>
            </AlertDescription>
          </Alert>

          {/* Authentication Status Card */}
          <Card className="bg-muted/50 mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Status da Autenticação</h3>
              
              {/* Prerequisites Check */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  {isCredentialsConfigured ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-muted-foreground" size={20} />
                  )}
                  <span className="text-sm text-foreground">Credenciais configuradas</span>
                  <Badge variant={isCredentialsConfigured ? "default" : "secondary"}>
                    {isCredentialsConfigured ? "OK" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  {isCertificateConfigured ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-muted-foreground" size={20} />
                  )}
                  <span className="text-sm text-foreground">Certificado digital carregado</span>
                  <Badge variant={isCertificateConfigured ? "default" : "secondary"}>
                    {isCertificateConfigured ? "OK" : "Pendente"}
                  </Badge>
                </div>
              </div>

              {/* Token Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Bearer Token</h4>
                    <div className="text-xs text-muted-foreground font-mono bg-background p-2 rounded mb-2 overflow-hidden">
                      {tokens?.accessToken ? `${tokens.accessToken.substring(0, 20)}...` : 'Não disponível'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expira em: {tokens ? new Date(tokens.expiresAt).toLocaleString('pt-BR') : '--'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">JWT Token</h4>
                    <div className="text-xs text-muted-foreground font-mono bg-background p-2 rounded mb-2 overflow-hidden">
                      {tokens?.jwtToken ? `${tokens.jwtToken.substring(0, 20)}...` : 'Não disponível'}
                    </div>
                    <p className="text-xs text-muted-foreground">Para validação da requisição</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Actions */}
          <div className="space-y-4">
            <Button 
              onClick={handleAuthenticate}
              disabled={!canAuthenticate || authenticateMutation.isPending}
              className="w-full bg-primary hover:bg-primary-600"
            >
              <Key className="mr-2" size={16} />
              {authenticateMutation.isPending ? "Obtendo Tokens..." : "Obter Tokens de Acesso"}
            </Button>

            <div className="text-center">
              <Button variant="link" className="text-primary">
                <Users className="mr-1" size={16} />
                Acesso para Terceiros via Procuração
              </Button>
            </div>
          </div>

          {/* Technical Details (Collapsible) */}
          <div className="mt-6 pt-6 border-t border-border">
            <Button
              variant="ghost" 
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center justify-between w-full text-left p-0 h-auto"
            >
              <span className="text-sm font-medium text-foreground">Detalhes Técnicos da Requisição</span>
              <ChevronDown className={`transform transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} size={16} />
            </Button>
            {showTechnicalDetails && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground font-mono space-y-2">
                    <p><strong>Endpoint:</strong> https://autenticacao.sapi.serpro.gov.br/authenticate</p>
                    <p><strong>Method:</strong> POST</p>
                    <p><strong>Headers:</strong></p>
                    <ul className="ml-4 space-y-1 text-xs">
                      <li>• Authorization: Basic (base64(consumerKey:consumerSecret))</li>
                      <li>• Role-Type: TERCEIROS</li>
                      <li>• Content-Type: application/x-www-form-urlencoded</li>
                    </ul>
                    <p><strong>Body:</strong> grant_type=client_credentials</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
