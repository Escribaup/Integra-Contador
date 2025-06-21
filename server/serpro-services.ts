// SERPRO Integra Contador Service Definitions
// Based on official SERPRO API documentation

export interface SerproServiceConfig {
  endpoint: string;
  idSistema: string;
  idServico: string;
  description: string;
  requiredParams: string[];
}

export const SERPRO_SERVICES: Record<string, SerproServiceConfig> = {
  'consultar-das': {
    endpoint: '/integra-contador/v1/Consultar',
    idSistema: 'PGDASD',
    idServico: 'CONSEXTRATO16',
    description: 'Consulta Extrato do DAS',
    requiredParams: ['numeroDas']
  },
  'gerar-das': {
    endpoint: '/integra-contador/v1/GerarDAS',
    idSistema: 'PGDASD', 
    idServico: 'GERADAS16',
    description: 'Geração de DAS',
    requiredParams: ['competencia', 'cnpj']
  },
  'consultar-situacao': {
    endpoint: '/integra-contador/v1/ConsultarSituacao',
    idSistema: 'PGDASD',
    idServico: 'CONSSIT16', 
    description: 'Consulta Situação Cadastral',
    requiredParams: ['cnpj']
  }
};

export function getServiceConfig(serviceName: string): SerproServiceConfig | null {
  return SERPRO_SERVICES[serviceName] || null;
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
      versaoSistema: "1.0",
      dados: JSON.stringify(parameters)
    }
  };
}