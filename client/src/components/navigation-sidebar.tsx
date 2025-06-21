import { Key, FileText, Shield, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ModuleType = "credentials" | "certificate" | "authentication" | "services";

interface NavigationSidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const navigationItems = [
  {
    id: "credentials" as const,
    name: "Credenciais",
    icon: Key,
  },
  {
    id: "certificate" as const,
    name: "Certificado Digital",
    icon: FileText,
  },
  {
    id: "authentication" as const,
    name: "Autenticação",
    icon: Shield,
  },
  {
    id: "services" as const,
    name: "Serviços API",
    icon: Settings,
  },
];

export default function NavigationSidebar({ activeModule, onModuleChange }: NavigationSidebarProps) {
  return (
    <Card className="sticky top-8">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">
          Módulos
        </h3>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-primary bg-primary-50 border-l-4 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Status da Conexão</h4>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-muted rounded-full"></div>
            <span className="text-sm text-muted-foreground">Não conectado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
