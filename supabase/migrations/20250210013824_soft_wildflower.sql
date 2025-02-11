/*
  # Initial Schema Setup

  1. New Tables
    - `sellers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `order_id` (text, unique)
      - `song_request` (text)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `files`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `file_path` (text)
      - `file_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated sellers
    - Add policies for public order creation
*/

-- Create tables
CREATE TABLE sellers (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text UNIQUE NOT NULL,
  song_request text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policies for sellers
CREATE POLICY "Sellers can read own data"
  ON sellers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policies for orders
CREATE POLICY "Public can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read their own orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Sellers can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for files
CREATE POLICY "Public can create files"
  ON files
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read their own files"
  ON files
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Sellers can read all files"
  ON files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can delete files"
  ON files
  FOR DELETE
  TO authenticated
  USING (true);