/**
 * Environment Variables Configuration & Validation
 * Validates required environment variables on startup
 */

// Environment variable schema
const envSchema = {
    // Server
    PORT: {
        required: false,
        default: '3000',
        validate: (val) => !isNaN(parseInt(val)),
        description: 'Server port number'
    },
    NODE_ENV: {
        required: false,
        default: 'development',
        validate: (val) => ['development', 'production', 'test'].includes(val),
        description: 'Node environment'
    },

    // CORS
    ALLOWED_ORIGINS: {
        required: false,
        default: 'http://localhost:8080,http://127.0.0.1:8080',
        description: 'Comma-separated list of allowed CORS origins'
    },

    // API
    VITE_API_URL: {
        required: false,
        default: 'http://localhost:3000/api',
        description: 'Backend API URL for frontend'
    },

    // JWT (for future authentication improvements)
    JWT_SECRET: {
        required: false,
        default: 'development-secret-key-change-in-production',
        validate: (val) => val.length >= 32,
        description: 'JWT secret key (min 32 characters)'
    },
    JWT_EXPIRES_IN: {
        required: false,
        default: '7d',
        description: 'JWT expiration time'
    },

    // Database (for future Supabase migration)
    SUPABASE_URL: {
        required: false,
        description: 'Supabase project URL'
    },
    SUPABASE_ANON_KEY: {
        required: false,
        description: 'Supabase anonymous key'
    },
    SUPABASE_SERVICE_KEY: {
        required: false,
        description: 'Supabase service role key (server-side only)'
    },

    // Optional integrations
    STRIPE_SECRET_KEY: {
        required: false,
        description: 'Stripe secret key for payments'
    },
    STRIPE_WEBHOOK_SECRET: {
        required: false,
        description: 'Stripe webhook secret'
    }
};

/**
 * Validate environment variable
 */
function validateEnvVar(key, config) {
    const value = process.env[key];

    // Check if required
    if (config.required && !value) {
        return {
            valid: false,
            error: `Missing required environment variable: ${key}`
        };
    }

    // Use default if not provided
    if (!value && config.default) {
        process.env[key] = config.default;
        return { valid: true, usingDefault: true };
    }

    // Run custom validation
    if (value && config.validate && !config.validate(value)) {
        return {
            valid: false,
            error: `Invalid value for ${key}: ${config.description}`
        };
    }

    return { valid: true };
}

/**
 * Validate all environment variables
 */
function validateEnv() {
    const results = {
        valid: true,
        errors: [],
        warnings: [],
        defaults: []
    };

    Object.entries(envSchema).forEach(([key, config]) => {
        const result = validateEnvVar(key, config);

        if (!result.valid) {
            results.valid = false;
            results.errors.push(result.error);
        } else if (result.usingDefault) {
            results.defaults.push(`${key} using default: ${config.default}`);
        }
    });

    // Warnings for production
    if (process.env.NODE_ENV === 'production') {
        if (process.env.JWT_SECRET === 'development-secret-key-change-in-production') {
            results.warnings.push('⚠️  Using default JWT_SECRET in production! Please set a secure key.');
        }

        if (!process.env.SUPABASE_URL) {
            results.warnings.push('⚠️  SUPABASE_URL not set - using JSON file storage (not recommended for production)');
        }
    }

    return results;
}

/**
 * Print validation results
 */
function printValidationResults(results) {
    if (!results.valid) {
        console.error('\n❌ Environment validation failed:\n');
        results.errors.forEach(error => console.error(`  - ${error}`));
        console.error('\n');
        return false;
    }

    if (results.defaults.length > 0) {
        console.log('\n📝 Using default values:');
        results.defaults.forEach(msg => console.log(`  - ${msg}`));
    }

    if (results.warnings.length > 0) {
        console.warn('\n⚠️  Warnings:');
        results.warnings.forEach(msg => console.warn(`  ${msg}`));
    }

    console.log('\n✅ Environment configuration validated\n');
    return true;
}

/**
 * Get environment variable with type conversion
 */
function getEnv(key, defaultValue) {
    return process.env[key] || defaultValue;
}

function getEnvNumber(key, defaultValue) {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
}

function getEnvBoolean(key, defaultValue) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
}

// Run validation on import
const validationResults = validateEnv();
const isValid = printValidationResults(validationResults);

// Export validation result and helpers
module.exports = {
    isValid,
    validationResults,
    getEnv,
    getEnvNumber,
    getEnvBoolean,

    // Quick access to common env vars
    env: {
        NODE_ENV: getEnv('NODE_ENV', 'development'),
        PORT: getEnvNumber('PORT', 3000),
        ALLOWED_ORIGINS: getEnv('ALLOWED_ORIGINS', 'http://localhost:8080,http://127.0.0.1:8080').split(','),
        JWT_SECRET: getEnv('JWT_SECRET', 'development-secret-key-change-in-production'),
        JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),

        // Features flags
        USE_SUPABASE: getEnvBoolean('USE_SUPABASE', false),

        // API
        API_URL: getEnv('VITE_API_URL', 'http://localhost:3000/api'),
    }
};
