"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Activity, CheckCircle, AlertCircle } from "lucide-react"
import type { TuberculosisData, PredictionResponse } from "@/types/tuberculosis"

const TOTAL_STEPS = 13

const stepTitles = [
  "Idade",
  "Sexo",
  "Raça",
  "Zona de Residência",
  "Tipo de Entrada",
  "Radiografia de Tórax",
  "Forma de Tuberculose",
  "Agravante: AIDS",
  "Agravante: Alcoolismo",
  "Agravante: Diabetes",
  "Agravante: Doença Mental",
  "Baciloscopia",
  "Cultura de Escarro",
]

const options = {
  RacaOptions: {
    1: { value: 1, descr: "Branca" },
    2: { value: 2, descr: "Preta" },
    3: { value: 3, descr: "Amarela" },
    4: { value: 4, descr: "Parda" },
    9: { value: 9, descr: "Ignorado" },
  },
  ZonaOptions: {
    1: { value: 1, descr: "Urbana" },
    2: { value: 2, descr: "Rural" },
    9: { value: 9, descr: "Ignorado" },
  },
  TipoEntradaOptions: {
    1: { value: 1, descr: "Hospital" },
    2: { value: 2, descr: "Clínica" },
    3: { value: 3, descr: "Residência" },
    9: { value: 9, descr: "Ignorado" },
  },
  RadiografiaToraxOptions: {
    1: { value: 1, descr: "Normal" },
    2: { value: 2, descr: "Anormal" },
    9: { value: 9, descr: "Ignorado" },
  },
  FormaTuberculoseOptions: {
    1: { value: 1, descr: "Pulmonar" },
    2: { value: 2, descr: "Extra Pulmonar" },
    9: { value: 9, descr: "Ignorado" },
  },
  AgravanteOptions: {
    1: { value: 1, descr: "Sim" },
    2: { value: 2, descr: "Não" },
    9: { value: 9, descr: "Ignorado" },
  },
  BasciloscopiaOptions: {
    1: { value: 1, descr: "Positivo" },
    2: { value: 2, descr: "Negativo" },
    9: { value: 9, descr: "Ignorado" },
  },
  CulturaEscarroOptions: {
    1: { value: 1, descr: "Positivo" },
    2: { value: 2, descr: "Negativo" },
    9: { value: 9, descr: "Ignorado" },
  },
}

// Função auxiliar para obter a descrição de um valor
const getOptionDescription = (field: string, value: any): string => {
  if (!value) return "-"

  switch (field) {
    case "sexo":
      if (value === "1") return "Masculino"
      if (value === "2") return "Feminino"
      if (value === "9") return "Ignorado"
      return value
    case "raca":
      return Object.values(options.RacaOptions).find((opt) => opt.value === value)?.descr || value.toString()
    case "zona":
      return Object.values(options.ZonaOptions).find((opt) => opt.value === value)?.descr || value.toString()
    case "tipoEntrada":
      return Object.values(options.TipoEntradaOptions).find((opt) => opt.value === value)?.descr || value.toString()
    case "radiografiaTorax":
      return (
        Object.values(options.RadiografiaToraxOptions).find((opt) => opt.value === value)?.descr || value.toString()
      )
    case "formaTuberculose":
      return (
        Object.values(options.FormaTuberculoseOptions).find((opt) => opt.value === value)?.descr || value.toString()
      )
    case "agravanteAIDS":
    case "agravanteAlcoolismo":
    case "agravanteDiabetes":
    case "agravanteDoencaMental":
      return Object.values(options.AgravanteOptions).find((opt) => opt.value === value)?.descr || value.toString()
    case "baciloscopia":
      return Object.values(options.BasciloscopiaOptions).find((opt) => opt.value === value)?.descr || value.toString()
    case "culturaEscarro":
      return Object.values(options.CulturaEscarroOptions).find((opt) => opt.value === value)?.descr || value.toString()
    default:
      return value.toString()
  }
}

