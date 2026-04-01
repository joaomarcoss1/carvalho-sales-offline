
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'business', 'driver', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  city TEXT DEFAULT 'São Paulo',
  state TEXT DEFAULT 'SP',
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate as required)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'services',
  avatar_url TEXT,
  cover_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'São Paulo',
  verified BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stories
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT NOT NULL DEFAULT 'product',
  category TEXT NOT NULL DEFAULT 'services',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Likes (polymorphic)
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL, -- 'post' or 'story'
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL, -- 'post' or 'story'
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products (for PDV)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  driver_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Drivers
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL DEFAULT 'moto',
  license_plate TEXT,
  available BOOLEAN DEFAULT true,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users read all, update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- User roles: only admins and own
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Businesses: public read, owner/admin manage
CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner manages business" ON public.businesses FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner updates business" ON public.businesses FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner deletes business" ON public.businesses FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Stories/Posts: public read, business owner manages
CREATE POLICY "Anyone views stories" ON public.stories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Business owner manages stories" ON public.stories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone views posts" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Business owner manages posts" ON public.posts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin')
);

-- Likes/Comments: authenticated users
CREATE POLICY "Anyone views likes" ON public.likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own likes" ON public.likes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Anyone views comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users add comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Products: business owner/admin
CREATE POLICY "Anyone views products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Business owner manages products" ON public.products FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin')
);

-- Orders: business owner/admin/driver
CREATE POLICY "View own orders" ON public.orders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) 
  OR driver_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Update orders" ON public.orders FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) 
  OR driver_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "View order items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Drivers
CREATE POLICY "Anyone views drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users register as driver" ON public.drivers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Driver updates own" ON public.drivers FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Conversations/Messages
CREATE POLICY "View own conversations" ON public.conversations FOR SELECT TO authenticated USING (participant_1 = auth.uid() OR participant_2 = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Update conversations" ON public.conversations FOR UPDATE TO authenticated USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "View own messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Update messages" ON public.messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid()))
);
