import { NextResponse } from "next/server"
import type { ModelStatus } from "@/types/tuberculosis"

export async function GET() {
    try {
        // Replace with your actual Spring Boot API URL
        const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080"

        try {
            // Try to check if model is trained by making a test request
            const response = await fetch(`${SPRING_API_URL}/tuberculosis-rna/rna/recognize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idade: 1,
                    sexo: "M",
                    raca: 1,
                    zona: 1,
                    tipoEntrada: 1,
                    radiografiaTorax: 1,
                    formaTuberculose: 1,
                    agravanteAIDS: 1,
                    agravanteAlcoolismo: 1,
                    agravanteDiabetes: 1,
                    agravanteDoencaMental: 1,
                    baciloscopia: 1,
                    culturaEscarro: 1,
                }),
            })

            const result = await response.json()

            // If we get a 400 error with "Rede neural não treinada", model is not trained
            if (result.status === 400 && result.error === "Rede neural não treinada.") {
                return NextResponse.json({
                    isTrained: false,
                } as ModelStatus)
            }

            // If we get any other response, assume model is trained
            return NextResponse.json({
                isTrained: true,
                trainedAt: new Date().toISOString(), // In production, store this properly
            } as ModelStatus)
        } catch {
            // If there's a connection error, assume model is not trained
            return NextResponse.json({
                isTrained: false,
            } as ModelStatus)
        }
    } catch (error) {
        console.error("Model status error:", error)

        return NextResponse.json(
            {
                isTrained: false,
                error: "Erro ao verificar status do modelo",
            } as ModelStatus,
            { status: 500 },
        )
    }
}
