// SERPRO Integra Contador Service Definitions
// Based on official SERPRO API documentation and catalog

export interface SerproServiceConfig {
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

export const SERPRO_SERVICES: Record<string, SerproServiceConfig> = {
  // Integra-MEI - PGMEI
  "mei-gerar-das-pdf": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGMEI",
    idServico: "GERARDASPDF21",
    description: "Gerar DAS em PDF",
    requiredParams: ["periodoApuracao"],
    category: "Integra-MEI",
    subcategory: "PGMEI",
    outputType: "pdf",
    enabled: true,
    dateImplemented: "23/09/2022"
  },
  "mei-gerar-das-codbarra": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGMEI", 
    idServico: "GERARDASCODBARRA22",
    description: "Gerar DAS em código de barras",
    requiredParams: ["periodoApuracao"],
    category: "Integra-MEI",
    subcategory: "PGMEI",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "mei-atualizar-beneficio": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGMEI",
    idServico: "ATUBENEFICIO23",
    description: "Atualizar Benefício",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "PGMEI", 
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "mei-consultar-divida-ativa": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGMEI",
    idServico: "DIVIDAATIVA24",
    description: "Consultar Dívida Ativa",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "PGMEI",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },

  // Integra-MEI - CCMEI
  "ccmei-emitir": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "CCMEI",
    idServico: "EMITIRCCMEI121",
    description: "Emissão do Certificado de Condição de MEI em formato PDF",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "CCMEI",
    outputType: "pdf",
    enabled: false,
    dateImplemented: "01/10/2024"
  },
  "ccmei-consultar-dados": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "CCMEI",
    idServico: "DADOSCCMEI122",
    description: "Consulta os dados do Certificado de Condição MEI",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "CCMEI",
    outputType: "json",
    enabled: false,
    dateImplemented: "01/10/2024"
  },
  "ccmei-situacao-cadastral": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "CCMEI",
    idServico: "CCMEISITCADASTRAL123",
    description: "Consulta a situação cadastral dos CNPJ MEI vinculados ao CPF",
    requiredParams: [],
    category: "Integra-MEI",
    subcategory: "CCMEI",
    outputType: "json",
    enabled: false,
    dateImplemented: "01/10/2024"
  },

  // Integra-SN - PGDASD
  "sn-transmitir-declaracao": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGDASD",
    idServico: "TRANSDECLARACAO11",
    description: "Entregar declaração mensal",
    requiredParams: ["periodoApuracao"],
    category: "Integra-SN",
    subcategory: "PGDASD",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "sn-gerar-das": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGDASD",
    idServico: "GERARDAS12",
    description: "Gerar DAS",
    requiredParams: ["periodoApuracao"],
    category: "Integra-SN",
    subcategory: "PGDASD",
    outputType: "pdf",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "sn-consultar-declaracoes": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGDASD",
    idServico: "CONSDECLARACAO13",
    description: "Consultar Declarações transmitidas",
    requiredParams: [],
    category: "Integra-SN",
    subcategory: "PGDASD",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "sn-consultar-ultima-declaracao": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGDASD",
    idServico: "CONSULTIMADECREC14",
    description: "Consultar a Última Declaração/Recibo transmitida",
    requiredParams: [],
    category: "Integra-SN",
    subcategory: "PGDASD",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "sn-consultar-declaracao-recibo": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGDASD",
    idServico: "CONSDECREC15",
    description: "Consultar Declaração/Recibo",
    requiredParams: ["numeroDeclaracao"],
    category: "Integra-SN",
    subcategory: "PGDASD",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "sn-consultar-extrato-das": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGDASD",
    idServico: "CONSEXTRATO16",
    description: "Consultar Extrato do DAS",
    requiredParams: ["numeroDas"],
    category: "Integra-SN",
    subcategory: "PGDASD",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },

  // Integra-SN - REGIMEAPURACAO
  "sn-optar-regime": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "REGIMEAPURACAO",
    idServico: "EFETUAROPCAOREGIME101",
    description: "Efetuar a opção pelo Regime de Apuração de Receitas",
    requiredParams: ["tipoRegime"],
    category: "Integra-SN",
    subcategory: "REGIMEAPURACAO",
    outputType: "json",
    enabled: false,
    dateImplemented: "24/07/2023"
  },

  // Integra-DCTFWeb - DCTFWEB
  "dctfweb-gerar-guia": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "DCTFWEB",
    idServico: "GERARGUIA31",
    description: "Gerar Guia Declaração",
    requiredParams: ["periodoApuracao"],
    category: "Integra-DCTFWeb",
    subcategory: "DCTFWEB",
    outputType: "pdf",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "dctfweb-consultar-recibo": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "DCTFWEB",
    idServico: "CONSRECIBO32",
    description: "Consultar o Recibo da Declaração",
    requiredParams: ["numeroRecibo"],
    category: "Integra-DCTFWeb",
    subcategory: "DCTFWEB",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "dctfweb-consultar-declaracao-completa": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "DCTFWEB",
    idServico: "CONSDECCOMPLETA33",
    description: "Consultar Declaração Completa",
    requiredParams: ["numeroDeclaracao"],
    category: "Integra-DCTFWeb",
    subcategory: "DCTFWEB",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },

  // Integra-Sicalc - SICALC
  "sicalc-gerar-darf": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "SICALC",
    idServico: "CONSOLIDARGERARDARF51",
    description: "Consolidar e Emitir um DARF em documento PDF",
    requiredParams: ["codigoReceita", "periodoApuracao"],
    category: "Integra-Sicalc",
    subcategory: "SICALC",
    outputType: "pdf",
    enabled: false,
    dateImplemented: "23/09/2022"
  },
  "sicalc-consultar-receitas": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "SICALC",
    idServico: "CONSULTAAPOIORECEITAS52",
    description: "Apoio de consulta Receitas do Sicalc",
    requiredParams: [],
    category: "Integra-Sicalc",
    subcategory: "SICALC",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },

  // Integra-CaixaPostal - CAIXAPOSTAL
  "caixapostal-consultar-mensagens": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "CAIXAPOSTAL",
    idServico: "MSGCONTRIBUINTE61",
    description: "Consulta de Mensagens por Contribuinte",
    requiredParams: [],
    category: "Integra-CaixaPostal",
    subcategory: "CAIXAPOSTAL",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },

  // Integra-Pagamento - PAGTOWEB
  "pagamento-consultar": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PAGTOWEB",
    idServico: "PAGAMENTOS71",
    description: "Consulta Pagamentos",
    requiredParams: [],
    category: "Integra-Pagamento",
    subcategory: "PAGTOWEB",
    outputType: "json",
    enabled: false,
    dateImplemented: "23/09/2022"
  },

  // Integra-SITFIS - SITFIS
  "sitfis-solicitar-protocolo": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "SITFIS",
    idServico: "SOLICITARPROTOCOLO91",
    description: "Solicitação de geração de protocolo para baixar o relatório de Situação Fiscal",
    requiredParams: [],
    category: "Integra-SITFIS",
    subcategory: "SITFIS",
    outputType: "json",
    enabled: false,
    dateImplemented: "01/09/2023"
  },
  "sitfis-relatorio": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "SITFIS",
    idServico: "RELATORIOSITFIS92",
    description: "Emissão de Relatório de Situação Fiscal",
    requiredParams: ["protocoloSolicitacao"],
    category: "Integra-SITFIS",
    subcategory: "SITFIS",
    outputType: "pdf",
    enabled: false,
    dateImplemented: "01/09/2023"
  },

  // Legacy compatibility
  "mei": {
    endpoint: "/integra-contador/v1/Emitir",
    idSistema: "PGMEI",
    idServico: "GERARDASPDF21",
    description: "Gerar DAS MEI (compatibilidade)",
    requiredParams: ["periodoApuracao"],
    category: "Integra-MEI",
    subcategory: "PGMEI",
    outputType: "pdf",
    enabled: true,
    dateImplemented: "23/09/2022"
  }
};

