-- ============================================================
-- PolluSense-Geo  –  PostgreSQL Schema
-- Run once to create the database and the sensor_readings table.
-- Hibernate ddl-auto=update will maintain the table afterwards.
-- ============================================================

-- Create the database (run as superuser, outside a transaction block)
-- CREATE DATABASE pollusense_db;

-- Connect to the database: \c pollusense_db

CREATE TABLE IF NOT EXISTS sensor_readings (
    id          BIGSERIAL       PRIMARY KEY,
    node_id     VARCHAR(100)    NOT NULL,
    aqi         INTEGER         CHECK (aqi BETWEEN 0 AND 500),
    temperature DOUBLE PRECISION,
    humidity    DOUBLE PRECISION CHECK (humidity BETWEEN 0 AND 100),
    latitude      DOUBLE PRECISION CHECK (latitude  BETWEEN -90  AND 90),
    longitude     DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180),
    location_name VARCHAR(255),
    "timestamp"   BIGINT,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Index for fast node-based queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_node_id    ON sensor_readings (node_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at ON sensor_readings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_node_time  ON sensor_readings (node_id, created_at DESC);
