-- ProSwap Seed Data
-- Categories and US Locations

-- Insert main categories
INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Home Repair', 'home-repair', 'Plumbing, electrical, HVAC, carpentry, and more', 'Wrench', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Automotive', 'automotive', 'Mechanical repair, body work, detailing', 'Car', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Design', 'design', 'Graphic design, logo design, UI/UX, interior design', 'Palette', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Photography', 'photography', 'Portrait, event, product, real estate photography', 'Camera', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Tech & IT', 'tech-it', 'Web development, app development, IT support', 'Monitor', 5),
  ('c1000000-0000-0000-0000-000000000006', 'Beauty', 'beauty', 'Hair styling, makeup, nails, skincare', 'Sparkles', 6),
  ('c1000000-0000-0000-0000-000000000007', 'Moving', 'moving', 'Local moving, packing, heavy lifting, junk removal', 'Truck', 7),
  ('c1000000-0000-0000-0000-000000000008', 'Landscaping', 'landscaping', 'Lawn care, tree service, gardening, irrigation', 'TreeDeciduous', 8),
  ('c1000000-0000-0000-0000-000000000009', 'Music', 'music', 'Lessons, recording, DJ services, instrument repair', 'Music', 9),
  ('c1000000-0000-0000-0000-000000000010', 'Cooking', 'cooking', 'Catering, meal prep, baking, private chef', 'ChefHat', 10),
  ('c1000000-0000-0000-0000-000000000011', 'Tutoring', 'tutoring', 'Academic, test prep, language, music lessons', 'GraduationCap', 11),
  ('c1000000-0000-0000-0000-000000000012', 'Health & Fitness', 'health-fitness', 'Personal training, yoga, nutrition coaching', 'Dumbbell', 12),
  ('c1000000-0000-0000-0000-000000000013', 'Cleaning', 'cleaning', 'House cleaning, deep cleaning, organizing', 'SprayCan', 13),
  ('c1000000-0000-0000-0000-000000000014', 'Legal', 'legal', 'Document review, notary, contract drafting', 'Scale', 14),
  ('c1000000-0000-0000-0000-000000000015', 'Financial', 'financial', 'Bookkeeping, tax prep, financial planning', 'Calculator', 15),
  ('c1000000-0000-0000-0000-000000000016', 'Writing', 'writing', 'Copywriting, editing, content creation, translation', 'PenTool', 16),
  ('c1000000-0000-0000-0000-000000000017', 'Video', 'video', 'Videography, video editing, animation', 'Video', 17),
  ('c1000000-0000-0000-0000-000000000018', 'Pet Services', 'pet-services', 'Pet sitting, dog walking, grooming, training', 'Dog', 18),
  ('c1000000-0000-0000-0000-000000000019', 'Events', 'events', 'Event planning, DJ, photography coordination', 'PartyPopper', 19),
  ('c1000000-0000-0000-0000-000000000020', 'Other', 'other', 'Other professional services', 'MoreHorizontal', 20);

-- Insert subcategories for Home Repair
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  ('Plumbing', 'plumbing', 'Pipes, fixtures, water heaters', 'c1000000-0000-0000-0000-000000000001', 1),
  ('Electrical', 'electrical', 'Wiring, outlets, lighting', 'c1000000-0000-0000-0000-000000000001', 2),
  ('HVAC', 'hvac', 'Heating, ventilation, air conditioning', 'c1000000-0000-0000-0000-000000000001', 3),
  ('Carpentry', 'carpentry', 'Woodwork, framing, cabinets', 'c1000000-0000-0000-0000-000000000001', 4),
  ('Painting', 'painting', 'Interior and exterior painting', 'c1000000-0000-0000-0000-000000000001', 5),
  ('Roofing', 'roofing', 'Roof repair and replacement', 'c1000000-0000-0000-0000-000000000001', 6),
  ('Flooring', 'flooring', 'Hardwood, tile, carpet installation', 'c1000000-0000-0000-0000-000000000001', 7),
  ('General Handyman', 'general-handyman', 'General repairs and maintenance', 'c1000000-0000-0000-0000-000000000001', 8);

