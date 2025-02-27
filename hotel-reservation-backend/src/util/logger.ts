import winston from 'winston';

const env = process.env.LOG_LEVEL || 'debug';
const logger = winston.createLogger({
    level: env,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'hotel-reservation-api' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(

                    info => `${info.timestamp} ${info.level}: ${info.message}`
                )
            )
        }),
    ]
});


export default logger;