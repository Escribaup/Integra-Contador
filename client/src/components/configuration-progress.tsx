import { Card, CardContent } from "@/components/ui/card";

interface ConfigurationProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Credenciais" },
  { id: 2, name: "Certificado" },
  { id: 3, name: "Serviços" },
];

export default function ConfigurationProgress({ currentStep }: ConfigurationProgressProps) {
  return (
    <div className="mb-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Configuração do Sistema</h3>
          <div className="flex items-center space-x-4 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step.id <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.id}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-border mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
