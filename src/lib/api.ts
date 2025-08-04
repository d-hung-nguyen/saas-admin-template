interface SafeCompareInput {
  a: string
  b: string
}

const safeCompare = async (a: string, b: string): Promise<boolean> => {
  if (typeof a !== "string" || typeof b !== "string") return false
  const encoder = new TextEncoder()
  const aEncoded: Uint8Array = encoder.encode(a)
  const bEncoded: Uint8Array = encoder.encode(b)
  if (aEncoded.length !== bEncoded.length) return false
  // Manual timing-safe comparison
  let result = 0
  for (let i = 0; i < aEncoded.length; i++) {
    result |= aEncoded[i] ^ bEncoded[i]
  }
  return result === 0
}

export const validateApiTokenResponse = async (
  request: Request,
  apiToken: string
) => {
  const successful = await validateApiToken(request, apiToken)
  if (!successful) {
    return Response.json({ message: "Invalid API token" }, { status: 401 })
  }
}

interface ValidateApiTokenRequest {
  headers: {
    get(name: string): string | null
  }
}

export const validateApiToken = async (
  request: ValidateApiTokenRequest,
  apiToken: string
): Promise<boolean> => {
  try {
    if (!request?.headers?.get) {
      console.error("Invalid request object")
      return false
    }

    if (!apiToken) {
      console.error(
        "No API token provided. Set one as an environment variable."
      )
      return false
    }

    const authHeader = request.headers.get("authorization")
    const customTokenHeader = request.headers.get("x-api-token")

    let tokenToValidate = customTokenHeader

    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        tokenToValidate = authHeader.substring(7)
      } else if (authHeader.startsWith("Token ")) {
        tokenToValidate = authHeader.substring(6)
      } else {
        tokenToValidate = authHeader
      }
    }

    if (!tokenToValidate || tokenToValidate.length === 0) return false

    return await safeCompare(apiToken.trim(), tokenToValidate.trim())
  } catch (error) {
    console.error("Error validating API token:", error)
    return false
  }
}

interface Customer {
  id: string
  name: string
  email: string
  // Add other customer fields as needed
}

interface GetCustomersResponse {
  customers: Customer[]
  success: boolean
}

export const getCustomers = async (
  baseUrl: string,
  apiToken: string
): Promise<GetCustomersResponse> => {
  const url = `${baseUrl}/api/customers`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  })
  if (response.ok) {
    const data = (await response.json()) as { customers: Customer[] }
    return {
      customers: data.customers,
      success: true,
    }
  } else {
    console.error("Failed to fetch customers")
    return {
      customers: [],
      success: false,
    }
  }
}

interface GetCustomerResponse {
  customer: Customer | null
  success: boolean
}

export const getCustomer = async (
  id: string,
  baseUrl: string,
  apiToken: string
): Promise<GetCustomerResponse> => {
  const response = await fetch(baseUrl + "/api/customers/" + id, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  })
  if (response.ok) {
    const data = (await response.json()) as { customer: Customer }
    return {
      customer: data.customer,
      success: true,
    }
  } else {
    console.error("Failed to fetch customers")
    return {
      customer: null,
      success: false,
    }
  }
}

interface CreateCustomerRequest {
  // Define the fields required to create a customer
  name: string
  email: string
  // Add other fields as needed
}

interface CreateCustomerResponse {
  customer: Customer | null
  success: boolean
}

export const createCustomer = async (
  baseUrl: string,
  apiToken: string,
  customer: CreateCustomerRequest
): Promise<CreateCustomerResponse> => {
  const response = await fetch(baseUrl + "/api/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  })
  if (response.ok) {
    const data = await response.json()
    return {
      customer: data.customer as Customer,
      success: true,
    }
  } else {
    console.error("Failed to create customer")
    return {
      customer: null,
      success: false,
    }
  }
}

interface CreateSubscriptionRequest {
  // Define the fields required to create a subscription
  // Example:
  // customerId: string
  // planId: string
  // startDate?: string
  // Add other fields as needed
  [key: string]: any
}

interface Subscription {
  // Define the fields of a subscription
  // Example:
  // id: string
  // customerId: string
  // planId: string
  // status: string
  // Add other fields as needed
  [key: string]: any
}

interface CreateSubscriptionResponse {
  subscription: Subscription | null
  success: boolean
}

export const createSubscription = async (
  baseUrl: string,
  apiToken: string,
  subscription: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> => {
  const response = await fetch(baseUrl + "/api/subscriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  })
  if (response.ok) {
    const data = await response.json()
    return {
      subscription: data.subscription as Subscription,
      success: true,
    }
  } else {
    console.error("Failed to create subscription")
    return {
      subscription: null,
      success: false,
    }
  }
}

interface GetSubscriptionsResponse {
  subscriptions: Subscription[]
  success: boolean
}

export const getSubscriptions = async (
  baseUrl: string,
  apiToken: string
): Promise<GetSubscriptionsResponse> => {
  const response = await fetch(baseUrl + "/api/subscriptions", {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  })
  if (response.ok) {
    const data = (await response.json()) as { subscriptions: Subscription[] }
    return {
      subscriptions: data.subscriptions,
      success: true,
    }
  } else {
    console.error("Failed to fetch subscriptions")
    return {
      subscriptions: [],
      success: false,
    }
  }
}

interface GetSubscriptionResponse {
  subscription: Subscription | null
  success: boolean
}

export const getSubscription = async (
  id: string,
  baseUrl: string,
  apiToken: string
): Promise<GetSubscriptionResponse> => {
  const response = await fetch(baseUrl + "/api/subscriptions/" + id, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  })
  if (response.ok) {
    const data = (await response.json()) as { subscription: Subscription }
    return {
      subscription: data.subscription,
      success: true,
    }
  } else {
    console.error("Failed to fetch subscription")
    return {
      subscription: null,
      success: false,
    }
  }
}

interface CustomerSubscription {
  // Define the fields of a customer subscription as needed
  [key: string]: any
}

interface GetCustomerSubscriptionsResponse {
  customer_subscriptions: CustomerSubscription[]
  success: boolean
}

export const getCustomerSubscriptions = async (
  baseUrl: string,
  apiToken: string
): Promise<GetCustomerSubscriptionsResponse> => {
  const response = await fetch(baseUrl + "/api/customer_subscriptions", {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  })
  if (response.ok) {
    const data = (await response.json()) as {
      customer_subscriptions: CustomerSubscription[]
    }
    return {
      customer_subscriptions: data.customer_subscriptions,
      success: true,
    }
  } else {
    console.error("Failed to fetch customer subscriptions")
    return {
      customer_subscriptions: [],
      success: false,
    }
  }
}

interface RunCustomerWorkflowResponse {
  success: boolean
}

export const runCustomerWorkflow = async (
  id: string,
  baseUrl: string,
  apiToken: string
): Promise<RunCustomerWorkflowResponse> => {
  const response = await fetch(baseUrl + `/api/customers/${id}/workflow`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    method: "POST",
  })
  if (response.ok) {
    const data = await response.json()
    return {
      success: true,
    }
  } else {
    console.error("Failed to fetch customer subscriptions")
    return {
      success: false,
    }
  }
}

export async function createAgent(
  baseUrl: string,
  apiToken: string,
  agentData: {
    email: string
    first_name: string
    last_name: string
    telephone?: string
    role: string
    agency_id?: string
  }
) {
  const response = await fetch(`${baseUrl}/api/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(agentData),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
