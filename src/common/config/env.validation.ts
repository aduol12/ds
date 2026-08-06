import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { IsBooleanString, IsNumberString, IsOptional, IsString } from 'class-validator';

/**
 * Environment validation schema. Fail fast on boot when required vars missing
 * in production (NODE_ENV=production).
 */
export class EnvironmentVariables {
  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  @IsOptional()
  @IsString()
  FRONTEND_URLS?: string;

  @IsOptional()
  @IsString()
  DB_HOST?: string;

  @IsOptional()
  @IsNumberString()
  DB_PORT?: string;

  @IsOptional()
  @IsString()
  DB_USER?: string;

  @IsOptional()
  @IsString()
  DB_PASSWORD?: string;

  @IsOptional()
  @IsString()
  DB_DATABASE?: string;

  @IsOptional()
  @IsBooleanString()
  DB_SYNCHRONIZE?: string;

  @IsOptional()
  @IsString()
  MQTT_HOST?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_CLOUD_NAME?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const isProd = config.NODE_ENV === 'production';
  // Provide defaults for local/dev so boot is not blocked
  const withDefaults = {
    JWT_SECRET: 'dev-only-change-me',
    ...config,
  };

  const validated = plainToInstance(EnvironmentVariables, withDefaults, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: !isProd });
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  if (isProd && (!config.JWT_SECRET || config.JWT_SECRET === 'secret' || config.JWT_SECRET === 'dev-only-change-me')) {
    throw new Error('JWT_SECRET must be set to a strong value in production');
  }

  return validated;
}
