const mysql = require('mysql2/promise');
class Conexao {
    constructor() {
        this.config = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'conexao'
        };
    }
    async conectar() {
        try {
            if (!this.connection) {
                this.connection = await mysql.createConnection(this.config);
            }
            return this.connection;
        } catch (error) {
            throw error;
        }
    }
    async executarQuery(sql, params = []) {
        const conn = await this.conectar();
        try {
            const [results] = await conn.execute(sql, params);
            return results;
        } catch (error) {
            throw error;
        }
    }
    async fecharConexao() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }
}
module.exports = Conexao;