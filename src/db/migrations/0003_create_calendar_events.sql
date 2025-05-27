-- Migration: Create calendar events tables
-- Created: 2024-01-XX
-- Description: Creates calendar_events, event_sharing, and event_history tables for Disney vacation planning

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS "calendar_events" (
    "id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    "vacation_id" UUID NOT NULL REFERENCES "vacations"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
 
    -- Basic event information
    "title" TEXT NOT NULL,
    "date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "start_time" TEXT, -- Format: "HH:MM"
    "end_time" TEXT, -- Format: "HH:MM"
    -- Event categorization
    "type" TEXT NOT NULL CHECK ("type" IN ('park', 'dining', 'resort', 'travel', 'rest', 'event', 'note', 'fastpass', 'photo', 'shopping', 'entertainment')),
    "priority" TEXT NOT NULL DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high', 'critical')),
    "status" TEXT NOT NULL DEFAULT 'planned' CHECK ("status" IN ('planned', 'confirmed', 'completed', 'cancelled', 'modified')),
 
    -- Location information
    "park_id" TEXT,
    "attraction_id" TEXT,
    "location_name" TEXT,
 
    -- Visual and organizational
    "is_highlighted" BOOLEAN DEFAULT FALSE,
    "notes" TEXT,
    "tags" JSONB,
    "color" TEXT,
    "icon" TEXT,
    "participants" JSONB,
 
    -- Complex data fields stored as JSONB
    "reminder" JSONB,
    "reservation" JSONB,
    "weather" JSONB,
    "budget" JSONB,
    "transportation" JSONB,
    "checklist" JSONB,
    "attachments" JSONB,
 
    -- Timestamps
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "calendar_events_vacation_id_idx" ON "calendar_events" ("vacation_id");

CREATE INDEX IF NOT EXISTS "calendar_events_user_id_idx" ON "calendar_events" ("user_id");

CREATE INDEX IF NOT EXISTS "calendar_events_date_idx" ON "calendar_events" ("date");

CREATE INDEX IF NOT EXISTS "calendar_events_type_idx" ON "calendar_events" ("type");

CREATE INDEX IF NOT EXISTS "calendar_events_status_idx" ON "calendar_events" ("status");

CREATE INDEX IF NOT EXISTS "calendar_events_vacation_date_idx" ON "calendar_events" ("vacation_id", "date");

-- Create event_sharing table for collaborative events
CREATE TABLE IF NOT EXISTS "event_sharing" (
    "id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    "event_id" UUID NOT NULL REFERENCES "calendar_events"("id") ON DELETE CASCADE,
    "shared_with_user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "permission" TEXT NOT NULL DEFAULT 'view' CHECK ("permission" IN ('view', 'edit', 'admin')),
    "shared_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "shared_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for event sharing
CREATE INDEX IF NOT EXISTS "event_sharing_event_id_idx" ON "event_sharing" ("event_id");

CREATE INDEX IF NOT EXISTS "event_sharing_shared_with_user_id_idx" ON "event_sharing" ("shared_with_user_id");

-- Create event_history table for tracking changes
CREATE TABLE IF NOT EXISTS "event_history" (
    "id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    "event_id" UUID NOT NULL REFERENCES "calendar_events"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "action" TEXT NOT NULL CHECK ("action" IN ('created', 'updated', 'deleted', 'shared', 'status_changed')),
    "changes" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for event history
CREATE INDEX IF NOT EXISTS "event_history_event_id_idx" ON "event_history" ("event_id");

CREATE INDEX IF NOT EXISTS "event_history_timestamp_idx" ON "event_history" ("timestamp");

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION UPDATE_CALENDAR_EVENTS_UPDATED_AT(
) RETURNS TRIGGER AS
    $$      BEGIN NEW.UPDATED_AT = NOW();
    RETURN  NEW;
END;
$$      LANGUAGE PLPGSQL;
CREATE  TRIGGER UPDATE_CALENDAR_EVENTS_UPDATED_AT_TRIGGER BEFORE UPDATE ON CALENDAR_EVENTS FOR EACH ROW EXECUTE

FUNCTION UPDATE_CALENDAR_EVENTS_UPDATED_AT(
);
 
-- Add comments for documentation
COMMENT ON TABLE "calendar_events" IS
    'Stores calendar events for Disney vacation planning';
COMMENT ON TABLE "event_sharing" IS
    'Manages sharing permissions for calendar events';
COMMENT ON TABLE "event_history" IS
    'Tracks changes and actions performed on calendar events';
COMMENT ON COLUMN "calendar_events"."type" IS
    'Type of event: park visit, dining, resort activity, etc.';
COMMENT ON COLUMN "calendar_events"."priority" IS
    'Priority level of the event';
COMMENT ON COLUMN "calendar_events"."status" IS
    'Current status of the event';
COMMENT ON COLUMN "calendar_events"."reminder" IS
    'JSON object containing reminder settings';
COMMENT ON COLUMN "calendar_events"."reservation" IS
    'JSON object containing reservation details';
COMMENT ON COLUMN "calendar_events"."weather" IS
    'JSON object containing weather information';
COMMENT ON COLUMN "calendar_events"."budget" IS
    'JSON object containing budget information';
COMMENT ON COLUMN "calendar_events"."transportation" IS
    'JSON object containing transportation details';
COMMENT ON COLUMN "calendar_events"."checklist" IS
    'JSON array containing task checklist items';
COMMENT ON COLUMN "calendar_events"."attachments" IS
    'JSON array containing file attachments';