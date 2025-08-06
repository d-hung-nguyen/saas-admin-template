// src/lib/services/agency.ts
export interface Agency {
  id: string
  name: string
  code: string
  created_at: string
  updated_at: string
}

export class AgencyService {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Agency[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, code, created_at, updated_at
        FROM agencies
        ORDER BY name ASC
      `)
      
      const result = await stmt.all<Agency>()
      return result.results || []
    } catch (error) {
      console.error("Error fetching agencies:", error)
      return []
    }
  }

  async getById(id: string): Promise<Agency | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, code, created_at, updated_at
        FROM agencies
        WHERE id = ?
      `)
      
      const result = await stmt.bind(id).first<Agency>()
      return result || null
    } catch (error) {
      console.error("Error fetching agency:", error)
      return null
    }
  }
}