-- Insert subcategories for Automotive
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  ('Mechanical Repair', 'mechanical-repair', 'Engine, transmission, brakes', 'c1000000-0000-0000-0000-000000000002', 1),
  ('Body Work', 'body-work', 'Dent repair, painting, collision', 'c1000000-0000-0000-0000-000000000002', 2),
  ('Detailing', 'detailing', 'Interior and exterior cleaning', 'c1000000-0000-0000-0000-000000000002', 3),
  ('Oil Change', 'oil-change', 'Oil and filter replacement', 'c1000000-0000-0000-0000-000000000002', 4),
  ('Tire Service', 'tire-service', 'Tire repair, rotation, replacement', 'c1000000-0000-0000-0000-000000000002', 5);

-- Insert subcategories for Design
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  ('Graphic Design', 'graphic-design', 'Marketing materials, branding', 'c1000000-0000-0000-0000-000000000003', 1),
  ('Logo Design', 'logo-design', 'Brand identity and logos', 'c1000000-0000-0000-0000-000000000003', 2),
  ('UI/UX Design', 'ui-ux-design', 'App and website design', 'c1000000-0000-0000-0000-000000000003', 3),
  ('Interior Design', 'interior-design', 'Home and office interiors', 'c1000000-0000-0000-0000-000000000003', 4),
  ('Fashion Design', 'fashion-design', 'Clothing and accessories', 'c1000000-0000-0000-0000-000000000003', 5);

-- Insert subcategories for Tech & IT
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  ('Web Development', 'web-development', 'Websites and web applications', 'c1000000-0000-0000-0000-000000000005', 1),
  ('App Development', 'app-development', 'Mobile and desktop apps', 'c1000000-0000-0000-0000-000000000005', 2),
  ('IT Support', 'it-support', 'Tech support and troubleshooting', 'c1000000-0000-0000-0000-000000000005', 3),
  ('Data Recovery', 'data-recovery', 'File and system recovery', 'c1000000-0000-0000-0000-000000000005', 4),
  ('Network Setup', 'network-setup', 'WiFi and network configuration', 'c1000000-0000-0000-0000-000000000005', 5);

