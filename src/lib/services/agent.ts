import { v4 as uuidv4 } from "uuid";

export const AGENT_QUERIES = {
  BASE_SELECT: `
    SELECT 
      agents.*,
      agencies.name as agency_name,
      agencies.code as agency_code
    FROM agents 
    LEFT JOIN agencies 
      ON agents.agency_id = agencies.id
  `,
  INSERT_AGENT: `
    INSERT INTO agents (id, email, role, agency_id, first_name, last_name, telephone) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  UPDATE_AGENT: `
    UPDATE agents 
    SET email = ?, role = ?, agency_id = ?, first_name = ?, last_name = ?, telephone = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  DELETE_AGENT: `DELETE FROM agents WHERE id = ?`,
  GET_BY_ID: `WHERE agents.id = ?`,
  GET_BY_EMAIL: `WHERE agents.email = ?`,
  GET_BY_ROLE: `WHERE agents.role = ?`,
  GET_BY_AGENCY: `WHERE agents.agency_id = ?`,
};

// Keep existing customer queries
export const CUSTOMER_QUERIES = {
  BASE_SELECT: `
    SELECT 
      customers.*,
      customer_subscriptions.id as subscription_id,
      customer_subscriptions.status as subscription_status,
      subscriptions.name as subscription_name,
      subscriptions.description as subscription_description,
      subscriptions.price as subscription_price
    FROM customers 
    LEFT JOIN customer_subscriptions 
      ON customers.id = customer_subscriptions.customer_id
    LEFT JOIN subscriptions
      ON customer_subscriptions.subscription_id = subscriptions.id
  `,
  INSERT_CUSTOMER: `INSERT INTO customers (name, email, notes) VALUES (?, ?, ?)`,
  INSERT_CUSTOMER_SUBSCRIPTION: `
    INSERT INTO customer_subscriptions (customer_id, subscription_id, status) 
    VALUES (?, ?, ?)
  `,
  GET_BY_ID: `WHERE customers.id = ?`,
  GET_BY_EMAIL: `WHERE customers.email = ?`,
};

const processAgentResults = (rows: any[]) => {
  return rows.map(row => {
    const agent = { ...row };
    if (row.agency_name) {
      agent.agency = {
        id: row.agency_id,
        name: row.agency_name,
        code: row.agency_code,
      };
    }
    // Clean up raw join fields
    delete agent.agency_name;
    delete agent.agency_code;
    return agent;
  });
};


export type Agent = {
  id: string;
  email: string;
  role: 'agent';
  agency_id: string;
  first_name?: string;
  last_name?: string;
  telephone?: string;
  created_at: string;
  updated_at: string;
  agency: {
    id: string;
    name: string;
    code: string;

  };
};

export class AgentService {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Agent[]> {
    const query = `
      SELECT 
        a.*,
        ag.id as agency_id,
        ag.name as agency_name,
        ag.code as agency_code
      FROM agents a
      LEFT JOIN agencies ag ON a.agency_id = ag.id
      ORDER BY a.created_at DESC
    `;
    
    const result = await this.db.prepare(query).all();
    
    return result.results.map((row: any) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      agency_id: row.agency_id,
      first_name: row.first_name,
      last_name: row.last_name,
      telephone: row.telephone,
      created_at: row.created_at,
      updated_at: row.updated_at,
      agency: row.agency_name ? {
        id: row.agency_id,
        name: row.agency_name,
        code: row.agency_code,
      } : undefined,
    }));
  }

  async getById(id: string): Promise<Agent | null> {
    const query = `
      SELECT 
        a.*,
        ag.id as agency_id,
        ag.name as agency_name,
        ag.code as agency_code
      FROM agents a
      LEFT JOIN agencies ag ON a.agency_id = ag.id
      WHERE a.id = ?
    `;
    
    const result = await this.db.prepare(query).bind(id).first();
    
    if (!result) return null;
    
    return {
      id: result.id,
      email: result.email,
      role: result.role,
      agency_id: result.agency_id,
      first_name: result.first_name,
      last_name: result.last_name,
      telephone: result.telephone,
      created_at: result.created_at,
      updated_at: result.updated_at,
      agency: result.agency_name ? {
        id: result.agency_id,
        name: result.agency_name,
        code: result.agency_code,
      } : undefined,
    };
  }

  async create(data: Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'agency'>): Promise<boolean> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Handle optional fields - convert undefined to null for SQLite
    const agency_id = data.agency_id || null;
    const first_name = data.first_name || null;
    const last_name = data.last_name || null;
    const telephone = data.telephone || null;
    
    const query = `
      INSERT INTO agents (id, email, role, agency_id, first_name, last_name, telephone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await this.db.prepare(query).bind(
        id,
        data.email,
        data.role,
        agency_id,
        first_name,
        last_name,
        telephone,
        now,
        now
      ).run();
      
      return result.success;
    } catch (error) {
      console.error('Error creating agent:', error);
      return false;
    }
  }

  async update(id: string, data: Partial<Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'agency'>>): Promise<boolean> {
    const now = new Date().toISOString();
    
    // Build dynamic update query based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (data.email !== undefined) {
      updateFields.push('email = ?');
      values.push(data.email);
    }
    if (data.role !== undefined) {
      updateFields.push('role = ?');
      values.push(data.role);
    }
    if (data.agency_id !== undefined) {
      updateFields.push('agency_id = ?');
      values.push(data.agency_id || null);
    }
    if (data.first_name !== undefined) {
      updateFields.push('first_name = ?');
      values.push(data.first_name || null);
    }
    if (data.last_name !== undefined) {
      updateFields.push('last_name = ?');
      values.push(data.last_name || null);
    }
    if (data.telephone !== undefined) {
      updateFields.push('telephone = ?');
      values.push(data.telephone || null);
    }
    
    if (updateFields.length === 0) {
      return false; // Nothing to update
    }
    
    updateFields.push('updated_at = ?');
    values.push(now);
    values.push(id); // for WHERE clause
    
    const query = `UPDATE agents SET ${updateFields.join(', ')} WHERE id = ?`;
    
    try {
      const result = await this.db.prepare(query).bind(...values).run();
      return result.success;
    } catch (error) {
      console.error('Error updating agent:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM agents WHERE id = ?';
    
    try {
      const result = await this.db.prepare(query).bind(id).run();
      return result.success;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }
}

// Add this interface if it's missing
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all(): Promise<{ success: boolean; results: any[] }>;
  run(): Promise<{ success: boolean; meta: { last_row_id: number } }>;
}
