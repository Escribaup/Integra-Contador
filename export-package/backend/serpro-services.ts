// SERPRO Integra Contador Service Definitions
// Based on official SERPRO API documentation and catalog

export interface SerproServiceConfig {
  endpoint: '/integra-contador/v1/Apoiar' | '/integra-contador/v1/Consultar' | '/integra-contador/v1/Declarar' | '/integra-contador/v1/Emitir' | '/integra-contador/v1/Monitorar';
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
  apiType: 'Apoiar' | 'Consultar' | 'Declarar' | 'Emitir' | 'Monitorar';
  versaoSistema?: string;
  specificDataStructure?: Record<string, any>;
}

export const SERPRO_SERVICES: Record<string, SerproServiceConfig> = {
  // ===== CONSULTAR SERVICES =====
  "ccmei-consultar-dados": {
    endpoint: "/integra-contador/v1/Consultar",
    apiType: "Consultar",
    idSistema: "CCMEI",
    idServico: "DADOSCCMEI122",
    description: "Consulta os dados do Certificado de Condição MEI",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "CCMEI",
    outputType: "json",
    enabled: false,
    dateImplemented: "01/10/2024",
    versaoSistema: "1.0"
  },
  "ccmei-situacao-cadastral": {
    endpoint: "/integra-contador/v1/Consultar",
    apiType: "Consultar",
    idSistema: "CCMEI",
    idServico: "CCMEISITCADASTRAL123",
    description: "Consulta a situação cadastral dos CNPJ MEI vinculados ao CPF",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "CCMEI",
    outputType: "json",
    enabled: false,
    dateImplemented: "01/10/2024",
    versaoSistema: "1.0"
  },
  "mei-consultar-divida-ativa": {
    endpoint: "/integra-contador/v1/Consultar",
    apiType: "Consultar",
    idSistema: "PGMEI",
    idServico: "DIVIDAATIVA24",
    description: "Consultar Dívida Ativa",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "PGMEI",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022",
    versaoSistema: "1.0"
  },

  // ===== EMITIR SERVICES =====
  "mei-gerar-das-pdf": {
    endpoint: "/integra-contador/v1/Emitir",
    apiType: "Emitir",
    idSistema: "PGMEI",
    idServico: "GERARDASPDF21",
    description: "Gerar DAS MEI em PDF",
    requiredParams: ["periodoApuracao"],
    category: "Integra-MEI",
    subcategory: "PGMEI",
    outputType: "pdf",
    enabled: true,
    dateImplemented: "23/09/2022",
    versaoSistema: "1.0"
  },
  "ccmei-emitir": {
    endpoint: "/integra-contador/v1/Emitir",
    apiType: "Emitir",
    idSistema: "CCMEI",
    idServico: "EMITIRCCMEI121",
    description: "Emissão do Certificado de Condição de MEI em formato PDF",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "CCMEI",
    outputType: "pdf",
    enabled: false,
    dateImplemented: "01/10/2024",
    versaoSistema: "1.0"
  },
  "sn-gerar-das": {
    endpoint: "/integra-contador/v1/Emitir",
    apiType: "Emitir",
    idSistema: "SN",
    idServico: "GERARDASSN32",
    description: "Gerar DAS Simples Nacional",
    requiredParams: ["competencia"],
    category: "Integra-SN",
    subcategory: "SN",
    outputType: "pdf",
    enabled: false,
    dateImplemented: "23/09/2022",
    versaoSistema: "1.0"
  },
  "dctfweb-gerar-guia": {
    endpoint: "/integra-contador/v1/Emitir",
    apiType: "Emitir",
    idSistema: "DCTFWEB",
    idServico: "GERARGUIA34",
    description: "Gerar Guia DCTFWeb",
    requiredParams: ["competencia", "codigoReceita"],
    category: "Integra-DCTFWeb",
    subcategory: "DCTFWEB",
    outputType: "pdf",
    enabled: false,
    dateImplemented: "23/09/2022",
    versaoSistema: "1.0"
  },

  // ===== DECLARAR SERVICES =====
  "dctfweb-transmitir": {
    endpoint: "/integra-contador/v1/Declarar",
    apiType: "Declarar",
    idSistema: "DCTFWEB",
    idServico: "TRANSMITIR30",
    description: "Transmitir DCTFWeb",
    requiredParams: ["competencia", "arquivo"],
    category: "Integra-DCTFWeb",
    subcategory: "DCTFWEB",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022",
    versaoSistema: "1.0"
  },

  // ===== MONITORAR SERVICES =====
  "caixapostal-listar-mensagens": {
    endpoint: "/integra-contador/v1/Monitorar",
    apiType: "Monitorar",
    idSistema: "CAIXAPOSTAL",
    idServico: "LISTARMENSAGENS37",
    description: "Listar Mensagens Caixa Postal",
    requiredParams: [],
    optionalParams: ["dataInicio", "dataFim"],
    category: "Integra-CaixaPostal",
    subcategory: "CAIXAPOSTAL",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022",
    versaoSistema: "1.0"
  }
};