-- Insert US States and Major Cities
INSERT INTO locations (state, state_code, city, slug, latitude, longitude) VALUES
  -- Alabama
  ('Alabama', 'AL', 'Birmingham', 'al-birmingham', 33.5186, -86.8104),
  ('Alabama', 'AL', 'Huntsville', 'al-huntsville', 34.7304, -86.5861),
  ('Alabama', 'AL', 'Mobile', 'al-mobile', 30.6954, -88.0399),
  ('Alabama', 'AL', 'Montgomery', 'al-montgomery', 32.3792, -86.3077),
  -- Alaska
  ('Alaska', 'AK', 'Anchorage', 'ak-anchorage', 61.2181, -149.9003),
  ('Alaska', 'AK', 'Fairbanks', 'ak-fairbanks', 64.8378, -147.7164),
  -- Arizona
  ('Arizona', 'AZ', 'Phoenix', 'az-phoenix', 33.4484, -112.0740),
  ('Arizona', 'AZ', 'Tucson', 'az-tucson', 32.2226, -110.9747),
  ('Arizona', 'AZ', 'Mesa', 'az-mesa', 33.4152, -111.8315),
  ('Arizona', 'AZ', 'Scottsdale', 'az-scottsdale', 33.4942, -111.9261),
  -- Arkansas
  ('Arkansas', 'AR', 'Little Rock', 'ar-little-rock', 34.7465, -92.2896),
  ('Arkansas', 'AR', 'Fayetteville', 'ar-fayetteville', 36.0626, -94.1574),
  -- California
  ('California', 'CA', 'Los Angeles', 'ca-los-angeles', 34.0522, -118.2437),
  ('California', 'CA', 'San Francisco', 'ca-san-francisco', 37.7749, -122.4194),
  ('California', 'CA', 'San Diego', 'ca-san-diego', 32.7157, -117.1611),
  ('California', 'CA', 'San Jose', 'ca-san-jose', 37.3382, -121.8863),
  ('California', 'CA', 'Sacramento', 'ca-sacramento', 38.5816, -121.4944),
  ('California', 'CA', 'Oakland', 'ca-oakland', 37.8044, -122.2712),
  ('California', 'CA', 'Fresno', 'ca-fresno', 36.7378, -119.7871),
  -- Colorado
  ('Colorado', 'CO', 'Denver', 'co-denver', 39.7392, -104.9903),
  ('Colorado', 'CO', 'Colorado Springs', 'co-colorado-springs', 38.8339, -104.8214),
  ('Colorado', 'CO', 'Boulder', 'co-boulder', 40.0150, -105.2705),
  -- Connecticut
  ('Connecticut', 'CT', 'Hartford', 'ct-hartford', 41.7658, -72.6734),
  ('Connecticut', 'CT', 'New Haven', 'ct-new-haven', 41.3083, -72.9279),
  -- Delaware
  ('Delaware', 'DE', 'Wilmington', 'de-wilmington', 39.7391, -75.5398),
  ('Delaware', 'DE', 'Dover', 'de-dover', 39.1582, -75.5244),
  -- Florida
  ('Florida', 'FL', 'Miami', 'fl-miami', 25.7617, -80.1918),
  ('Florida', 'FL', 'Orlando', 'fl-orlando', 28.5383, -81.3792),
  ('Florida', 'FL', 'Tampa', 'fl-tampa', 27.9506, -82.4572),
  ('Florida', 'FL', 'Jacksonville', 'fl-jacksonville', 30.3322, -81.6557),
  ('Florida', 'FL', 'Fort Lauderdale', 'fl-fort-lauderdale', 26.1224, -80.1373),
  -- Georgia
  ('Georgia', 'GA', 'Atlanta', 'ga-atlanta', 33.7490, -84.3880),
  ('Georgia', 'GA', 'Savannah', 'ga-savannah', 32.0809, -81.0912),
  ('Georgia', 'GA', 'Augusta', 'ga-augusta', 33.4735, -82.0105),
  -- Hawaii
  ('Hawaii', 'HI', 'Honolulu', 'hi-honolulu', 21.3069, -157.8583),
  -- Idaho
  ('Idaho', 'ID', 'Boise', 'id-boise', 43.6150, -116.2023),
  -- Illinois
  ('Illinois', 'IL', 'Chicago', 'il-chicago', 41.8781, -87.6298),
  ('Illinois', 'IL', 'Springfield', 'il-springfield', 39.7817, -89.6501),
  -- Indiana
  ('Indiana', 'IN', 'Indianapolis', 'in-indianapolis', 39.7684, -86.1581),
  ('Indiana', 'IN', 'Fort Wayne', 'in-fort-wayne', 41.0793, -85.1394),
  -- Iowa
  ('Iowa', 'IA', 'Des Moines', 'ia-des-moines', 41.5868, -93.6250),
  ('Iowa', 'IA', 'Cedar Rapids', 'ia-cedar-rapids', 41.9779, -91.6656),
  -- Kansas
  ('Kansas', 'KS', 'Wichita', 'ks-wichita', 37.6872, -97.3301),
  ('Kansas', 'KS', 'Kansas City', 'ks-kansas-city', 39.1141, -94.6275),
  -- Kentucky
  ('Kentucky', 'KY', 'Louisville', 'ky-louisville', 38.2527, -85.7585),
  ('Kentucky', 'KY', 'Lexington', 'ky-lexington', 38.0406, -84.5037),
  -- Louisiana
  ('Louisiana', 'LA', 'New Orleans', 'la-new-orleans', 29.9511, -90.0715),
  ('Louisiana', 'LA', 'Baton Rouge', 'la-baton-rouge', 30.4515, -91.1871),
  -- Maine
  ('Maine', 'ME', 'Portland', 'me-portland', 43.6591, -70.2568),
  -- Maryland
  ('Maryland', 'MD', 'Baltimore', 'md-baltimore', 39.2904, -76.6122),
  -- Massachusetts
  ('Massachusetts', 'MA', 'Boston', 'ma-boston', 42.3601, -71.0589),
  ('Massachusetts', 'MA', 'Cambridge', 'ma-cambridge', 42.3736, -71.1097),
  ('Massachusetts', 'MA', 'Worcester', 'ma-worcester', 42.2626, -71.8023),
  -- Michigan
  ('Michigan', 'MI', 'Detroit', 'mi-detroit', 42.3314, -83.0458),
  ('Michigan', 'MI', 'Grand Rapids', 'mi-grand-rapids', 42.9634, -85.6681),
  ('Michigan', 'MI', 'Ann Arbor', 'mi-ann-arbor', 42.2808, -83.7430),
  -- Minnesota
  ('Minnesota', 'MN', 'Minneapolis', 'mn-minneapolis', 44.9778, -93.2650),
  ('Minnesota', 'MN', 'Saint Paul', 'mn-saint-paul', 44.9537, -93.0900),
  -- Mississippi
  ('Mississippi', 'MS', 'Jackson', 'ms-jackson', 32.2988, -90.1848),
  -- Missouri
  ('Missouri', 'MO', 'Kansas City', 'mo-kansas-city', 39.0997, -94.5786),
  ('Missouri', 'MO', 'Saint Louis', 'mo-saint-louis', 38.6270, -90.1994),
  -- Montana
  ('Montana', 'MT', 'Billings', 'mt-billings', 45.7833, -108.5007),
  ('Montana', 'MT', 'Missoula', 'mt-missoula', 46.8721, -113.9940),
  -- Nebraska
  ('Nebraska', 'NE', 'Omaha', 'ne-omaha', 41.2565, -95.9345),
  ('Nebraska', 'NE', 'Lincoln', 'ne-lincoln', 40.8258, -96.6852),
  -- Nevada
  ('Nevada', 'NV', 'Las Vegas', 'nv-las-vegas', 36.1699, -115.1398),
  ('Nevada', 'NV', 'Reno', 'nv-reno', 39.5296, -119.8138),
  -- New Hampshire
  ('New Hampshire', 'NH', 'Manchester', 'nh-manchester', 42.9956, -71.4548),
  -- New Jersey
  ('New Jersey', 'NJ', 'Newark', 'nj-newark', 40.7357, -74.1724),
  ('New Jersey', 'NJ', 'Jersey City', 'nj-jersey-city', 40.7178, -74.0431),
  -- New Mexico
  ('New Mexico', 'NM', 'Albuquerque', 'nm-albuquerque', 35.0844, -106.6504),
  ('New Mexico', 'NM', 'Santa Fe', 'nm-santa-fe', 35.6870, -105.9378),
  -- New York
  ('New York', 'NY', 'New York City', 'ny-new-york-city', 40.7128, -74.0060),
  ('New York', 'NY', 'Buffalo', 'ny-buffalo', 42.8864, -78.8784),
  ('New York', 'NY', 'Rochester', 'ny-rochester', 43.1566, -77.6088),
  ('New York', 'NY', 'Albany', 'ny-albany', 42.6526, -73.7562),
  -- North Carolina
  ('North Carolina', 'NC', 'Charlotte', 'nc-charlotte', 35.2271, -80.8431),
  ('North Carolina', 'NC', 'Raleigh', 'nc-raleigh', 35.7796, -78.6382),
  ('North Carolina', 'NC', 'Durham', 'nc-durham', 35.9940, -78.8986),
  -- North Dakota
  ('North Dakota', 'ND', 'Fargo', 'nd-fargo', 46.8772, -96.7898),
  -- Ohio
  ('Ohio', 'OH', 'Columbus', 'oh-columbus', 39.9612, -82.9988),
  ('Ohio', 'OH', 'Cleveland', 'oh-cleveland', 41.4993, -81.6944),
  ('Ohio', 'OH', 'Cincinnati', 'oh-cincinnati', 39.1031, -84.5120),
  -- Oklahoma
  ('Oklahoma', 'OK', 'Oklahoma City', 'ok-oklahoma-city', 35.4676, -97.5164),
  ('Oklahoma', 'OK', 'Tulsa', 'ok-tulsa', 36.1540, -95.9928),
  -- Oregon
  ('Oregon', 'OR', 'Portland', 'or-portland', 45.5152, -122.6784),
  ('Oregon', 'OR', 'Eugene', 'or-eugene', 44.0521, -123.0868),
  -- Pennsylvania
  ('Pennsylvania', 'PA', 'Philadelphia', 'pa-philadelphia', 39.9526, -75.1652),
  ('Pennsylvania', 'PA', 'Pittsburgh', 'pa-pittsburgh', 40.4406, -79.9959),
  -- Rhode Island
  ('Rhode Island', 'RI', 'Providence', 'ri-providence', 41.8240, -71.4128),
  -- South Carolina
  ('South Carolina', 'SC', 'Charleston', 'sc-charleston', 32.7765, -79.9311),
  ('South Carolina', 'SC', 'Columbia', 'sc-columbia', 34.0007, -81.0348),
  -- South Dakota
  ('South Dakota', 'SD', 'Sioux Falls', 'sd-sioux-falls', 43.5446, -96.7311),
  -- Tennessee
  ('Tennessee', 'TN', 'Nashville', 'tn-nashville', 36.1627, -86.7816),
  ('Tennessee', 'TN', 'Memphis', 'tn-memphis', 35.1495, -90.0490),
  ('Tennessee', 'TN', 'Knoxville', 'tn-knoxville', 35.9606, -83.9207),
  -- Texas
  ('Texas', 'TX', 'Houston', 'tx-houston', 29.7604, -95.3698),
  ('Texas', 'TX', 'Dallas', 'tx-dallas', 32.7767, -96.7970),
  ('Texas', 'TX', 'Austin', 'tx-austin', 30.2672, -97.7431),
  ('Texas', 'TX', 'San Antonio', 'tx-san-antonio', 29.4241, -98.4936),
  ('Texas', 'TX', 'Fort Worth', 'tx-fort-worth', 32.7555, -97.3308),
  ('Texas', 'TX', 'El Paso', 'tx-el-paso', 31.7619, -106.4850),
  -- Utah
  ('Utah', 'UT', 'Salt Lake City', 'ut-salt-lake-city', 40.7608, -111.8910),
  ('Utah', 'UT', 'Provo', 'ut-provo', 40.2338, -111.6585),
  -- Vermont
  ('Vermont', 'VT', 'Burlington', 'vt-burlington', 44.4759, -73.2121),
  -- Virginia
  ('Virginia', 'VA', 'Virginia Beach', 'va-virginia-beach', 36.8529, -75.9780),
  ('Virginia', 'VA', 'Richmond', 'va-richmond', 37.5407, -77.4360),
  ('Virginia', 'VA', 'Norfolk', 'va-norfolk', 36.8508, -76.2859),
  -- Washington
  ('Washington', 'WA', 'Seattle', 'wa-seattle', 47.6062, -122.3321),
  ('Washington', 'WA', 'Spokane', 'wa-spokane', 47.6588, -117.4260),
  ('Washington', 'WA', 'Tacoma', 'wa-tacoma', 47.2529, -122.4443),
  -- West Virginia
  ('West Virginia', 'WV', 'Charleston', 'wv-charleston', 38.3498, -81.6326),
  -- Wisconsin
  ('Wisconsin', 'WI', 'Milwaukee', 'wi-milwaukee', 43.0389, -87.9065),
  ('Wisconsin', 'WI', 'Madison', 'wi-madison', 43.0731, -89.4012),
  -- Wyoming
  ('Wyoming', 'WY', 'Cheyenne', 'wy-cheyenne', 41.1400, -104.8202);
