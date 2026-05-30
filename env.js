const z = require('zod');

const packageJSON = require('./package.json');
const path = require('path');
const APP_ENV = process.env.APP_ENV ?? 'development';
const envPath = path.resolve(__dirname, `.env.${APP_ENV}`);

require('dotenv').config({
  path: envPath,
});

// TODO: Replace these values with your own

const EXPO_ACCOUNT_OWNER = 'wap'; // expo account owner
const EAS_PROJECT_ID = '8ce25045-14e6-442a-8972-5b75ef7a96fa'; // eas project id

// 开发环境的包名添加 development（现在先不要）
// const withEnvSuffix = (name) => {
//   return APP_ENV === 'production' ? name : `${name}.${APP_ENV}`;
// };

const client = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  VERSION: z.string(),

  // ADD YOUR CLIENT ENV VARS HERE
  API_URL: z.string(),
  BASE_URL: z.string(),
  SSE_URL: z.string(),
  PREFIX_URL: z.string(),
  VAR_NUMBER: z.number(),
  VAR_BOOL: z.boolean(),
});

const buildTime = z.object({
  EXPO_ACCOUNT_OWNER: z.string(),
  EAS_PROJECT_ID: z.string(),
  // ADD YOUR BUILD TIME ENV VARS HERE
  SECRET_KEY: z.string(),
});

/**
 * @type {Record<keyof z.infer<typeof client> , unknown>}
 */
const _clientEnv = {
  APP_ENV,
  VERSION: packageJSON.version,

  // ADD YOUR ENV VARS HERE TOO
  API_URL: process.env.API_URL,
  BASE_URL: process.env.BASE_URL,
  SSE_URL: process.env.SSE_URL,
  PREFIX_URL: process.env.PREFIX_URL,
  VAR_NUMBER: Number(process.env.VAR_NUMBER),
  VAR_BOOL: process.env.VAR_BOOL === 'true',
};
/**
 * @type {Record<keyof z.infer<typeof buildTime> , unknown>}
 */
const _buildTimeEnv = {
  EXPO_ACCOUNT_OWNER,
  EAS_PROJECT_ID,
  // ADD YOUR ENV VARS HERE TOO
  SECRET_KEY: process.env.SECRET_KEY,
};

const _env = {
  ..._clientEnv,
  ..._buildTimeEnv,
};

const merged = buildTime.merge(client);
const parsed = merged.safeParse(_env);

if (parsed.success === false) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,

    `\n❌ Missing variables in .env.${APP_ENV} file, Make sure all required variables are defined in the .env.${APP_ENV} file.`,
    `\n💡 Tip: If you recently updated the .env.${APP_ENV} file and the error still persists, try restarting the server with the -cc flag to clear the cache.`
  );
  throw new Error(
    'Invalid environment variables, Check terminal for more details '
  );
}

const Env = parsed.data;
const ClientEnv = client.parse(_clientEnv);

module.exports = {
  Env,
  ClientEnv,
  // withEnvSuffix,
};

