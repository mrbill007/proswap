-- ProSwap Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions (pgcrypto for gen_random_uuid)

-- Create custom types
CREATE TYPE service_type AS ENUM ('offer', 'need');
CREATE TYPE service_status AS ENUM ('pending', 'active', 'paused', 'rejected');
CREATE TYPE exchange_status AS ENUM ('proposed', 'negotiating', 'agreed', 'in_progress', 'completed', 'cancelled');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  verified_professional BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  avg_rating DECIMAL(3, 2),
  total_reviews INTEGER DEFAULT 0,
  total_exchanges INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type service_type NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  estimated_value DECIMAL(10, 2),
  service_radius_miles INTEGER DEFAULT 25,
  status service_status DEFAULT 'pending',
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service images table
CREATE TABLE service_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations reference table (US cities)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(50) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  city VARCHAR(100) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_two_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_one_id, participant_two_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchanges table
CREATE TABLE exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID REFERENCES auth.users(id) NOT NULL,
  user_b_id UUID REFERENCES auth.users(id) NOT NULL,
  service_a_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_b_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_a_description TEXT,
  service_b_description TEXT,
  estimated_value_a DECIMAL(10, 2),
  estimated_value_b DECIMAL(10, 2),
  status exchange_status DEFAULT 'proposed',
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  proposed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  agreed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_a_completed BOOLEAN DEFAULT FALSE,
  user_b_completed BOOLEAN DEFAULT FALSE
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID REFERENCES exchanges(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
  reviewee_id UUID REFERENCES auth.users(id) NOT NULL,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5) NOT NULL,
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5) NOT NULL,
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5) NOT NULL,
  fairness_rating INTEGER CHECK (fairness_rating BETWEEN 1 AND 5) NOT NULL,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  would_trade_again BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exchange_id, reviewer_id)
);

-- Blocked users table
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_location ON profiles(state, city);
CREATE INDEX idx_profiles_zip ON profiles(zip_code);

CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_created ON services(created_at DESC);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE INDEX idx_conversations_participants ON conversations(participant_one_id, participant_two_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_exchanges_users ON exchanges(user_a_id, user_b_id);
CREATE INDEX idx_exchanges_status ON exchanges(status);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_exchange ON reviews(exchange_id);

CREATE INDEX idx_locations_state ON locations(state_code);
CREATE INDEX idx_locations_slug ON locations(slug);

-- Functions

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update profile rating when a review is added
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    avg_rating = (
      SELECT AVG(overall_rating)::DECIMAL(3,2)
      FROM reviews
      WHERE reviewee_id = (SELECT user_id FROM profiles WHERE user_id = NEW.reviewee_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Services policies
CREATE POLICY "Active services are viewable by everyone"
  ON services FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own services"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
  ON services FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
  ON services FOR DELETE
  USING (auth.uid() = user_id);

-- Service images policies
CREATE POLICY "Service images are viewable with service"
  ON service_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_images.service_id
      AND (services.status = 'active' OR services.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their service images"
  ON service_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_images.service_id
      AND services.user_id = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_one_id = auth.uid() OR conversations.participant_two_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.participant_one_id = auth.uid() OR conversations.participant_two_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages (mark read)"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_one_id = auth.uid() OR conversations.participant_two_id = auth.uid())
    )
  );

-- Exchanges policies
CREATE POLICY "Users can view their exchanges"
  ON exchanges FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can create exchanges"
  ON exchanges FOR INSERT
  WITH CHECK (auth.uid() = user_a_id);

CREATE POLICY "Users can update their exchanges"
  ON exchanges FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their completed exchanges"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM exchanges
      WHERE exchanges.id = exchange_id
      AND exchanges.status = 'completed'
      AND (exchanges.user_a_id = auth.uid() OR exchanges.user_b_id = auth.uid())
    )
  );

-- Locations policies (public read)
CREATE POLICY "Locations are viewable by everyone"
  ON locations FOR SELECT
  USING (true);

-- Blocked users policies
CREATE POLICY "Users can view their blocked list"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
  ON blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- Storage buckets setup (run separately in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);
