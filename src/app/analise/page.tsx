"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Activity, CheckCircle, AlertCircle, ArrowLeft, Brain } from "lucide-react"
import type { TuberculosisData, PredictionResponse, ModelStatus } from "@/types/tuberculosis"
import Link from "next/link"

const TOTAL_STEPS = 13

const stepTitles = [
  "Idade",
  "Sexo",
  "Raça",
  "Zona",
  "Tipo de Entrada",
  "Radiografia",
  "Forma TB",
  "AIDS",
  "Alcoolismo",
  "Diabetes",
  "Doença Mental",
  "Baciloscopia",
  "Cultura",
]

const options = {
  sexo: [
    { value: "M", label: "Masculino" },
    { value: "F", label: "Feminino" },
  ],
  raca: [
    { value: 1, label: "Branca" },
    { value: 2, label: "Preta" },
    { value: 3, label: "Amarela" },
    { value: 4, label: "Parda" },
    { value: 5, label: "Indígena" },
    { value: 9, label: "Ignorado" },
  ],
  zona: [
    { value: 1, label: "Urbana" },
    { value: 2, label: "Rural" },
    { value: 3, label: "Periurbana" },
    { value: 9, label: "Ignorado" },
  ],
  tipoEntrada: [
    { value: 1, label: "Caso Novo" },
    { value: 2, label: "Recidiva" },
    { value: 3, label: "Reingresso" },
    { value: 4, label: "Não Sabe" },
    { value: 5, label: "Transferência" },
    { value: 6, label: "Pós Óbito" },
  ],
  radiografiaTorax: [
    { value: 1, label: "Normal" },
    { value: 2, label: "Suspeita" },
    { value: 3, label: "Outra Patologia" },
    { value: 4, label: "Não Realizada" },
  ],
  formaTuberculose: [
    { value: 1, label: "Pulmonar" },
    { value: 2, label: "Extrapulmonar" },
    { value: 3, label: "Pulmonar + Extra" },
  ],
  agravante: [
    { value: 1, label: "Sim" },
    { value: 2, label: "Não" },
    { value: 9, label: "Ignorado" },
  ],
  baciloscopia: [
    { value: 1, label: "Positiva" },
    { value: 2, label: "Negativa" },
    { value: 3, label: "Não Realizada" },
    { value: 4, label: "Não se Aplica" },
  ],
  culturaEscarro: [
    { value: 1, label: "Positiva" },
    { value: 2, label: "Negativa" },
    { value: 3, label: "Em Andamento" },
    { value: 4, label: "Não Realizada" },
  ],
}

