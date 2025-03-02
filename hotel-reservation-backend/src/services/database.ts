import { Pool, QueryResult, QueryResultRow } from 'pg';
import logger from '../util/logger';

// Export interfaces that will be used by other classes
export interface IDatabase {
    connect(): Promise<void>;
    query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: any;
}

class PostgresDatabase implements IDatabase {
    private pool: Pool;
    private isConnected: boolean = false;

    constructor(dbConfig: DatabaseConfig) {
        this.pool = new Pool(dbConfig);
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            logger.info('Database already connected');
            return;
        }

        try {
            const client = await this.pool.connect();
            logger.info('Connected to database');
            client.release();
            this.isConnected = true;
        } catch (err) {
            console.error('Error acquiring client', (err as Error).stack);
        }
    }

    async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
        return this.pool.query<T>(text, params);
    }
}

// Export the Database class
export class Database {
    private static instance: IDatabase;

    public static initialize(dbConfig: DatabaseConfig): IDatabase {
        if (!Database.instance) {
            Database.instance = new PostgresDatabase(dbConfig);

        }
        return Database.instance;
    }
}
