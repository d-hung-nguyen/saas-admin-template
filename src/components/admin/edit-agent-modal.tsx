// src/components/admin/edit-agent-modal.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const editAgentSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["agent", "hotel_admin", "regional_admin", "global_admin"]),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  telephone: z.string().optional(),
  agency_id: z.string().optional(),
})

type EditAgentFormData = z.infer<typeof editAgentSchema>

interface Agent {
  id: string
  email: string
  role: string
  first_name?: string
  last_name?: string
  telephone?: string
  agency_id?: string
}

interface EditAgentModalProps {
  agent: Agent
  apiToken: string
}

export function EditAgentModal({ agent, apiToken }: EditAgentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  } = useForm<EditAgentFormData>({
    resolver: zodResolver(editAgentSchema),
    defaultValues: {
      email: agent.email,
      role: agent.role as any,
      first_name: agent.first_name || "",
      last_name: agent.last_name || "",
      telephone: agent.telephone || "",
      agency_id: agent.agency_id || "",
    },
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: EditAgentFormData) => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage({
          type: "success",
          text: "Agent updated successfully!",
        })
        // Close modal and refresh page after success
        setTimeout(() => {
          setIsOpen(false)
          window.location.reload()
        }, 1500)
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to update agent",
        })
      }
    } catch (error) {
      console.error("Error updating agent:", error)
      setMessage({
        type: "error",
        text: "An error occurred while updating the agent",
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
          Edit Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-modal max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-200 text-xl">
            Edit Agent: {agent.email}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-emerald-200">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              className="glass-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
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

          {/* First Name & Last Name - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-emerald-200">
                First Name
              </Label>
              <Input
                id="first_name"
                type="text"
                className="glass-input"
                {...register("first_name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-emerald-200">
                Last Name
              </Label>
              <Input
                id="last_name"
                type="text"
                className="glass-input"
                {...register("last_name")}
              />
            </div>
          </div>

          {/* Telephone & Agency ID - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-emerald-200">
                Telephone
              </Label>
              <Input
                id="telephone"
                type="tel"
                className="glass-input"
                {...register("telephone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agency_id" className="text-emerald-200">
                Agency ID
              </Label>
              <Input
                id="agency_id"
                type="text"
                className="glass-input"
                {...register("agency_id")}
                placeholder="Optional"
              />
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
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="glass-button flex-1"
            >
              {isSubmitting ? "Updating..." : "Update Agent"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="glass-button border border-emerald-400/30"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}