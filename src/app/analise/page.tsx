"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Activity, CheckCircle, AlertCircle } from 'lucide-react'
import type {
  TuberculosisData,
  SexoEnum,
  RacaEnum,
  ZonaEnum,
  TipoEntradaEnum,
  RadiografiaToraxEnum,
  FormaTuberculoseEnum,
  AgravanteEnum,
  BasciloscopiaEnum,
  CulturaEscarroEnum,
  PredictionResponse
} from "@/types/tuberculosis"

const TOTAL_STEPS = 13

const stepTitles = [
  "Idade",
  "Sexo",
  "Raça",
  "Zona de Residência",
  "Tipo de Entrada",
  "Radiografia de Tórax",
  "Forma de Tuberculose",
  "Agravante AIDS",
  "Agravante Alcoolismo",
  "Agravante Diabetes",
  "Agravante Doença Mental",
  "Baciloscopia",
  "Cultura de Escarro"
]

export default function TuberculosisAnalysisPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<TuberculosisData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: keyof TuberculosisData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user updates field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateCurrentStep = (): boolean => {
    const currentField = Object.keys(formData)[currentStep]
    const currentValue = Object.values(formData)[currentStep]
    
    if (currentStep === 0 && (!formData.idade || formData.idade < 0 || formData.idade > 120)) {
      setErrors({ idade: "Idade deve estar entre 0 e 120 anos" })
      return false
    }
    
    if (currentStep > 0 && !currentValue) {
      setErrors({ [currentField]: "Este campo é obrigatório" })
      return false
    }
    
    return true
  }

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitAnalysis = async () => {
    if (!validateCurrentStep()) return

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch("/api/tuberculosis/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data: PredictionResponse = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        tempoCura: "",
        probabilidade: 0,
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Erro de conexão com o servidor"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({})
    setCurrentStep(0)
    setResult(null)
    setErrors({})
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Label htmlFor="idade">Idade do Paciente</Label>
            <Input
              id="idade"
              type="number"
              min="0"
              max="120"
              value={formData.idade || ""}
              onChange={(e) => updateFormData("idade", parseInt(e.target.value) || 0)}
              placeholder="Digite a idade"
              className={errors.idade ? "border-red-500" : ""}
            />
            {errors.idade && <p className="text-sm text-red-600">{errors.idade}</p>}
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <Label>Sexo</Label>
            <Select value={formData.sexo} onValueChange={(value) => updateFormData("sexo", value as SexoEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MASCULINO">Masculino</SelectItem>
                <SelectItem value="FEMININO">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <Label>Raça/Cor</Label>
            <Select value={formData.raca} onValueChange={(value) => updateFormData("raca", value as RacaEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a raça/cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRANCA">Branca</SelectItem>
                <SelectItem value="PRETA">Preta</SelectItem>
                <SelectItem value="AMARELA">Amarela</SelectItem>
                <SelectItem value="PARDA">Parda</SelectItem>
                <SelectItem value="INDIGENA">Indígena</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <Label>Zona de Residência</Label>
            <Select value={formData.zona} onValueChange={(value) => updateFormData("zona", value as ZonaEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="URBANA">Urbana</SelectItem>
                <SelectItem value="RURAL">Rural</SelectItem>
                <SelectItem value="PERIURBANA">Periurbana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <Label>Tipo de Entrada</Label>
            <Select value={formData.tipoEntrada} onValueChange={(value) => updateFormData("tipoEntrada", value as TipoEntradaEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de entrada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASO_NOVO">Caso Novo</SelectItem>
                <SelectItem value="RECIDIVA">Recidiva</SelectItem>
                <SelectItem value="REINGRESSO_APOS_ABANDONO">Reingresso após Abandono</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <Label>Radiografia de Tórax</Label>
            <Select value={formData.radiografiaTorax} onValueChange={(value) => updateFormData("radiografiaTorax", value as RadiografiaToraxEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o resultado da radiografia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="SUSPEITA">Suspeita</SelectItem>
                <SelectItem value="SUGESTIVA">Sugestiva</SelectItem>
                <SelectItem value="OUTRA_PATOLOGIA">Outra Patologia</SelectItem>
                <SelectItem value="NAO_REALIZADA">Não Realizada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <Label>Forma de Tuberculose</Label>
            <Select value={formData.formaTuberculose} onValueChange={(value) => updateFormData("formaTuberculose", value as FormaTuberculoseEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de tuberculose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PULMONAR">Pulmonar</SelectItem>
                <SelectItem value="EXTRAPULMONAR">Extrapulmonar</SelectItem>
                <SelectItem value="PULMONAR_EXTRAPULMONAR">Pulmonar + Extrapulmonar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <Label>Agravante: AIDS</Label>
            <Select value={formData.agravanteAIDS} onValueChange={(value) => updateFormData("agravanteAIDS", value as AgravanteEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Paciente possui AIDS?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM">Sim</SelectItem>
                <SelectItem value="NAO">Não</SelectItem>
                <SelectItem value="IGNORADO">Ignorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <Label>Agravante: Alcoolismo</Label>
            <Select value={formData.agravanteAlcoolismo} onValueChange={(value) => updateFormData("agravanteAlcoolismo", value as AgravanteEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Paciente possui alcoolismo?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM">Sim</SelectItem>
                <SelectItem value="NAO">Não</SelectItem>
                <SelectItem value="IGNORADO">Ignorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 9:
        return (
          <div className="space-y-4">
            <Label>Agravante: Diabetes</Label>
            <Select value={formData.agravanteDiabetes} onValueChange={(value) => updateFormData("agravanteDiabetes", value as AgravanteEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Paciente possui diabetes?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM">Sim</SelectItem>
                <SelectItem value="NAO">Não</SelectItem>
                <SelectItem value="IGNORADO">Ignorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 10:
        return (
          <div className="space-y-4">
            <Label>Agravante: Doença Mental</Label>
            <Select value={formData.agravanteDoencaMental} onValueChange={(value) => updateFormData("agravanteDoencaMental", value as AgravanteEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Paciente possui doença mental?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM">Sim</SelectItem>
                <SelectItem value="NAO">Não</SelectItem>
                <SelectItem value="IGNORADO">Ignorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 11:
        return (
          <div className="space-y-4">
            <Label>Baciloscopia</Label>
            <Select value={formData.baciloscopia} onValueChange={(value) => updateFormData("baciloscopia", value as BasciloscopiaEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Resultado da baciloscopia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POSITIVA">Positiva</SelectItem>
                <SelectItem value="NEGATIVA">Negativa</SelectItem>
                <SelectItem value="NAO_REALIZADA">Não Realizada</SelectItem>
                <SelectItem value="NAO_SE_APLICA">Não se Aplica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 12:
        return (
          <div className="space-y-4">
            <Label>Cultura de Escarro</Label>
            <Select value={formData.culturaEscarro} onValueChange={(value) => updateFormData("culturaEscarro", value as CulturaEscarroEnum)}>
              <SelectTrigger>
                <SelectValue placeholder="Resultado da cultura de escarro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POSITIVA">Positiva</SelectItem>
                <SelectItem value="NEGATIVA">Negativa</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                <SelectItem value="NAO_REALIZADA">Não Realizada</SelectItem>
                <SelectItem value="NAO_SE_APLICA">Não se Aplica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      default:
        return null
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {result.error ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.error ? (
                <Alert className="border-red-500">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <p className="font-medium text-red-800">Erro na análise</p>
                    <p className="text-sm text-red-700 mt-1">{result.error}</p>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Tempo de Cura Previsto</h3>
                    <p className="text-3xl font-bold text-green-900">{result.tempoCura}</p>
                    {result.probabilidade && (
                      <p className="text-sm text-green-700 mt-2">
                        Probabilidade: {(result.probabilidade * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Análise realizada em: {new Date(result.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Nova Análise
                </Button>
                <Button onClick={() => window.print()} className="flex-1">
                  Imprimir Resultado
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Análise de Tuberculose RNA</h1>
          <p className="text-gray-600">Preencha os dados do paciente para análise do tempo de cura</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {stepTitles[currentStep]}
                </CardTitle>
                <CardDescription>
                  Passo {currentStep + 1} de {TOTAL_STEPS}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Progresso</p>
                <p className="text-lg font-semibold">
                  {Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}%
                </p>
              </div>
            </div>
            <Progress value={((currentStep + 1) / TOTAL_STEPS) * 100} className="mt-4" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderStepContent()}
            
            <div className="flex justify-between pt-4">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              {currentStep === TOTAL_STEPS - 1 ? (
                <Button
                  onClick={submitAnalysis}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      Analisar
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-medium">{value || '-'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
