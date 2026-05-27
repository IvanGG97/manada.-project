-- Schema para E-commerce "Manada"

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Tabla de Productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- para tendencias/promociones
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Tabla de Perfiles de Usuario (Extiende auth.users de Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  role VARCHAR(50) DEFAULT 'client', -- 'client' o 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Tabla de Órdenes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, preparing, shipped, delivered, cancelled
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_id VARCHAR(255), -- ID de Mercado Pago
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Tabla de Items de Orden
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Función helper para saber si el usuario actual es admin (Evita recursión infinita)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT role = 'admin' INTO is_admin FROM public.profiles WHERE id = auth.uid();
  RETURN coalesce(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configuración de Seguridad (RLS - Row Level Security)

-- Habilitar RLS en las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para Categorías (Lectura pública, escritura solo admin)
CREATE POLICY "Categorías son visibles para todos" ON categories FOR SELECT USING (true);
CREATE POLICY "Solo admin modifica categorías" ON categories FOR ALL USING (public.is_admin());

-- Políticas para Productos (Lectura pública, escritura solo admin)
CREATE POLICY "Productos activos son visibles para todos" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin ve todos los productos" ON products FOR SELECT USING (public.is_admin());
CREATE POLICY "Solo admin modifica productos" ON products FOR ALL USING (public.is_admin());

-- Políticas para Perfiles (Usuario ve el suyo, Admin ve todos)
CREATE POLICY "Usuarios ven su propio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin ve todos los perfiles" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Usuarios actualizan su perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para Órdenes (Usuario ve las suyas, Admin ve todas)
CREATE POLICY "Usuarios ven sus órdenes" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios insertan sus órdenes" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin ve todas las órdenes" ON orders FOR ALL USING (public.is_admin());

-- Políticas para Items de Orden
CREATE POLICY "Usuarios ven items de sus órdenes" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Usuarios insertan items de sus órdenes" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admin ve y modifica todos los items" ON order_items FOR ALL USING (public.is_admin());

-- Trigger para crear perfil automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', 'client');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
