import mysql from 'mysql';

interface DB {
    connect(config: mysql.ConnectionConfig): Promise<void>;
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    oneQuery<T>(sql: string, params?: any[]): Promise<T | undefined>;
    execute(sql: string, params?: any[]): Promise<void>;
    close(): Promise<void>;
    transaction<T>(con: TransactionConnection<T>): Promise<T>;
}

interface TransactionConnection<T> extends Omit<DB, 'connect' | 'close'> {
    (connection: mysql.Connection): Promise<T>;
}

const db: DB = {
    connect(config) {
        return new Promise<void>((resolve, reject) => {
            const connection = mysql.createConnection(config);
            connection.connect((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    },

    query<T>(sql, params = []) {
        return new Promise<T[]>((resolve, reject) => {
            this.getConnection((error, connection) => {
                if (error) {
                    reject(error);
                } else {
                    connection.query(sql, params, (error, results) => {
                        connection.release();
                        if (error) {
                            reject(error);
                        } else {
                            resolve(results);
                        }
                    });
                }
            });
        });
    },

    oneQuery<T>(sql, params = []) {
        return new Promise<T | undefined>((resolve, reject) => {
            this.query<T>(sql, params)
                .then((results) => {
                    resolve(results[0]);
                })
                .catch(reject);
        });
    },

    execute(sql, params = []) {
        return new Promise<void>((resolve, reject) => {
            this.getConnection((error, connection) => {
                if (error) {
                    reject(error);
                } else {
                    connection.query(sql, params, (error) => {
                        connection.release();
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    },

    close() {
        return new Promise<void>((resolve, reject) => {
            this.end((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    },

    transaction(con) {
        return new Promise(async (resolve, reject) => {
            const connection = mysql.createConnection(this.config);

            try {
                await db.connect(this.config);

                await new Promise<void>((resolve, reject) => {
                    connection.beginTransaction((error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });

                const result = await con(connection);

                await new Promise<void>((resolve, reject) => {
                    connection.commit((error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });

                resolve(result);
            } catch (error) {
                await new Promise<void>((resolve, reject) => {
                    connection.rollback(() => {
                        resolve();
                    });
                });

                reject(error);
            } finally {
                connection.end();
            }
        });
    },
};

export default db;