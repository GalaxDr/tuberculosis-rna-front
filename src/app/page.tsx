"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"

interface ApiResponse {
  timestamp: string
  status: number
  error?: string
  path?: string
  data?: JSON
}

export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResponse(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      setSelectedFile(files[0])
      setResponse(null)
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
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/arquivo/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result: ApiResponse = await response.json()
      setResponse(result)

      if (result.status === 201) {
        // Success - clear the selected file after a delay
        setTimeout(() => {
          setSelectedFile(null)
          setUploadProgress(0)
        }, 2000)
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

  const clearFile = () => {
    setSelectedFile(null)
    setResponse(null)
    setUploadProgress(0)
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
          <p className="text-gray-600">Faça upload de arquivos para análise de dados de tuberculose</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload de Arquivo
            </CardTitle>
            <CardDescription>Selecione um arquivo para enviar ao sistema de análise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : selectedFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearFile} className="ml-auto">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-600">Enviando... {uploadProgress}%</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">Arraste um arquivo aqui</p>
                    <p className="text-gray-500">ou clique para selecionar</p>
                  </div>
                </div>
              )}
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <Label htmlFor="file-input">Selecionar Arquivo</Label>
              <Input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                className="cursor-pointer"
              />
            </div>

            {/* Upload Button */}
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

            {/* Response Display */}
            {response && (
              <Alert className={response.status === 201 ? "border-green-500" : "border-red-500"}>
                {response.status === 201 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {response.status === 201 ? (
                    <div>
                      <p className="font-medium text-green-800">Arquivo enviado com sucesso!</p>
                      {response.data && (
                        <p className="text-sm text-green-700 mt-1">
                          ID do arquivo: {typeof response.data === "string" || typeof response.data === "number"
                            ? String(response.data)
                            : JSON.stringify(response.data)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-red-800">Erro no upload</p>
                      <p className="text-sm text-red-700 mt-1">
                        {response.error || `Código de erro: ${response.status}`}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Formatos aceitos: Todos os tipos de arquivo</p>
            <p>• Tamanho máximo: Conforme configuração do servidor</p>
            <p>• Os arquivos são processados automaticamente após o upload</p>
            <p>• Mantenha seus dados seguros e confidenciais</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
