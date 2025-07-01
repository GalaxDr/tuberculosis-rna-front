import { type NextRequest, NextResponse } from "next/server"
import type { TuberculosisRNACommand, TrainingResponse } from "@/types/tuberculosis"

declare global {
    // eslint-disable-next-line no-var
    var modelStatus: any | undefined;
}

export async function POST(request: NextRequest) {
    try {
        const command: TuberculosisRNACommand = await request.json()

        // Validar parâmetros obrigatórios
        if (!command.encryptedFilePath) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Caminho do arquivo criptografado é obrigatório",
                    timestamp: new Date().toISOString(),
                    status: 400,
                    error: "encryptedFilePath é obrigatório",
                } as TrainingResponse,
                { status: 400 },
            )
        }

        // Validar parâmetros numéricos


        // Replace with your actual Spring Boot API URL
        const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080"

        const response = await fetch(`${SPRING_API_URL}/tuberculosis-rna/rna`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
        })

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`)
        }

        const result = await response.json()

        // Salvar status do modelo treinado (em produção, usar banco de dados)
        const modelStatus = {
            isTrained: true,
            modelId: result.data?.modelId || "model_" + Date.now(),
            trainedAt: new Date().toISOString(),
            parameters: command,
        }

        // Simular salvamento do status (em produção, salvar no banco)
        // Em um ambiente real, você salvaria isso em um banco de dados
        global.modelStatus = modelStatus

        const trainingResponse: TrainingResponse = {
            success: result.status === 200 || result.status === 201,
            message: result.data?.message || result.message || "Modelo treinado com sucesso!",
            modelId: modelStatus.modelId,
            timestamp: result.timestamp || new Date().toISOString(),
            status: result.status || 200,
            error: result.error,
        }

        return NextResponse.json(trainingResponse)
    } catch (error) {
        console.error("Training error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Erro interno do servidor ao treinar o modelo",
                timestamp: new Date().toISOString(),
                status: 500,
                error: "Erro interno do servidor",
            } as TrainingResponse,
            { status: 500 },
        )
    }
}
