import { useState } from "react";
import { Settings, FileText, Calendar, UserRoundCheck, TrendingUp, Mail, Receipt, Play, X, Eye, Download, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  serviceCount: number;
  color: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: "declaracoes",
    name: "Declarações",
    description: "Consultar declarações, gerar DAS, transmitir DCTFWEB",
    icon: FileText,
    serviceCount: 3,
    color: "blue",
  },
  {
    id: "parcelamentos",
    name: "Parcelamentos",
    description: "Consultar pedidos, emitir documentos de arrecadação",
    icon: Calendar,
    serviceCount: 4,
    color: "green",
  },
  {
    id: "mei",
    name: "MEI",
    description: "Emitir CCMEI, consultar dados, PGMEI",
    icon: UserRoundCheck,
    serviceCount: 3,
    color: "purple",
  },
  {
    id: "situacao-fiscal",
    name: "Situação Fiscal",
    description: "SITFIS - Relatórios de situação fiscal",
    icon: TrendingUp,
    serviceCount: 2,
    color: "orange",
  },
  {
    id: "mensagens",
    name: "Mensagens",
    description: "CAIXAPOSTAL - Lista e detalhes de mensagens",
    icon: Mail,
    serviceCount: 2,
    color: "red",
  },
  {
    id: "arrecadacao",
    name: "Arrecadação",
    description: "SICALC - Emitir DARF",
    icon: Receipt,
    serviceCount: 1,
    color: "indigo",
  },
];