export function getServiceConfig(serviceName: string): SerproServiceConfig | null {
  return SERPRO_SERVICES[serviceName] || null;
}

export function getServicesByCategory(): Record<string, Record<string, (SerproServiceConfig & { serviceName: string })[]>> {
  const categories: Record<string, Record<string, (SerproServiceConfig & { serviceName: string })[]>> = {};
  
  Object.entries(SERPRO_SERVICES).forEach(([serviceName, config]) => {
    if (!categories[config.category]) {
      categories[config.category] = {};
    }
    if (!categories[config.category][config.subcategory]) {
      categories[config.category][config.subcategory] = [];
    }
    categories[config.category][config.subcategory].push({
      ...config,
      serviceName
    });
  });
  
  return categories;
}

export function getServicesByApiType(): Record<string, (SerproServiceConfig & { serviceName: string })[]> {
  const apiTypes: Record<string, (SerproServiceConfig & { serviceName: string })[]> = {
    Apoiar: [],
    Consultar: [],
    Declarar: [],
    Emitir: [],
    Monitorar: []
  };
  
  Object.entries(SERPRO_SERVICES).forEach(([serviceName, config]) => {
    apiTypes[config.apiType].push({
      ...config,
      serviceName
    });
  });
  
  return apiTypes;
}

export function getEnabledServices(): (SerproServiceConfig & { serviceName: string })[] {
  return Object.entries(SERPRO_SERVICES)
    .filter(([_, config]) => config.enabled)
    .map(([serviceName, config]) => ({ ...config, serviceName }));
}

export function enableService(serviceName: string): boolean {
  if (SERPRO_SERVICES[serviceName]) {
    SERPRO_SERVICES[serviceName].enabled = true;
    return true;
  }
  return false;
}

export function disableService(serviceName: string): boolean {
  if (SERPRO_SERVICES[serviceName]) {
    SERPRO_SERVICES[serviceName].enabled = false;
    return true;
  }
  return false;
}

export function buildServiceRequest(
  serviceName: string,
  parameters: Record<string, string>,
  contratante: string,
  autorPedidoDados: string,
  contribuinte: string
): any {
  const config = getServiceConfig(serviceName);
  if (!config) {
    throw new Error(`Service ${serviceName} not found`);
  }

  // Build the dados object with service-specific parameters
  const dados: Record<string, any> = {};
  
  // Add required parameters
  config.requiredParams.forEach(param => {
    if (parameters[param] !== undefined) {
      dados[param] = parameters[param];
    }
  });
  
  // Add optional parameters if provided
  config.optionalParams?.forEach(param => {
    if (parameters[param] !== undefined) {
      dados[param] = parameters[param];
    }
  });

  // Build the complete request structure
  const request = {
    contratante: {
      numero: contratante,
      tipo: 2
    },
    autorPedidoDados: {
      numero: autorPedidoDados,
      tipo: 2
    },
    contribuinte: {
      numero: contribuinte,
      tipo: 2
    },
    pedidoDados: {
      idSistema: config.idSistema,
      idServico: config.idServico,
      versaoSistema: config.versaoSistema || "1.0",
      dados: JSON.stringify(dados)
    }
  };

  return request;
}