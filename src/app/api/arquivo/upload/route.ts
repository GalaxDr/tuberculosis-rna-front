import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: "Nenhum arquivo foi enviado",
          path: "/api/arquivo/upload",
          data: null,
        },
        { status: 400 },
      )
    }

    // Create FormData to forward to your Spring Boot API
    const springFormData = new FormData()
    springFormData.append("file", file)

    // Replace with your actual Spring Boot API URL
    const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080"

    const response = await fetch(`${SPRING_API_URL}/arquivo/upload`, {
      method: "POST",
      body: springFormData,
    })

    const result = await response.json()

    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Upload error:", error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Erro interno do servidor",
        path: "/api/arquivo/upload",
        data: null,
      },
      { status: 500 },
    )
  }
}