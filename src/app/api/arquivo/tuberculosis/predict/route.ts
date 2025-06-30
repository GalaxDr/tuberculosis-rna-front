import { type NextRequest, NextResponse } from "next/server"
import type { TuberculosisData, PredictionResponse } from "@/types/tuberculosis"

export async function POST(request: NextRequest) {
  try {
    const data: TuberculosisData = await request.json()

    // Validate required fields
    const requiredFields = [
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

    for (const field of requiredFields) {
      if (!data[field as keyof TuberculosisData]) {
        return NextResponse.json(
          {
            tempoCura: "",
            probabilidade: 0,
            timestamp: new Date().toISOString(),
            status: 400,
            error: `Campo obrigatório não preenchido: ${field}`,
          } as PredictionResponse,
          { status: 400 },
        )
      }
    }

    // Replace with your actual Spring Boot API URL
    const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080"

    const response = await fetch(`${SPRING_API_URL}/tuberculosis/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const result = await response.json()

    // Transform the response to match our interface
    const predictionResponse: PredictionResponse = {
      tempoCura: result.data?.tempoCura || result.tempoCura || "Não determinado",
      probabilidade: result.data?.probabilidade || result.probabilidade || 0,
      timestamp: result.timestamp || new Date().toISOString(),
      status: result.status || 200,
      error: result.error,
    }

    return NextResponse.json(predictionResponse)
  } catch (error) {
    console.error("Prediction error:", error)

    return NextResponse.json(
      {
        tempoCura: "",
        probabilidade: 0,
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Erro interno do servidor ao processar a análise",
      } as PredictionResponse,
      { status: 500 },
    )
  }
}
