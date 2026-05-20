-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Agent Products Mapping Table
CREATE TABLE IF NOT EXISTS agent_products (
    agent_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (agent_id, product_id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_products ENABLE ROW LEVEL SECURITY;

-- Policies for products (Super Admin can do everything)
CREATE POLICY "Super Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.role = 'superadmin'
        )
    );

-- Policies for agent_products (Super Admin can do everything)
CREATE POLICY "Super Admins can manage agent mappings" ON agent_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.role = 'superadmin'
        )
    );

-- Seed Initial SaaS Products
INSERT INTO products (name, description) VALUES
('LMS Platform', 'Enterprise Learning Management System node.'),
('Bookease', 'Intelligent appointment and resource scheduling.'),
('SwiftPay Hub', 'Global payment processing and fintech gateway.'),
('PropertyFlow', 'Real-estate management and tenant portal.');
