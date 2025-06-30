export interface TuberculosisData {
  idade: number
  sexo: SexoEnum
  raca: RacaEnum
  zona: ZonaEnum
  tipoEntrada: TipoEntradaEnum
  radiografiaTorax: RadiografiaToraxEnum
  formaTuberculose: FormaTuberculoseEnum
  agravanteAIDS: AgravanteEnum
  agravanteAlcoolismo: AgravanteEnum
  agravanteDiabetes: AgravanteEnum
  agravanteDoencaMental: AgravanteEnum
  baciloscopia: BasciloscopiaEnum
  culturaEscarro: CulturaEscarroEnum
}

export enum SexoEnum {
  MASCULINO = "MASCULINO",
  FEMININO = "FEMININO"
}

export enum RacaEnum {
  BRANCA = "BRANCA",
  PRETA = "PRETA",
  AMARELA = "AMARELA",
  PARDA = "PARDA",
  INDIGENA = "INDIGENA"
}

export enum ZonaEnum {
  URBANA = "URBANA",
  RURAL = "RURAL",
  PERIURBANA = "PERIURBANA"
}

export enum TipoEntradaEnum {
  CASO_NOVO = "CASO_NOVO",
  RECIDIVA = "RECIDIVA",
  REINGRESSO_APOS_ABANDONO = "REINGRESSO_APOS_ABANDONO",
  TRANSFERENCIA = "TRANSFERENCIA"
}

export enum RadiografiaToraxEnum {
  NORMAL = "NORMAL",
  SUSPEITA = "SUSPEITA",
  SUGESTIVA = "SUGESTIVA",
  OUTRA_PATOLOGIA = "OUTRA_PATOLOGIA",
  NAO_REALIZADA = "NAO_REALIZADA"
}

export enum FormaTuberculoseEnum {
  PULMONAR = "PULMONAR",
  EXTRAPULMONAR = "EXTRAPULMONAR",
  PULMONAR_EXTRAPULMONAR = "PULMONAR_EXTRAPULMONAR"
}

export enum AgravanteEnum {
  SIM = "SIM",
  NAO = "NAO",
  IGNORADO = "IGNORADO"
}

export enum BasciloscopiaEnum {
  POSITIVA = "POSITIVA",
  NEGATIVA = "NEGATIVA",
  NAO_REALIZADA = "NAO_REALIZADA",
  NAO_SE_APLICA = "NAO_SE_APLICA"
}

export enum CulturaEscarroEnum {
  POSITIVA = "POSITIVA",
  NEGATIVA = "NEGATIVA",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  NAO_REALIZADA = "NAO_REALIZADA",
  NAO_SE_APLICA = "NAO_SE_APLICA"
}

export interface PredictionResponse {
  tempoCura: string
  probabilidade: number
  timestamp: string
  status: number
  error?: string
}