export default function TuberculosisAnalysisPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<TuberculosisData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [modelStatus, setModelStatus] = useState<ModelStatus>({ isTrained: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkModelStatus()
  }, [])

  const checkModelStatus = async () => {
    try {
      const response = await fetch("/api/tuberculosis/model-status")
      const status: ModelStatus = await response.json()
      setModelStatus(status)
    } catch (error) {
      console.error("Erro ao verificar status do modelo:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof TuberculosisData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitAnalysis = async () => {
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch("/api/tuberculosis/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        error: error instanceof Error ? error.message : "Erro de conexão com o servidor",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({})
    setCurrentStep(0)
    setResult(null)
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
              min="1"
              max="100"
              value={formData.idade || ""}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value)
                if (value >= 1 && value <= 100) {
                  updateFormData("idade", value)
                } else if (e.target.value === "") {
                  updateFormData("idade", "")
                }
              }}
              placeholder="Digite a idade (1-100 anos)"
            />
            {formData.idade && (formData.idade < 1 || formData.idade > 100) && (
              <p className="text-sm text-red-600">A idade deve estar entre 1 e 100 anos</p>
            )}
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <Label>Sexo</Label>
            <Select value={formData.sexo || ""} onValueChange={(value) => updateFormData("sexo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                {options.sexo.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <Label>Raça/Cor</Label>
            <Select
              value={formData.raca?.toString() || ""}
              onValueChange={(value) => updateFormData("raca", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a raça/cor" />
              </SelectTrigger>
              <SelectContent>
                {options.raca.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.zona?.toString() || ""}
              onValueChange={(value) => updateFormData("zona", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a zona" />
              </SelectTrigger>
              <SelectContent>
                {options.zona.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.tipoEntrada?.toString() || ""}
              onValueChange={(value) => updateFormData("tipoEntrada", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de entrada" />
              </SelectTrigger>
              <SelectContent>
                {options.tipoEntrada.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.radiografiaTorax?.toString() || ""}
              onValueChange={(value) => updateFormData("radiografiaTorax", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o resultado" />
              </SelectTrigger>
              <SelectContent>
                {options.radiografiaTorax.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.formaTuberculose?.toString() || ""}
              onValueChange={(value) => updateFormData("formaTuberculose", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma" />
              </SelectTrigger>
              <SelectContent>
                {options.formaTuberculose.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.agravanteAIDS?.toString() || ""}
              onValueChange={(value) => updateFormData("agravanteAIDS", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Possui AIDS?" />
              </SelectTrigger>
              <SelectContent>
                {options.agravante.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.agravanteAlcoolismo?.toString() || ""}
              onValueChange={(value) => updateFormData("agravanteAlcoolismo", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Possui alcoolismo?" />
              </SelectTrigger>
              <SelectContent>
                {options.agravante.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.agravanteDiabetes?.toString() || ""}
              onValueChange={(value) => updateFormData("agravanteDiabetes", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Possui diabetes?" />
              </SelectTrigger>
              <SelectContent>
                {options.agravante.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.agravanteDoencaMental?.toString() || ""}
              onValueChange={(value) => updateFormData("agravanteDoencaMental", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Possui doença mental?" />
              </SelectTrigger>
              <SelectContent>
                {options.agravante.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.baciloscopia?.toString() || ""}
              onValueChange={(value) => updateFormData("baciloscopia", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Resultado da baciloscopia" />
              </SelectTrigger>
              <SelectContent>
                {options.baciloscopia.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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
              value={formData.culturaEscarro?.toString() || ""}
              onValueChange={(value) => updateFormData("culturaEscarro", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Resultado da cultura" />
              </SelectTrigger>
              <SelectContent>
                {options.culturaEscarro.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando modelo...</p>
        </div>
      </div>
    )
  }

  if (!modelStatus.isTrained) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Modelo Não Treinado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <Alert className="border-red-500">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <p className="font-medium text-red-800">Treine o modelo antes de realizar análises.</p>
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full" size="lg">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Treinamento
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
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
                    <p className="font-medium text-red-800">{result.error}</p>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {/* Tempo de Cura */}
                  <div className="text-center">
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Tempo de Cura Previsto</h3>
                      <p className="text-3xl font-bold text-green-900">{result.tempoCura}</p>
                    </div>
                  </div>

                  {/* Dados da Rede Neural */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Entrada do Neurônio */}
                    {result.entradaNeuronio && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Brain className="w-5 h-5" />
                            Entrada RNA
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-7 gap-1">
                            {result.entradaNeuronio.map((value, index) => (
                              <div
                                key={index}
                                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono ${value === 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                                  }`}
                              >
                                {value}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Array de {result.entradaNeuronio.length} bits de entrada
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Saída Recognize */}
                    {result.saidaRecognize && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Activity className="w-5 h-5" />
                            Saída RNA
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {result.saidaRecognize.map((value, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="text-sm font-medium w-16">Saída {index + 1}:</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${value * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-mono w-20 text-right">{(value).toFixed(5)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 text-center">
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
          <h1 className="text-3xl font-bold text-gray-900">Análise de Tuberculose</h1>
          <p className="text-gray-600">Preencha os dados do paciente</p>
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  Analisar
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
      </div>
    </div>
  )
}
