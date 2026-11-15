# Database Schema for FIELD SHIFT
# Compatible with PostgreSQL 13+ and MySQL 8+

-- 1. Farmers Profile Table
CREATE TABLE IF NOT EXISTS farmers (
    farmer_id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(120),
    phone_number VARCHAR(20) UNIQUE,
    preferred_language VARCHAR(10) DEFAULT 'kn', -- 'kn', 'te', 'ta', 'hi', 'en'
    tts_speed VARCHAR(10) DEFAULT 'normal',
    auto_speak_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farms and Geospatial Boundaries
CREATE TABLE IF NOT EXISTS farms (
    farm_id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    village_name VARCHAR(120) NOT NULL,
    district_name VARCHAR(120) NOT NULL,
    state_name VARCHAR(120) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    elevation_meters DECIMAL(6, 2),
    land_size_category VARCHAR(30), -- 'less_than_1_acre', '1_to_2_acres', '2_to_5_acres', 'more_than_5_acres'
    soil_type VARCHAR(30) NOT NULL, -- 'black', 'red', 'sandy', 'other', 'dont_know'
    water_source VARCHAR(30) NOT NULL, -- 'rainwater', 'borewell', 'canal', 'drip', 'other'
    previous_crop VARCHAR(60),
    primary_farming_goal VARCHAR(60),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. NASA Climate Observation Cache (Reduces external API rate limits)
CREATE TABLE IF NOT EXISTS nasa_climate_cache (
    cache_id SERIAL PRIMARY KEY,
    grid_latitude DECIMAL(6, 2) NOT NULL,
    grid_longitude DECIMAL(6, 2) NOT NULL,
    observation_date DATE NOT NULL,
    t2m_max DECIMAL(5, 2),
    t2m_min DECIMAL(5, 2),
    t2m_mean DECIMAL(5, 2),
    precipitation_corrected_mm DECIMAL(7, 2),
    solar_radiation_mj DECIMAL(6, 2),
    topsoil_wetness_index DECIMAL(4, 3), -- 0.000 to 1.000
    dataset_source VARCHAR(80) DEFAULT 'NASA POWER MERRA-2',
    retrieval_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_grid_day UNIQUE (grid_latitude, grid_longitude, observation_date)
);

-- 4. Crop Catalog Table
CREATE TABLE IF NOT EXISTS crop_catalog (
    crop_id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_kn VARCHAR(100) NOT NULL,
    name_te VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(120),
    crop_category VARCHAR(50), -- 'Cereal', 'Pulse', 'Millet', 'Oilseed'
    water_requirement_level VARCHAR(20), -- 'Low', 'Medium', 'High'
    water_mm_range VARCHAR(50),
    growth_duration_days_min INT,
    growth_duration_days_max INT,
    nitrogen_fixing BOOLEAN DEFAULT FALSE,
    drought_tolerance_level VARCHAR(20),
    sowing_window_kharif VARCHAR(100),
    sowing_window_rabi VARCHAR(100)
);

-- 5. Saved Farmer Rotation Plans
CREATE TABLE IF NOT EXISTS saved_rotation_plans (
    saved_plan_id SERIAL PRIMARY KEY,
    farmer_id VARCHAR(64) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    plan_code VARCHAR(30) NOT NULL, -- 'planA', 'planB'
    plan_title VARCHAR(150),
    season_1_crop VARCHAR(50),
    season_2_crop VARCHAR(50),
    season_3_crop VARCHAR(50),
    is_active_current_plan BOOLEAN DEFAULT TRUE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Offline / Synchronized Farmer Activity Log
CREATE TABLE IF NOT EXISTS farm_activity_reminders (
    reminder_id SERIAL PRIMARY KEY,
    farmer_id VARCHAR(64) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    crop_id VARCHAR(50) REFERENCES crop_catalog(crop_id),
    stage_number INT,
    activity_name VARCHAR(150),
    target_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'dismissed'
    synced_from_offline BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_farms_coords ON farms(latitude, longitude);
CREATE INDEX idx_climate_date ON nasa_climate_cache(observation_date);
