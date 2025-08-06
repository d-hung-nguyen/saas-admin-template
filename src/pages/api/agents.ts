import { AgentService } from "@/lib/services/agent";
import { validateApiTokenResponse } from "@/lib/api";

export async function GET({ locals, request }: { locals: any; request: Request }) {
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const agentService = new AgentService(DB);
  const agents = await agentService.getAll();

  if (agents) {
    return Response.json({ agents });
  } else {
    return Response.json(
      { message: "Couldn't load agents" },
      { status: 500 },
    );
  }
}

export async function POST ({locals, request} : { locals: any; request: Request } ) {
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const agentService = new AgentService(DB);

  try {
    const body = await request.json() as {
      email?: string;
      role?: string;
      agency_id?: string;
      first_name?: string;
      last_name?: string;
      telephone?: string;
    };

    // Validate required fields
    if (!body.email || !body.role) {
      return Response.json(
        { message: "Email and role are required", success: false },
        { status: 400 },
      );
    }

    const allowedRoles = ["agent", "hotel_admin", "regional_admin", "global_admin"] as const;
    const role = allowedRoles.includes(body.role as any) ? body.role as typeof allowedRoles[number] : undefined;

    if (!role) {
      return Response.json(
        { message: "Invalid role provided", success: false },
        { status: 400 },
      );
    }

    const success = await agentService.create({
      email: body.email,
      role: "agent",
      agency_id: body.agency_id || undefined,
      first_name: body.first_name || undefined,
      last_name: body.last_name || undefined,
      telephone: body.telephone || undefined,
    });

    if (success) {
      return Response.json(
        { message: "Agent created successfully", success: true },
        { status: 201 },
      );
    } else {
      return Response.json(
        { message: "Couldn't create agent", success: false },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in POST /api/agents:", error);
    return Response.json(
      { message: "Invalid request body", success: false },
      { status: 400 },
    );
  }
}
