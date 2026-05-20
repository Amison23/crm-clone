-- Add api_key column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;

-- Update existing products with placeholder API keys
UPDATE products SET api_key = 'pk_lms_' || encode(gen_random_bytes(16), 'hex') WHERE name = 'LMS Platform';
UPDATE products SET api_key = 'pk_book_' || encode(gen_random_bytes(16), 'hex') WHERE name = 'Bookease';
UPDATE products SET api_key = 'pk_pay_' || encode(gen_random_bytes(16), 'hex') WHERE name = 'SwiftPay Hub';
UPDATE products SET api_key = 'pk_prop_' || encode(gen_random_bytes(16), 'hex') WHERE name = 'PropertyFlow';
