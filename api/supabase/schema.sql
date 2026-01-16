-- =====================================================
-- PEGASUS ELITE HUB - SUPABASE DATABASE SCHEMA
-- =====================================================
-- This schema supports admins, trainers, and members (clients)
-- with comprehensive business management features

-- =====================================================
-- 1. CORE USER & AUTHENTICATION TABLES
-- =====================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'trainer', 'member');

-- Main users table (integrates with Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    avatar TEXT,
    location_id UUID,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. LOCATIONS
-- =====================================================

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT,
    manager_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. MEMBERSHIP TIERS
-- =====================================================

CREATE TABLE membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annually')),
    features TEXT[],
    benefit_ids TEXT[],
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MEMBERS (CLIENTS)
-- =====================================================

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    member_type TEXT NOT NULL CHECK (member_type IN ('prospect', 'member')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    join_date DATE,
    avatar TEXT,
    dob DATE,
    gender TEXT,
    occupation TEXT,
    organization TEXT,
    sales_rep TEXT,
    source_promotion TEXT,
    referred_by TEXT,
    trainer TEXT,
    tags TEXT[],
    involvement_type TEXT,
    title TEXT,
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    address_city TEXT,
    address_state TEXT,
    address_postal_code TEXT,
    address_country TEXT,
    
    -- Emergency Contact
    emergency_name TEXT,
    emergency_relationship TEXT,
    emergency_cell TEXT,
    emergency_email TEXT,
    
    -- Health & Progress
    health_score INTEGER,
    notes TEXT,
    
    -- Debt Collection
    max_amount_to_bill DECIMAL(10,2),
    debt_deadline DATE,
    is_bad_debtor BOOLEAN DEFAULT false,
    is_blacklisted BOOLEAN DEFAULT false,
    
    -- Loyalty
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    
    -- Custom fields (JSONB for flexibility)
    custom_fields JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. MEMBERSHIPS (Active Subscriptions)
-- =====================================================

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES membership_tiers(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'frozen', 'cancelled', 'expired')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. MEMBER COMMUNICATIONS
-- =====================================================

CREATE TABLE member_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'call', 'note', 'absence', 'whatsapp', 'review_request')),
    subject TEXT NOT NULL,
    notes TEXT,
    date TIMESTAMPTZ NOT NULL,
    author TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. PROGRESS PHOTOS
-- =====================================================

CREATE TABLE progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    url TEXT NOT NULL,
    weight DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. LOYALTY HISTORY
-- =====================================================

CREATE TABLE loyalty_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    points INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. ACCESS LOGS (Check-in/Check-out)
-- =====================================================

CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    timestamp TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('check_in', 'check_out')),
    method TEXT CHECK (method IN ('qr', 'manual', 'nfc_simulated')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. RESOURCES (Facilities & Trainers for Booking)
-- =====================================================

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('facility', 'trainer')),
    capacity INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. BOOKINGS
-- =====================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID,
    location_id UUID REFERENCES locations(id),
    title TEXT NOT NULL,
    resource_id UUID REFERENCES resources(id),
    member_id UUID REFERENCES members(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    color TEXT DEFAULT 'blue' CHECK (color IN ('blue', 'green', 'purple', 'orange', 'red', 'gray')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'attended', 'no-show', 'cancelled')),
    
    -- Recurrence
    recurrence_rule TEXT CHECK (recurrence_rule IN ('daily', 'weekly', 'monthly')),
    recurrence_end_date DATE,
    recurrence_exception_dates DATE[],
    is_exception BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. PAYMENTS
-- =====================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    amount DECIMAL(10,2) NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    description TEXT,
    method TEXT CHECK (method IN ('Card', 'Cash', 'Stripe', 'Other')),
    stripe_ref TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('succeeded', 'pending', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. PRODUCTS (POS Inventory)
-- =====================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. ASSETS (Equipment & Facilities)
-- =====================================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    last_maintenance DATE,
    next_maintenance DATE,
    status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'repair', 'needs_service')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. TASKS
-- =====================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'pending', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    end_date DATE,
    assignee_id UUID REFERENCES users(id),
    is_archived BOOLEAN DEFAULT false,
    parent_id UUID REFERENCES tasks(id),
    dependencies UUID[],
    
    -- Recurrence
    recurrence_rule TEXT CHECK (recurrence_rule IN ('daily', 'weekly', 'monthly')),
    recurrence_end_date DATE,
    recurrence_exception_dates DATE[],
    series_id UUID,
    
    tags TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. TASK CHECKLIST ITEMS
