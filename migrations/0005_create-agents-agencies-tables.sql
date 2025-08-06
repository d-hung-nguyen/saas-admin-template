-- Migration number: 0005 	 2025-08-06T18:07:08.201Z

-- Create agencies table first (referenced by agents)
CREATE TABLE IF NOT EXISTS agencies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('agent', 'hotel_admin', 'regional_admin', 'global_admin')),
    agency_id TEXT,
    first_name TEXT,
    last_name TEXT,
    telephone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_agency_id ON agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agencies_code ON agencies(code);

-- Insert sample agencies
INSERT OR IGNORE INTO agencies (id, name, code) VALUES
('agency_1', 'Premium Travel Agency', 'PTA'),
('agency_2', 'Global Adventures', 'GA'),
('agency_3', 'City Travel Hub', 'CTH');

-- Insert sample agents
INSERT OR IGNORE INTO agents (id, email, role, agency_id, first_name, last_name, telephone) VALUES
('agent_1', 'john@premiumtravel.com', 'agent', 'agency_1', 'John', 'Smith', '+1-555-0101'),
('agent_2', 'sarah@globaladv.com', 'hotel_admin', 'agency_2', 'Sarah', 'Johnson', '+1-555-0102'),
('agent_3', 'mike@cityhub.com', 'regional_admin', 'agency_3', 'Mike', 'Brown', '+1-555-0103'),
('agent_4', 'admin@system.com', 'global_admin', NULL, 'System', 'Administrator', '+1-555-0000');
