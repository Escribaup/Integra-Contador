import { Calculator, HelpCircle, User } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calculator className="text-primary text-2xl" />
              <h1 className="text-xl font-semibold text-foreground">Integra Contador</h1>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Interface de Integração SERPRO
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="text-primary-600 text-sm" />
              </div>
              <span className="text-sm text-foreground hidden sm:inline">
                Escritório Contábil
              </span>
            </div>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <HelpCircle className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
