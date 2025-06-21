import { HelpCircle, ExternalLink, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HelpSection() {
  return (
    <div className="mt-12">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center space-x-3">
            <HelpCircle className="text-primary" />
            <h2 className="text-lg font-medium text-foreground">Ajuda e Documentação</h2>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">Links Úteis</h3>
              <div className="space-y-3">
                <a 
                  href="#" 
                  className="flex items-center space-x-2 text-sm text-primary hover:text-primary-600 transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>Catálogo de Serviços</span>
                </a>
                <a 
                  href="#" 
                  className="flex items-center space-x-2 text-sm text-primary hover:text-primary-600 transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>Códigos de Retorno</span>
                </a>
                <a 
                  href="#" 
                  className="flex items-center space-x-2 text-sm text-primary hover:text-primary-600 transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>Glossário</span>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">Suporte</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone size={16} />
                  <span>0800 978 2331</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail size={16} />
                  <span>suporte@serpro.gov.br</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock size={16} />
                  <span>Segunda a Sexta: 8h às 18h</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