export default function TuberculosisAnalysisPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<TuberculosisData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: keyof TuberculosisData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user updates field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateCurrentStep = (): boolean => {
    if (currentStep === 0 && (!formData.idade || formData.idade < 0 || formData.idade > 120)) {
      setErrors({ idade: "Idade deve estar entre 0 e 120 anos" })
      return false
    }

    // Para os outros campos, verificar se o valor foi selecionado
    const fieldNames = [
      "idade",
      "sexo",
      "raca",
      "zona",
      "tipoEntrada",
      "radiografiaTorax",
      "formaTuberculose",
      "agravanteAIDS",
      "agravanteAlcoolismo",
      "agravanteDiabetes",
      "agravanteDoencaMental",
      "baciloscopia",
      "culturaEscarro",
    ]

    const currentField = fieldNames[currentStep]
    const currentValue = formData[currentField as keyof TuberculosisData]

    if (currentStep > 0 && (currentValue === undefined || currentValue === null || currentValue === "")) {
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
        error: "Erro de conexão com o servidor",
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
              onChange={(e) => updateFormData("idade", Number.parseInt(e.target.value) || 0)}
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
            <Select value={formData.sexo?.toString()} onValueChange={(value) => updateFormData("sexo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Masculino</SelectItem>
                <SelectItem value="2">Feminino</SelectItem>
                <SelectItem value="9">Ignorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <Label>Raça/Cor</Label>
            <Select
              value={formData.raca?.toString()}
              onValueChange={(value) => updateFormData("raca", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a raça/cor" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.RacaOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <Label>Zona de Residência</Label>
            <Select
              value={formData.zona?.toString()}
              onValueChange={(value) => updateFormData("zona", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a zona" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.ZonaOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <Label>Tipo de Entrada</Label>
            <Select
              value={formData.tipoEntrada?.toString()}
              onValueChange={(value) => updateFormData("tipoEntrada", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de entrada" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.TipoEntradaOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <Label>Radiografia de Tórax</Label>
            <Select
              value={formData.radiografiaTorax?.toString()}
              onValueChange={(value) => updateFormData("radiografiaTorax", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o resultado da radiografia" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.RadiografiaToraxOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <Label>Forma de Tuberculose</Label>
            <Select
              value={formData.formaTuberculose?.toString()}
              onValueChange={(value) => updateFormData("formaTuberculose", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de tuberculose" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.FormaTuberculoseOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <Label>Agravante: AIDS</Label>
            <Select
              value={formData.agravanteAIDS?.toString()}
              onValueChange={(value) => updateFormData("agravanteAIDS", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Paciente possui AIDS?" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.AgravanteOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <Label>Agravante: Alcoolismo</Label>
            <Select
              value={formData.agravanteAlcoolismo?.toString()}
              onValueChange={(value) => updateFormData("agravanteAlcoolismo", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Paciente possui alcoolismo?" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.AgravanteOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 9:
        return (
          <div className="space-y-4">
            <Label>Agravante: Diabetes</Label>
            <Select
              value={formData.agravanteDiabetes?.toString()}
              onValueChange={(value) => updateFormData("agravanteDiabetes", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Paciente possui diabetes?" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.AgravanteOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 10:
        return (
          <div className="space-y-4">
            <Label>Agravante: Doença Mental</Label>
            <Select
              value={formData.agravanteDoencaMental?.toString()}
              onValueChange={(value) => updateFormData("agravanteDoencaMental", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Paciente possui doença mental?" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.AgravanteOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 11:
        return (
          <div className="space-y-4">
            <Label>Baciloscopia</Label>
            <Select
              value={formData.baciloscopia?.toString()}
              onValueChange={(value) => updateFormData("baciloscopia", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Resultado da baciloscopia" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.BasciloscopiaOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 12:
        return (
          <div className="space-y-4">
            <Label>Cultura de Escarro</Label>
            <Select
              value={formData.culturaEscarro?.toString()}
              onValueChange={(value) => updateFormData("culturaEscarro", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Resultado da cultura de escarro" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options.CulturaEscarroOptions).map(([key, option]) => (
                  <SelectItem key={key} value={option.value.toString()}>
                    {option.descr}
                  </SelectItem>
                ))}
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
                    Análise realizada em: {new Date(result.timestamp).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={resetForm} variant="outline" className="flex-1 bg-transparent">
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
                <p className="text-lg font-semibold">{Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}%</p>
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
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              {currentStep === TOTAL_STEPS - 1 ? (
                <Button onClick={submitAnalysis} disabled={isSubmitting} className="flex items-center gap-2">
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
                <Button onClick={nextStep} className="flex items-center gap-2">
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
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                  <span className="font-medium">{getOptionDescription(key, value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
