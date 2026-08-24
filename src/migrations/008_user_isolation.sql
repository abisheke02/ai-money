-- 008: Add user_id to businesses for proper data isolation
ALTER TABLE businesses ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Assign existing businesses to admin user (id=1) so nothing breaks.
-- On a fresh install the admin account isn't seeded until after all
-- migrations run (see patchLegacyColumns in db.ts), so user id 1 may
-- not exist yet here — guard with EXISTS to avoid a FOREIGN KEY
-- failure that would abort the whole migration chain. Ownership gets
-- backfilled by patchLegacyColumns() once the admin account exists.
UPDATE businesses SET user_id = 1 WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM users WHERE id = 1);

CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(user_id);
