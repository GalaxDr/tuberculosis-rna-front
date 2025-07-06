export interface TuberculosisData {
  idade: number
  sexo: string
  raca: number
  zona: number
  tipoEntrada: number
  radiografiaTorax: number
  formaTuberculose: number
  agravanteAIDS: number
  agravanteAlcoolismo: number
  agravanteDiabetes: number
  agravanteDoencaMental: number
  baciloscopia: number
  culturaEscarro: number
}

// Opção 1: Usando enums numéricos tradicionais
export enum SexoEnum {
  MASCULINO = 1,
  FEMININO = 2,
  IGNORADO = 9,
}

// Opção 2: Usando objetos constantes com descrição e valor
export const RacaOptions = {
  BRANCA: { descr: "Branca", value: 1 },
  PRETA: { descr: "Preta", value: 2 },
  AMARELA: { descr: "Amarela", value: 3 },
  PARDA: { descr: "Parda", value: 4 },
  INDIGENA: { descr: "Indígena", value: 5 },
  IGNORADO: { descr: "Ignorado", value: 9 },
} as const

export const ZonaOptions = {
  URBANA: { descr: "Urbana", value: 1 },
  RURAL: { descr: "Rural", value: 2 },
  PERIURBANA: { descr: "Periurbana", value: 3 },
  IGNORADO: { descr: "Ignorado", value: 9 },
} as const

export const TipoEntradaOptions = {
  CASO_NOVO: { descr: "Caso Novo", value: 1 },
  RECIDIVA: { descr: "Recidiva", value: 2 },
  REINGRESSO_APOS_ABANDONO: { descr: "Reingresso após Abandono", value: 3 },
  NAO_SABE: { descr: "Não Sabe", value: 4 },
  TRANSFERENCIA: { descr: "Transferência", value: 5 },
  POS_OBITO: { descr: "Pós Óbito", value: 6 },
} as const

export const RadiografiaToraxOptions = {
  NORMAL: { descr: "Normal", value: 1 },
  SUSPEITA: { descr: "Suspeita", value: 2 },
  OUTRA_PATOLOGIA: { descr: "Outra Patologia", value: 3 },
  NAO_REALIZADA: { descr: "Não Realizada", value: 4 },
} as const

export const FormaTuberculoseOptions = {
  PULMONAR: { descr: "Pulmonar", value: 1 },
  EXTRAPULMONAR: { descr: "Extrapulmonar", value: 2 },
  PULMONAR_EXTRAPULMONAR: { descr: "Pulmonar + Extrapulmonar", value: 3 },
} as const

export const AgravanteOptions = {
  SIM: { descr: "Sim", value: 1 },
  NAO: { descr: "Não", value: 2 },
  IGNORADO: { descr: "Ignorado", value: 9 },
} as const

export const BasciloscopiaOptions = {
  POSITIVA: { descr: "Positiva", value: 1 },
  NEGATIVA: { descr: "Negativa", value: 2 },
  NAO_REALIZADA: { descr: "Não Realizada", value: 3 },
  NAO_SE_APLICA: { descr: "Não se Aplica", value: 4 },
} as const

export const CulturaEscarroOptions = {
  POSITIVA: { descr: "Positiva", value: 1 },
  NEGATIVA: { descr: "Negativa", value: 2 },
  EM_ANDAMENTO: { descr: "Em Andamento", value: 3 },
  NAO_REALIZADA: { descr: "Não Realizada", value: 4 },
} as const

// Tipos derivados dos objetos
export type RacaEnum = (typeof RacaOptions)[keyof typeof RacaOptions]["value"]
export type ZonaEnum = (typeof ZonaOptions)[keyof typeof ZonaOptions]["value"]
export type TipoEntradaEnum = (typeof TipoEntradaOptions)[keyof typeof TipoEntradaOptions]["value"]
export type RadiografiaToraxEnum = (typeof RadiografiaToraxOptions)[keyof typeof RadiografiaToraxOptions]["value"]
export type FormaTuberculoseEnum = (typeof FormaTuberculoseOptions)[keyof typeof FormaTuberculoseOptions]["value"]
export type AgravanteEnum = (typeof AgravanteOptions)[keyof typeof AgravanteOptions]["value"]
export type BasciloscopiaEnum = (typeof BasciloscopiaOptions)[keyof typeof BasciloscopiaOptions]["value"]
export type CulturaEscarroEnum = (typeof CulturaEscarroOptions)[keyof typeof CulturaEscarroOptions]["value"]

export interface PredictionResponse {
  tempoCura: string
  probabilidade: number
  timestamp: string
  status: number
  error?: string
  entradaNeuronio?: number[] | null
  saidaRecognize?: number[] | null
}

// Novos tipos para treinamento
export interface TuberculosisRNACommand {
  encryptedFilePath: string
  numCamadas: number
  tamCamada: number
  taxaAprendizado: number
  margemErro: number
  numInteracoes: number
}

export interface TrainingResponse {
  success: boolean
  message: string
  modelId?: string
  timestamp: string
  status: number
  error?: string
}

export interface ModelStatus {
  isTrained: boolean
  modelId?: string
  trainedAt?: string
  parameters?: TuberculosisRNACommand
}
