// In your API endpoints (e.g., /api/agents/[id].ts)
import { validateApiTokenResponse } from "@/lib/api";
import { AgentService } from "@/lib/services/agent";

export async function GET({ locals, params }) {
  const { API_TOKEN, DB } = locals.runtime.env; // Use DB instead of INCENTIVE_DB
  const { id } = params;

  const agentService = new AgentService(DB);
  const agent = await agentService.getById(id as string);

  if (agent) {
    return Response.json({ agent });
  } else {
    return Response.json(
      { message: "Agent not found" },
      { status: 404 },
    );
  }
}

export async function PUT({ locals, request, params }) {
  const { API_TOKEN, DB } = locals.runtime.env;
  const { id } = params;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const agentService = new AgentService(DB);

  try {
    const body = await request.json();

    const success = await agentService.update(id as string, {
      email: body.email,
      role: body.role,
      agency_id: body.agency_id || undefined,
      first_name: body.first_name || undefined,
      last_name: body.last_name || undefined,
      telephone: body.telephone || undefined,
    });

    if (success) {
      return Response.json(
        { message: "Agent updated successfully", success: true },
        { status: 200 },
      );
    } else {
      return Response.json(
        { message: "Couldn't update agent", success: false },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in PUT /api/agents/[id]:", error);
    return Response.json(
      { message: "Invalid request body", success: false },
      { status: 400 },
    );
  }
}

export async function DELETE({ locals, request, params }) {
  const { API_TOKEN, DB } = locals.runtime.env;
  const { id } = params;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const agentService = new AgentService(DB);
  const success = await agentService.delete(id as string);

  if (success) {
    return Response.json(
      { message: "Agent deleted successfully", success: true },
      { status: 200 },
    );
  } else {
    return Response.json(
      { message: "Couldn't delete agent", success: false },
      { status: 500 },
    );
  }
}

