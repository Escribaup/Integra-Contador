import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, FileText, Download, Eye, Copy, Play, Settings, Calendar, Building2, Calculator, FileX, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ServiceCatalog from "./service-catalog";

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
    id: "mei",
    name: "MEI - Microempreendedor Individual",
    description: "Gerar DAS MEI, consultar situação, certificados",
    icon: Building2,
    serviceCount: 7,
    color: "blue",
  },
  {
    id: "simples-nacional",
    name: "Simples Nacional",
    description: "Declarações, DAS, consultas do Simples Nacional",
    icon: Calculator,
    serviceCount: 15,
    color: "green",
  },
  {
    id: "dctfweb",
    name: "DCTFWeb",
    description: "Declarações DCTFWeb, guias, recibos",
    icon: FileText,
    serviceCount: 6,
    color: "purple",
  },
  {
    id: "outros",
    name: "Outros Serviços",
    description: "Sicalc, CaixaPostal, SITFIS, Pagamentos",
    icon: Package,
    serviceCount: 12,
    color: "orange",
  },
];

export default function ServicesModule() {
  const [selectedService, setSelectedService] = useState("mei-gerar-das-pdf");
  const [serviceParameters, setServiceParameters] = useState<Record<string, string>>({
    contratante: "10781350000196",
    autorPedidoDados: "10781350000196", 
    contribuinte: "49698869000140",
    periodoApuracao: "202507"
  });
  const [apiResponse, setApiResponse] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch enabled services
  const { data: servicesData } = useQuery({
    queryKey: ['/api/services'],
    refetchInterval: 30000
  });

  const executeServiceMutation = useMutation({
    mutationFn: async (data: { serviceName: string; parameters: Record<string, string> }) => {
      const response = await fetch('/api/services/execute', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Falha na execução do serviço');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setApiResponse(data);
      toast({
        title: "Serviço executado",
        description: "Resposta recebida com sucesso",
      });
    },
    onError: (error: any) => {
      setApiResponse(error.response || { error: error.message });
      toast({
        title: "Erro na execução",
        description: error.message || "Falha ao executar serviço",
        variant: "destructive",
      });
    }
  });

  const handleExecuteService = () => {
    executeServiceMutation.mutate({
      serviceName: selectedService,
      parameters: serviceParameters
    });
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
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  const enabledServices = servicesData?.enabled || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Serviços SERPRO</h2>
        <p className="text-muted-foreground">
          Execute serviços do Integra Contador e gerencie configurações
        </p>
      </div>

      <Tabs defaultValue="execute" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="execute" className="flex items-center space-x-2">
            <Play size={16} />
            <span>Executar Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center space-x-2">
            <Settings size={16} />
            <span>Gerenciar Catálogo</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="execute" className="space-y-6">
          {/* Service Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getColorClasses(category.color)}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <Badge variant="secondary">{category.serviceCount}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Service Execution Form */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Play className="text-primary" size={20} />
                  <h3 className="text-lg font-medium text-foreground">Executar Serviço</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {enabledServices.map((service: any) => (
                          <SelectItem key={service.serviceName} value={service.serviceName}>
                            {service.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contribuinte">CNPJ Contribuinte</Label>
                    <Input
                      id="contribuinte"
                      placeholder="00.000.000/0000-00"
                      value={serviceParameters.contribuinte}
                      onChange={(e) => setServiceParameters(prev => ({ ...prev, contribuinte: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contratante">CNPJ Contratante</Label>
                    <Input
                      id="contratante"
                      placeholder="00.000.000/0000-00"
                      value={serviceParameters.contratante}
                      onChange={(e) => setServiceParameters(prev => ({ ...prev, contratante: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autorPedidoDados">Autor Pedido Dados</Label>
                    <Input
                      id="autorPedidoDados"
                      placeholder="00.000.000/0000-00"
                      value={serviceParameters.autorPedidoDados}
                      onChange={(e) => setServiceParameters(prev => ({ ...prev, autorPedidoDados: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="periodoApuracao">Período Apuração (AAAAMM)</Label>
                    <Input
                      id="periodoApuracao"
                      placeholder="202507"
                      value={serviceParameters.periodoApuracao}
                      onChange={(e) => setServiceParameters(prev => ({ ...prev, periodoApuracao: e.target.value }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleExecuteService}
                    disabled={executeServiceMutation.isPending}
                    className="bg-primary hover:bg-primary-600"
                  >
                    {executeServiceMutation.isPending ? "Executando..." : "Executar Serviço"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                                DAS_MEI_{serviceParameters.contribuinte}_{serviceParameters.periodoApuracao}.pdf
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
                              Download
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
        </TabsContent>

        <TabsContent value="catalog">
          <ServiceCatalog />
        </TabsContent>
      </Tabs>
    </div>
  );
}