export default function ServicesModule() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceParameters, setServiceParameters] = useState({
    contratante: "",
    autorPedidoDados: "",
    contribuinte: "",
    competencia: "",
  });
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const { toast } = useToast();

  const handleServiceSelect = (categoryId: string) => {
    setSelectedService(categoryId);
    setApiResponse(null);
  };

  const handleExecuteService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);

    try {
      const response = await apiRequest("POST", "/api/services/execute", {
        serviceName: selectedService,
        parameters: serviceParameters,
      });

      const data = await response.json();
      setApiResponse(data);
      
      toast({
        title: "Sucesso",
        description: "Serviço executado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha na execução do serviço",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
    toast({
      title: "Copiado",
      description: "Resposta copiada para a área de transferência",
    });
  };

  const handleViewDocument = () => {
    const pdfData = apiResponse?.pdf || apiResponse?.documento;
    if (pdfData) {
      try {
        const byteCharacters = atob(pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Open in new window
        window.open(url, '_blank');
        
        toast({
          title: "Documento aberto",
          description: "O PDF foi aberto em uma nova aba",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível abrir o documento",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Erro",
        description: "Nenhum documento PDF encontrado na resposta",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = () => {
    const pdfData = apiResponse?.pdf || apiResponse?.documento;
    if (pdfData) {
      try {
        const byteCharacters = atob(pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        const competencia = serviceParameters.periodoApuracao || new Date().toISOString().slice(0, 7).replace('-', '');
        const contribuinte = serviceParameters.contribuinte || 'CNPJ';
        link.download = `DAS_MEI_${contribuinte}_${competencia}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download iniciado",
          description: "O arquivo PDF está sendo baixado",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível baixar o documento",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Erro",
        description: "Nenhum documento PDF encontrado na resposta",
        variant: "destructive",
      });
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
      indigo: "bg-indigo-100 text-indigo-800",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center space-x-3">
            <Settings className="text-primary" />
            <div>
              <h2 className="text-lg font-medium text-foreground">Serviços da API Integra Contador</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sistema integrado com produção SERPRO - Gerando documentos reais da Receita Federal
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Service Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                  onClick={() => handleServiceSelect(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className={`text-${category.color}-500 text-lg`} />
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <Badge className={getColorClasses(category.color)}>
                      {category.serviceCount} serviços
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Service Interface */}
          {selectedService && (
            <Card className="border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      Gerar DAS - {serviceCategories.find(c => c.id === selectedService)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Geração de Documento de Arrecadação para {selectedService}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedService(null)}
                  >
                    <X size={16} />
                  </Button>
                </div>

                {/* Service Form */}
                <form onSubmit={handleExecuteService} className="space-y-6">
                  {/* Common Parameters */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium text-foreground mb-4">Parâmetros Comuns</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contratante">
                            Contratante <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="contratante"
                            placeholder="12345678000190"
                            value={serviceParameters.contratante}
                            onChange={(e) => setServiceParameters(prev => ({ ...prev, contratante: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="autorPedidoDados">
                            Autor do Pedido <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="autorPedidoDados"
                            placeholder="98765432000109"
                            value={serviceParameters.autorPedidoDados}
                            onChange={(e) => setServiceParameters(prev => ({ ...prev, autorPedidoDados: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service-Specific Parameters */}
                  <Card className="bg-blue-50 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium text-foreground mb-4">Parâmetros Específicos</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="contribuinte">
                            CNPJ do Contribuinte <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="contribuinte"
                            placeholder="12345678000190"
                            value={serviceParameters.contribuinte}
                            onChange={(e) => setServiceParameters(prev => ({ ...prev, contribuinte: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="competencia">
                            Competência <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="competencia"
                            type="month"
                            value={serviceParameters.competencia}
                            onChange={(e) => setServiceParameters(prev => ({ ...prev, competencia: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isExecuting}
                      className="bg-primary hover:bg-primary-600"
                    >
                      <Play className="mr-2" size={16} />
                      {isExecuting ? "Executando..." : "Executar Serviço"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* API Response Display */}
          {apiResponse && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">Resposta da API</h3>
                  <Badge className={apiResponse.success === false || apiResponse.status === 400 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                    {apiResponse.success === false || apiResponse.status === 400 ? (
                      <>
                        <AlertCircle className="mr-1" size={14} />
                        Erro de Validação
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1" size={14} />
                        Sucesso
                      </>
                    )}
                  </Badge>
                </div>
                
                {/* Response Content */}
                <div className="space-y-4">
                  {/* Show PDF document only if there's actual PDF data */}
                  {(apiResponse.pdf || apiResponse.documento) && apiResponse.success !== false && apiResponse.status !== 400 && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-medium text-foreground mb-2">Documento Gerado</h4>
                        <div className="flex items-center justify-between p-3 bg-background border border-border rounded-md">
                          <div className="flex items-center space-x-3">
                            <FileText className="text-red-500 text-xl" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                DAS_{selectedService}_{serviceParameters.competencia?.replace('-', '') || new Date().toISOString().slice(0, 7).replace('-', '')}.pdf
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PDF • Gerado em {new Date().toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={handleViewDocument}>
                              <Eye className="mr-1" size={14} />
                              Visualizar
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary-600" onClick={handleDownloadDocument}>
                              <Download className="mr-1" size={14} />
                              Baixar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Show SERPRO messages */}
                  {apiResponse.mensagens && (
                    <Card className={
                      apiResponse.mensagens.some((msg: any) => msg.codigo?.includes('Erro') || msg.codigo?.includes('EntradaIncorreta')) 
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        : apiResponse.mensagens.some((msg: any) => msg.codigo?.includes('Aviso') || msg.texto?.includes('Já foi efetuado pagamento'))
                        ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                        : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    }>
                      <CardContent className="p-4">
                        <h4 className={`text-sm font-medium mb-2 ${
                          apiResponse.mensagens.some((msg: any) => msg.codigo?.includes('Erro') || msg.codigo?.includes('EntradaIncorreta'))
                            ? "text-red-800 dark:text-red-200"
                            : apiResponse.mensagens.some((msg: any) => msg.codigo?.includes('Aviso') || msg.texto?.includes('Já foi efetuado pagamento'))
                            ? "text-yellow-800 dark:text-yellow-200"
                            : "text-green-800 dark:text-green-200"
                        }`}>
                          Mensagens do SERPRO
                        </h4>
                        <div className="space-y-2">
                          {apiResponse.mensagens.map((msg: any, index: number) => {
                            const isError = msg.codigo?.includes('Erro') || msg.codigo?.includes('EntradaIncorreta');
                            const isWarning = msg.codigo?.includes('Aviso') || msg.texto?.includes('Já foi efetuado pagamento');
                            const bgColor = isError ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800" 
                                          : isWarning ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800"
                                          : "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
                            const textColor = isError ? "text-red-800 dark:text-red-200" 
                                            : isWarning ? "text-yellow-800 dark:text-yellow-200"
                                            : "text-green-800 dark:text-green-200";
                            const subTextColor = isError ? "text-red-700 dark:text-red-300" 
                                                : isWarning ? "text-yellow-700 dark:text-yellow-300"
                                                : "text-green-700 dark:text-green-300";
                            
                            return (
                              <div key={index} className={`p-3 rounded border ${bgColor}`}>
                                <p className={`text-sm font-medium ${textColor}`}>
                                  {msg.codigo?.includes('Sucesso') ? 'Sucesso' 
                                   : msg.codigo?.includes('Aviso') ? 'Aviso'
                                   : msg.codigo?.includes('Erro') ? 'Erro'
                                   : `Código: ${msg.codigo}`}
                                </p>
                                <p className={`text-sm mt-1 ${subTextColor}`}>
                                  {msg.texto}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Raw Response */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">Resposta JSON</h4>
                        <Button variant="ghost" size="sm" onClick={handleCopyResponse}>
                          <Copy className="mr-1" size={14} />
                          Copiar
                        </Button>
                      </div>
                      <pre className="text-xs text-muted-foreground bg-background p-3 rounded border overflow-x-auto">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
