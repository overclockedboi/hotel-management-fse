export class Config {

    user!: string;
    password!: string;
    host!: string;
    dbPort!: number;
    port!: number;
    database!: string;
    env!: string;
    load() {
        this.user = process.env.DB_USER || 'postgres';
        this.password = process.env.DB_PASSWORD || 'root@1234';
        this.host = process.env.DB_HOST || 'localhost';
        this.dbPort = parseInt(process.env.DB_PORT || '5432', 10);
        this.port = parseInt(process.env.PORT || '3000', 10);
        this.database = process.env.DB_NAME || 'hotel_reservation';
        this.env = process.env.NODE_ENV || 'development';
        this.validateConfig();
        return this;
    }

    validateConfig = (): void => {
        // ! Critical - Validate database configuration
        if (!this.host) throw new Error('Database host is required');
        if (!this.database) throw new Error('Database name is required');
        if (!this.user) throw new Error('Database user is required');
        if (!this.password) throw new Error('Database password is required');
        if (!this.dbPort) throw new Error('Database port is required');

    };
}