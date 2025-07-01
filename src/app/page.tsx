"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText, CheckCircle, AlertCircle, X, Activity, Settings, Brain } from "lucide-react"
import type { TuberculosisRNACommand, TrainingResponse, ModelStatus } from "@/types/tuberculosis"

interface ApiResponse {
  timestamp: string
  status: number
  error?: string
  data?: string
}

export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [encryptedFilePath, setEncryptedFilePath] = useState<string | null>(null)
  const [showTrainingDialog, setShowTrainingDialog] = useState(false)
  const [trainingParams, setTrainingParams] = useState<Omit<TuberculosisRNACommand, "encryptedFilePath">>({
    numCamadas: 2,
    tamCamada: 20,
    taxaAprendizado: 0.3,
    margemErro: 0.005,
    numInteracoes: 1000,
  })
  const [isTraining, setIsTraining] = useState(false)
  const [trainingResult, setTrainingResult] = useState<TrainingResponse | null>(null)
  const [modelStatus, setModelStatus] = useState<ModelStatus>({ isTrained: false })

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
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResponse(null)
      setEncryptedFilePath(null)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setResponse(null)

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10))
      }, 200)

      const response = await fetch("/api/arquivo/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result: ApiResponse = await response.json()
      setResponse(result)

      if (result.status === 201 && result.data) {
        setEncryptedFilePath(result.data)
        setTimeout(() => setShowTrainingDialog(true), 1000)
      }
    } catch {
      setResponse({
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Erro de conexão com o servidor",
      })
    } finally {
      setUploading(false)
    }
  }

  const trainModel = async () => {
    if (!encryptedFilePath) return

    setIsTraining(true)
    setTrainingResult(null)

    const command: TuberculosisRNACommand = {
      encryptedFilePath,
      ...trainingParams,
    }

    try {
      const response = await fetch("/api/tuberculosis/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      })

      const result: TrainingResponse = await response.json()
      setTrainingResult(result)

      if (result.success) {
        await checkModelStatus()
        setTimeout(() => {
          setShowTrainingDialog(false)
          clearFile()
        }, 2000)
      }
    } catch {
      setTrainingResult({
        success: false,
        message: "Erro de conexão com o servidor",
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Erro de conexão com o servidor",
      })
    } finally {
      setIsTraining(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setResponse(null)
    setUploadProgress(0)
    setEncryptedFilePath(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Análise de Tuberculose RNA</h1>
          <p className="text-gray-600">Treine o modelo e realize análises de dados de tuberculose</p>
        </div>

        {/* Status do Modelo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Status do Modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelStatus.isTrained ? (
              <Alert className="border-green-500">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="font-medium text-green-800">Modelo treinado e pronto para análise!</p>
                  {modelStatus.trainedAt && (
                    <p className="text-sm text-green-700 mt-1">
                      Treinado em: {new Date(modelStatus.trainedAt).toLocaleString("pt-BR")}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-yellow-500">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <p className="font-medium text-yellow-800">
                    Modelo não treinado. Faça upload de um arquivo CSV para treinar.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload de Arquivo CSV
            </CardTitle>
            <CardDescription>Selecione um arquivo CSV para treinar o modelo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-input">Selecionar Arquivo CSV</Label>
              <Input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={uploading}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-gray-600 text-center">Enviando... {uploadProgress}%</p>
              </div>
            )}

            <Button onClick={uploadFile} disabled={!selectedFile || uploading} className="w-full" size="lg">
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Arquivo
                </>
              )}
            </Button>

            {response && (
              <Alert className={response.status === 201 ? "border-green-500" : "border-red-500"}>
                {response.status === 201 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {response.status === 201 ? (
                    <p className="font-medium text-green-800">Arquivo enviado! Configure o treinamento.</p>
                  ) : (
                    <p className="font-medium text-red-800">{response.error || "Erro no upload"}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Análise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Análise de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelStatus.isTrained ? (
              <Button asChild className="w-full" size="lg">
                <a href="/analise">
                  <Activity className="w-4 h-4 mr-2" />
                  Iniciar Análise
                </a>
              </Button>
            ) : (
              <Button disabled className="w-full" size="lg">
                <Activity className="w-4 h-4 mr-2" />
                Análise Bloqueada - Treine o Modelo
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Training Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurar Treinamento
            </DialogTitle>
            <DialogDescription>Configure os parâmetros da rede neural</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numCamadas">Camadas</Label>
                <Input
                  id="numCamadas"
                  type="number"
                  min="1"
                  max="10"
                  value={trainingParams.numCamadas}
                  onChange={(e) =>
                    setTrainingParams((prev) => ({ ...prev, numCamadas: Number.parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tamCamada">Tamanho</Label>
                <Input
                  id="tamCamada"
                  type="number"
                  min="1"
                  max="100"
                  value={trainingParams.tamCamada}
                  onChange={(e) =>
                    setTrainingParams((prev) => ({ ...prev, tamCamada: Number.parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxaAprendizado">Taxa de Aprendizado</Label>
              <Input
                id="taxaAprendizado"
                type="number"
                step="0.01"
                min="0.001"
                max="1"
                value={trainingParams.taxaAprendizado}
                onChange={(e) =>
                  setTrainingParams((prev) => ({ ...prev, taxaAprendizado: Number.parseFloat(e.target.value) || 0.1 }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="margemErro">Margem de Erro</Label>
                <Input
                  id="margemErro"
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="1"
                  value={trainingParams.margemErro}
                  onChange={(e) =>
                    setTrainingParams((prev) => ({ ...prev, margemErro: Number.parseFloat(e.target.value) || 0.005 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numInteracoes">Iterações</Label>
                <Input
                  id="numInteracoes"
                  type="number"
                  min="100"
                  max="10000"
                  value={trainingParams.numInteracoes}
                  onChange={(e) =>
                    setTrainingParams((prev) => ({ ...prev, numInteracoes: Number.parseInt(e.target.value) || 1000 }))
                  }
                />
              </div>
            </div>

            {trainingResult && (
              <Alert className={trainingResult.success ? "border-green-500" : "border-red-500"}>
                {trainingResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <p className={`font-medium ${trainingResult.success ? "text-green-800" : "text-red-800"}`}>
                    {trainingResult.message}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTrainingDialog(false)}
                disabled={isTraining}
                className="flex-1 bg-transparent"
              >
                Cancelar
              </Button>
              <Button onClick={trainModel} disabled={isTraining || !encryptedFilePath} className="flex-1">
                {isTraining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Treinando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Treinar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
