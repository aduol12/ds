-- Run once against production Postgres before/while deploying Wave 2 roles.
-- TypeORM typically names the enum after the column; adjust if your DB differs.
-- Check with: SELECT t.typname FROM pg_type t WHERE t.typname ILIKE '%role%';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'FARMER';
    ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
    ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'AGRONOMIST';
    ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'FIELD_TECHNICIAN';
  ELSIF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    ALTER TYPE role ADD VALUE IF NOT EXISTS 'FARMER';
    ALTER TYPE role ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
    ALTER TYPE role ADD VALUE IF NOT EXISTS 'AGRONOMIST';
    ALTER TYPE role ADD VALUE IF NOT EXISTS 'FIELD_TECHNICIAN';
  END IF;
END $$;