export function getServiceConfig(serviceName: string): SerproServiceConfig | null {
  return SERPRO_SERVICES[serviceName] || null;
}

export function getServicesByCategory(): Record<string, Record<string, (SerproServiceConfig & { serviceName: string })[]>> {
  const categories: Record<string, Record<string, (SerproServiceConfig & { serviceName: string })[]>> = {};
  
  Object.entries(SERPRO_SERVICES).forEach(([key, service]) => {
    // Skip legacy compatibility services in categorization
    if (key === 'mei') return;
    
    if (!categories[service.category]) {
      categories[service.category] = {};
    }
    if (!categories[service.category][service.subcategory]) {
      categories[service.category][service.subcategory] = [];
    }
    categories[service.category][service.subcategory].push({
      ...service,
      serviceName: key
    });
  });
  
  return categories;
}

export function getEnabledServices(): (SerproServiceConfig & { serviceName: string })[] {
  return Object.entries(SERPRO_SERVICES)
    .filter(([_, service]) => service.enabled)
    .map(([key, service]) => ({ ...service, serviceName: key }));
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
  parameters: any,
  contratante: string,
  autorPedidoDados: string,
  contribuinte: string
) {
  const config = getServiceConfig(serviceName);
  if (!config) {
    throw new Error(`Serviço não encontrado: ${serviceName}`);
  }

  // Para serviços MEI, preparar os dados específicos
  let dadosFormatados: any;
  
  if (config.idSistema === 'PGMEI') {
    // Para MEI, usar apenas os parâmetros específicos do serviço
    let periodo = parameters.periodoApuracao || parameters.competencia;
    
    // Converter formato "YYYY-MM" para "YYYYMM" se necessário
    if (periodo && periodo.includes('-')) {
      periodo = periodo.replace('-', '');
    }
    
    dadosFormatados = {
      periodoApuracao: periodo
    };
    
    // Adicionar dataConsolidacao se fornecida
    if (parameters.dataConsolidacao) {
      dadosFormatados.dataConsolidacao = parameters.dataConsolidacao;
    }
  } else {
    // Para outros serviços, usar todos os parâmetros
    dadosFormatados = parameters;
  }

  return {
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
      dados: JSON.stringify(dadosFormatados)
    }
  };
}