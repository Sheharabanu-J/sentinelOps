-- schema.sql

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS expenditures CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS equipment_types CASCADE;
DROP TABLE IF EXISTS bases CASCADE;

-- Bases Table
CREATE TABLE bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) CHECK (role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')),
    base_id INT REFERENCES bases(id) ON DELETE SET NULL
);

-- Equipment Categories / Types
CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    category VARCHAR(50) NOT NULL 
);

-- Purchases Table
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id),
    equipment_type_id INT REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfers Table
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    source_base_id INT REFERENCES bases(id),
    destination_base_id INT REFERENCES bases(id),
    equipment_type_id INT REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) DEFAULT 'COMPLETED',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initiated_by INT REFERENCES users(id)
);

-- Assignments Table (To Personnel)
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id),
    equipment_type_id INT REFERENCES equipment_types(id),
    personnel_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initiated_by INT REFERENCES users(id)
);

-- Expenditures Table (Consumed Ammo/Rations)
CREATE TABLE expenditures (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id),
    equipment_type_id INT REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'VERIFIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initiated_by INT REFERENCES users(id)
);

-- System Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(50) NOT NULL, 
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data
INSERT INTO bases (name, location) VALUES 
('Fort Alpha', 'Sector 7'),
('Fort Bravo', 'Sector 9'),
('Camp Charlie', 'Sector 12');

INSERT INTO equipment_types (name, category) VALUES 
('M4 Carbine', 'WEAPON'),
('5.56mm Ammo', 'AMMUNITION'),
('Humvee', 'VEHICLE'),
('Night Vision Goggles', 'GEAR');

-- Seed an Admin User (password is 'admin123' hashed)
-- bcrypt hash for 'admin123'
INSERT INTO users (username, password_hash, role, base_id) VALUES 
('admin', '$2a$10$X.aY.6o0VdYy9Z1VfU3aPe6U6.Tq8a.H.n/jHj2Wb3u4zC1u3Xv3O', 'ADMIN', NULL),
('cmdr_alpha', '$2a$10$X.aY.6o0VdYy9Z1VfU3aPe6U6.Tq8a.H.n/jHj2Wb3u4zC1u3Xv3O', 'BASE_COMMANDER', 1),
('logistics_officer', '$2a$10$X.aY.6o0VdYy9Z1VfU3aPe6U6.Tq8a.H.n/jHj2Wb3u4zC1u3Xv3O', 'LOGISTICS_OFFICER', NULL);
