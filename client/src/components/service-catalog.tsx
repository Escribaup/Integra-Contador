import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, FileText, Search, Package, Power, Calendar, Building2, Calculator, FileX, Database, CreditCard, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ServiceConfig {
  serviceName: string;
  endpoint: string;
  idSistema: string;
  idServico: string;
  description: string;
  requiredParams: string[];
  optionalParams?: string[];
  category: string;
  subcategory: string;
  outputType: 'pdf' | 'json' | 'xml' | 'mixed';
  enabled: boolean;
  dateImplemented?: string;
}

interface ServiceCatalogData {
  categories: Record<string, Record<string, ServiceConfig[]>>;
  enabled: ServiceConfig[];
  totalServices: number;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Integra-MEI': return Building2;
    case 'Integra-SN': return Calculator;
    case 'Integra-DCTFWeb': return FileText;
    case 'Integra-Sicalc': return Calculator;
    case 'Integra-CaixaPostal': return Mail;
    case 'Integra-Pagamento': return CreditCard;
    case 'Integra-SITFIS': return Database;
    default: return Package;
  }
};

const getOutputTypeColor = (outputType: string) => {
  switch (outputType) {
    case 'pdf': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    case 'json': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'xml': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'mixed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

export default function ServiceCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch service catalog
  const { data: catalog, isLoading } = useQuery<ServiceCatalogData>({
    queryKey: ['/api/services'],
    refetchInterval: 30000
  });

  // Toggle service mutation
  const toggleServiceMutation = useMutation({
    mutationFn: async ({ serviceName, enabled }: { serviceName: string; enabled: boolean }) => {
      return apiRequest(`/api/services/${serviceName}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Status atualizado",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao alterar status do serviço",
        variant: "destructive",
      });
    }
  });

  const handleToggleService = (serviceName: string, enabled: boolean) => {
    toggleServiceMutation.mutate({ serviceName, enabled });
  };

  const filteredCategories = catalog?.categories ? Object.entries(catalog.categories).filter(([categoryName, subcategories]) => {
    if (selectedCategory && categoryName !== selectedCategory) return false;
    
    if (searchTerm) {
      return Object.entries(subcategories).some(([_, services]) =>
        services.some(service =>
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.idServico.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    return true;
  }) : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Catálogo de Serviços SERPRO</h2>
            <p className="text-muted-foreground">
              Gerencie e configure os serviços disponíveis do Integra Contador
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Power className="mr-1" size={14} />
              {catalog?.enabled.length || 0} habilitados
            </Badge>
            <Badge variant="outline">
              <Package className="mr-1" size={14} />
              {catalog?.totalServices || 0} total
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant={selectedCategory ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            Todas as Categorias
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
          {Object.keys(catalog?.categories || {}).map((category) => {
            const Icon = getCategoryIcon(category);
            return (
              <TabsTrigger key={category} value={category} className="text-xs flex items-center">
                <Icon size={14} className="mr-1" />
                {category.replace('Integra-', '')}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Service Categories */}
          {filteredCategories.map(([categoryName, subcategories]) => {
            const CategoryIcon = getCategoryIcon(categoryName);
            
            return (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CategoryIcon size={20} />
                    <span>{categoryName}</span>
                    <Badge variant="secondary">
                      {Object.values(subcategories).reduce((total, services) => total + services.length, 0)} serviços
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(subcategories).map(([subcategoryName, services]) => (
                      <AccordionItem key={subcategoryName} value={subcategoryName}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{subcategoryName}</span>
                            <Badge variant="outline" className="bg-muted">
                              {services.length} serviços
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {services.filter(s => s.enabled).length} ativos
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {services
                              .filter(service => 
                                !searchTerm || 
                                service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                service.idServico.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map((service) => (
                              <Card key={service.serviceName} className="bg-muted/30">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center space-x-3">
                                        <h4 className="font-medium text-foreground">
                                          {service.description}
                                        </h4>
                                        <Badge className={getOutputTypeColor(service.outputType)}>
                                          {service.outputType.toUpperCase()}
                                        </Badge>
                                        {service.dateImplemented && (
                                          <Badge variant="outline" className="text-xs">
                                            <Calendar size={12} className="mr-1" />
                                            {service.dateImplemented}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <span>ID: {service.idServico}</span>
                                        <span>Sistema: {service.idSistema}</span>
                                        <span>Serviço: {service.serviceName}</span>
                                      </div>
                                      {service.requiredParams.length > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                          Parâmetros: {service.requiredParams.join(', ')}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={service.enabled}
                                        onCheckedChange={(enabled) => handleToggleService(service.serviceName, enabled)}
                                        disabled={toggleServiceMutation.isPending}
                                      />
                                      {service.enabled ? (
                                        <Power className="text-green-600" size={16} />
                                      ) : (
                                        <Power className="text-muted-foreground" size={16} />
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Individual Category Tabs */}
        {Object.keys(catalog?.categories || {}).map((categoryName) => (
          <TabsContent key={categoryName} value={categoryName}>
            {/* Same content as above but filtered for this category */}
          </TabsContent>
        ))}
      </Tabs>

      {filteredCategories.length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileX className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os termos de busca ou filtros
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}