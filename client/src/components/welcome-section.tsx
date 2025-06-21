import { Handshake, Shield, Key, Boxes } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function WelcomeSection() {
  return (
    <div className="mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Handshake className="text-primary-600 text-xl" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Bem-vindo ao Integra Contador
              </h2>
              <p className="text-muted-foreground mb-4">
                Esta aplicação permite a integração segura com as APIs do SERPRO Integra Contador, 
                facilitando o acesso a serviços contábeis essenciais para seu escritório ou empresa.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="text-green-500" size={16} />
                  <span>Certificado Digital e-CNPJ</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Key className="text-blue-500" size={16} />
                  <span>Autenticação OAuth2</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Boxes className="text-purple-500" size={16} />
                  <span>Acesso Modular a Serviços</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