-- =====================================================

CREATE TABLE task_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. TASK COMMENTS
-- =====================================================

CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 18. PROSPECTS (Leads)
-- =====================================================

CREATE TABLE prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'uncontacted' CHECK (status IN ('uncontacted', 'contacted', 'trial', 'won')),
    last_contacted TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id),
    tags TEXT[],
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 19. ACTIVITY LOGS (Audit Trail)
-- =====================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT CHECK (entity_type IN ('task', 'member', 'booking', 'prospect', 'access', 'taxonomy', 'asset')),
    entity_id UUID,
    entity_name TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 20. NOTIFICATION TEMPLATES
-- =====================================================

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('instant', 'reminder', 'followup', 'custom')),
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
    content TEXT NOT NULL,
    auto_enabled BOOLEAN DEFAULT false,
    send_time_offset INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 21. TRAINER & MEMBER REVIEWS
-- =====================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES users(id),
    target_id UUID REFERENCES users(id),
    target_type TEXT CHECK (target_type IN ('trainer', 'member')),
    stars INTEGER CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_members_location ON members(location_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_bookings_resource ON bookings(resource_id);
CREATE INDEX idx_bookings_member ON bookings(member_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(date);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_access_logs_member ON access_logs(member_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- === USERS TABLE POLICIES ===

-- Admins can see all users
CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- Users can see their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());

-- Admins can insert users
CREATE POLICY "Admins can insert users"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (auth_id = auth.uid());

-- === MEMBERS TABLE POLICIES ===

-- Admins and trainers can view all members
CREATE POLICY "Admins and trainers can view all members"
    ON members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'trainer')
        )
    );

-- Members can view their own data
CREATE POLICY "Members can view own data"
    ON members FOR SELECT
    TO authenticated
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Admins can modify members
CREATE POLICY "Admins can modify members"
    ON members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- === BOOKINGS TABLE POLICIES ===

-- Everyone can view bookings
CREATE POLICY "All authenticated users can view bookings"
    ON bookings FOR SELECT
    TO authenticated
    USING (true);

-- Members can create their own bookings
CREATE POLICY "Members can create own bookings"
    ON bookings FOR INSERT
    TO authenticated
    WITH CHECK (
        member_id IN (
            SELECT id FROM members WHERE user_id IN (
                SELECT id FROM users WHERE auth_id = auth.uid()
            )
        )
    );

-- Admins and trainers can manage all bookings
CREATE POLICY "Admins and trainers can manage bookings"
    ON bookings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'trainer')
        )
    );

-- === PAYMENTS TABLE POLICIES ===

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON payments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- Members can view their own payments
CREATE POLICY "Members can view own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (
        member_id IN (
            SELECT id FROM members WHERE user_id IN (
                SELECT id FROM users WHERE auth_id = auth.uid()
            )
        )
    );

-- Admins can manage payments
CREATE POLICY "Admins can manage payments"
    ON payments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- === TASKS TABLE POLICIES ===

-- Admins can see all tasks
CREATE POLICY "Admins can view all tasks"
    ON tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- Users can see tasks assigned to them
CREATE POLICY "Users can view assigned tasks"
    ON tasks FOR SELECT
    TO authenticated
    USING (
        assignee_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Admins can manage tasks
CREATE POLICY "Admins can manage tasks"
    ON tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- === PRODUCTS TABLE POLICIES ===

-- All authenticated users can view products
CREATE POLICY "All users can view products"
    ON products FOR SELECT
    TO authenticated
    USING (true);

-- Admins can manage products
CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- === PROSPECTS TABLE POLICIES ===

-- Admins and trainers can view prospects
CREATE POLICY "Admins and trainers can view prospects"
    ON prospects FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role IN ('admin', 'trainer')
        )
    );

-- Admins can manage prospects
CREATE POLICY "Admins can manage prospects"
    ON prospects FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- === ASSETS TABLE POLICIES ===

-- All users can view assets
CREATE POLICY "All users can view assets"
    ON assets FOR SELECT
    TO authenticated
    USING (true);

-- Admins can manage assets
CREATE POLICY "Admins can manage assets"
    ON assets FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.auth_id = auth.uid() AND u.role = 'admin'
        )
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Optional - uncomment to add sample data)
-- =====================================================

-- Insert a default admin user (update auth_id after creating in Supabase Auth)
-- INSERT INTO users (email, name, role, avatar)
-- VALUES ('admin@pegasus.com', 'Admin User', 'admin', 'https://ui-avatars.com/api/?name=Admin+User');
