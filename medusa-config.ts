import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    workerMode: 'shared',
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      }
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      }
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        }
      }
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.MINIO_PUBLIC_URL,
              access_key_id: process.env.MINIO_ACCESS_KEY_ID,
              secret_access_key: process.env.MINIO_SECRET_ACCESS_KEY,
              region: 'us-east-1',
              bucket: process.env.MINIO_BUCKET,
              endpoint: process.env.MINIO_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true
              }
            }
          }
        ]
      }
    }
  ],
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'false',
    backendUrl: process.env.ADMIN_CORS,
    path: "/app"
  }
})
