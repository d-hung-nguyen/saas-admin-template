// src/components/admin/create-agent.tsx
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const createAgentSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["agent", "hotel_admin", "regional_admin", "global_admin"]),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  telephone: z.string().optional(),
  agency_id: z.string().optional(),
})

type CreateAgentFormData = z.infer<typeof createAgentSchema>

interface Agency {
  id: string
  name: string
  code: string
}

interface CreateAgentButtonProps {
  apiToken: string
}

export function CreateAgentButton({ apiToken }: CreateAgentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      email: "",
      role: "agent",
      first_name: "",
      last_name: "",
      telephone: "",
      agency_id: "",
    },
  })

  const selectedRole = watch("role")
  const selectedAgencyId = watch("agency_id")

  // Load agencies when modal opens
  useEffect(() => {
    if (isOpen && agencies.length === 0) {
      loadAgencies()
    }
  }, [isOpen])

  const loadAgencies = async () => {
    setIsLoadingAgencies(true)
    try {
      const response = await fetch('/api/agencies', {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        setAgencies(result.agencies || [])
      }
    } catch (error) {
      console.error('Error loading agencies:', error)
    } finally {
      setIsLoadingAgencies(false)
    }
  }

  const onSubmit = async (data: CreateAgentFormData) => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Generate a unique ID for the agent
      const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          id: agentId,
          ...data,
          // Don't send empty agency_id
          agency_id: data.agency_id || null,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage({
          type: "success",
          text: "Agent created successfully!",
        })
        // Close modal and refresh page after success
        setTimeout(() => {
          setIsOpen(false)
          window.location.reload()
        }, 1500)
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to create agent",
        })
      }
    } catch (error) {
      console.error("Error creating agent:", error)
      setMessage({
        type: "error",
        text: "An error occurred while creating the agent",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset form when modal closes
      reset()
      setMessage(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="glass-button px-4 py-2 text-white hover:scale-105 transition-transform">
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-modal max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-200 text-xl">
            Create New Agent
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-emerald-200 border-b border-emerald-500/20 pb-2">
              Basic Information
            </h3>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-200">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                className="glass-input"
                placeholder="agent@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* First Name & Last Name - Side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-emerald-200">
                  First Name *
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  className="glass-input"
                  placeholder="John"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="text-red-400 text-sm">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-emerald-200">
                  Last Name *
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  className="glass-input"
                  placeholder="Smith"
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="text-red-400 text-sm">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Telephone & Role */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-emerald-200">
                  Telephone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  className="glass-input"
                  placeholder="+1-555-0123"
                  {...register("telephone")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-emerald-200">
                  Role *
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setValue("role", value as any)}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="hotel_admin">Hotel Admin</SelectItem>
                    <SelectItem value="regional_admin">Regional Admin</SelectItem>
                    <SelectItem value="global_admin">Global Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-400 text-sm">{errors.role.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Agency Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-emerald-200 border-b border-emerald-500/20 pb-2">
              Agency Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="agency_id" className="text-emerald-200">
                Agency
              </Label>
              {isLoadingAgencies ? (
                <div className="glass-input flex items-center justify-center py-2">
                  <span className="text-emerald-300">Loading agencies...</span>
                </div>
              ) : (
                <Select
                  value={selectedAgencyId}
                  onValueChange={(value) => setValue("agency_id", value === "none" ? "" : value)}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select an agency (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Agency</SelectItem>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name} ({agency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-emerald-400 text-xs">
                Optional: Select an agency if this agent belongs to one
              </p>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-emerald-900/50 border border-emerald-500/50 text-emerald-200"
                  : "bg-red-900/50 border border-red-500/50 text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-emerald-500/20">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="glass-button flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Agent
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="glass-button border border-emerald-400/30"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
