/**
 * Promote a user by phone number (one-time ops helper).
 *
 * Usage (DB env must be available — local .env or `railway run`):
 *   node scripts/promote-role.mjs --list
 *   node scripts/promote-role.mjs --phone=0712345678 --role=SUPER_ADMIN
 *
 * Railway staging:
 *   railway run --service ds-back -- node scripts/promote-role.mjs --list
 *   railway run --service ds-back -- node scripts/promote-role.mjs --phone=07... --role=SUPER_ADMIN
 */
import pg from 'pg';

function arg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

/** Match backend normalizePhoneNumber (Kenya +254). */
function normalizePhone(input) {
  if (!input) return '';
  let raw = String(input).trim().replace(/[\s\-().]/g, '');
  if (raw.startsWith('00')) raw = `+${raw.slice(2)}`;
  let digits = raw.startsWith('+') ? raw.slice(1) : raw;
  digits = digits.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length >= 9) {
    digits = `254${digits.slice(1)}`;
  } else if (digits.length === 9 && digits.startsWith('7')) {
    digits = `254${digits}`;
  }
  return `+${digits}`;
}

function buildClient() {
  if (process.env.DATABASE_URL) {
    return new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });
}

const ROLE_MAP = {
  FARMER: 'FARMER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  AGRONOMIST: 'AGRONOMIST',
  FIELD_TECHNICIAN: 'FIELD_TECHNICIAN',
  ADMIN: 'admin', // Nest Role.ADMIN legacy DB value
  admin: 'admin',
  user: 'user',
};

async function main() {
  const client = buildClient();
  await client.connect();

  try {
    if (hasFlag('list')) {
      const { rows } = await client.query(
        `SELECT user_id, email, phone_number, role, first_name, last_name, is_active
         FROM "user"
         ORDER BY created_at DESC
         LIMIT 50`,
      );
      console.log(JSON.stringify(rows, null, 2));
      return;
    }

    const phoneRaw = arg('phone');
    const roleKey = arg('role') || 'SUPER_ADMIN';
    const role = ROLE_MAP[roleKey] || ROLE_MAP[roleKey.toUpperCase()];

    if (!phoneRaw) {
      console.error('Pass --phone=... or --list');
      process.exit(1);
    }
    if (!role) {
      console.error(`Invalid role: ${roleKey}`);
      process.exit(1);
    }

    const phone = normalizePhone(phoneRaw);
    const digits = phone.replace(/\D/g, '');
    const local = digits.startsWith('254') ? `0${digits.slice(3)}` : null;

    const { rows } = await client.query(
      `SELECT user_id, email, phone_number, role FROM "user"
       WHERE phone_number = $1
          OR regexp_replace(COALESCE(phone_number, ''), '\\D', '', 'g') = $2
          OR ($3::text IS NOT NULL AND phone_number = $3)
       LIMIT 5`,
      [phone, digits, local],
    );

    if (rows.length === 0) {
      console.error(`No user found for phone ${phoneRaw} (normalized ${phone})`);
      process.exit(1);
    }
    if (rows.length > 1) {
      console.error('Multiple matches; be more specific:', rows);
      process.exit(1);
    }

    const user = rows[0];
    await client.query(`UPDATE "user" SET role = $1 WHERE user_id = $2`, [
      role,
      user.user_id,
    ]);
    console.log(
      JSON.stringify(
        {
          ok: true,
          user_id: user.user_id,
          email: user.email,
          phone_number: user.phone_number,
          previous_role: user.role,
          new_role: role,
        },
        null,
        2,
      ),
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
