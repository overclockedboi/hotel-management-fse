import express from 'express';
import cors from 'cors';
import logger from './util/logger';
import { Routes } from './routes';
import { requestLogger, unknownEndpoint, errorHandler } from './util/middleware';
import { Config } from './config';
import { Builder } from './builder';
import serverlessExpress from '@codegenie/serverless-express';

const config: Config = new Config().load();

const createApp = async () => {
  const app = express();
  const { roomController } = await new Builder(config, null).buildApp();
  // const allowedOrigins = [
  //   'http://localhost:4200',
  //   'https://ideal-space-guacamole-jqvrpxr44q5f5q7x-3000.app.github.dev',
  //   'https://ideal-space-guacamole-jqvrpxr44q5f5q7x-4200.app.github.dev'
  // ];
 
  app.use(express.json());
  app.use(requestLogger);
  app.use(cors({
    origin:"https://ideal-space-guacamole-jqvrpxr44q5f5q7x-4200.app.github.dev",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use('/api', new Routes(roomController).load());

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.env
    });
  });

  app.use(unknownEndpoint);
  app.use(errorHandler);

  return app;
};

/**
 * AWS Lambda handler function
 * @param event AWS Lambda event
 * @param context AWS Lambda context
 * @returns HTTP response
 */
const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const app = await createApp();
  const serverlessHandler = serverlessExpress({ app });
  return serverlessHandler(event, context);
};

// Start server if not in Lambda environment
if (require.main === module && process.env.AWS_EXECUTION_ENV !== 'AWS_Lambda') {
  (async () => {
    try {
      const app = await createApp();
      app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port} in ${config.env} mode`);
        logger.info(`Health check available at http://localhost:${config.port}/health`);
      });
    } catch (err) {
      logger.error('Failed to initialize application:', err);
      process.exit(1);
    }
  })();
}

export { createApp, handler };