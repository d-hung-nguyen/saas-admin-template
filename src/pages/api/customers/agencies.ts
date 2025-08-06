// src/pages/api/agencies.ts
import { validateApiTokenResponse } from "@/lib/api"
import { AgencyService } from "@/lib/services/agency"

export async function GET({ locals, request }) {
  const { API_TOKEN, DB } = locals.runtime.env

  const invalidTokenResponse = await validateApiTokenResponse(request, API_TOKEN)
  if (invalidTokenResponse) return invalidTokenResponse

  try {
    const agencyService = new AgencyService(DB)
    const agencies = await agencyService.getAll()

    return Response.json({ agencies })
  } catch (error) {
    console.error("Error fetching agencies:", error)
    return Response.json(
      { message: "Failed to fetch agencies", agencies: [] },
      { status: 500 }
    )
  }
}
