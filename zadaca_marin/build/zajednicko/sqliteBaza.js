import sqlite3 from 'sqlite3';
export default class Baza {
    vezaDB;
    putanjaSQLliteDatoteka;
    constructor(putanjaSQLliteDatoteka) {
        this.putanjaSQLliteDatoteka = putanjaSQLliteDatoteka;
        this.vezaDB = null;
    }
    async spoji() {
        return new Promise((resolve, reject) => {
            this.vezaDB = new sqlite3.Database(this.putanjaSQLliteDatoteka, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.vezaDB.exec('PRAGMA foreign_keys = ON;', (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                }
            });
        });
    }
    async ubaciAzurirajPodatke(sql, podaci) {
        if (!this.vezaDB) {
            throw new Error("Baza nije spojena");
        }
        return new Promise((resolve, reject) => {
            this.vezaDB.run(sql, podaci, function (err) {
                if (err) {
                    console.error("Greška pri izvršavanju upita:", err);
                    reject(err);
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    async dajPodatke(sql, podaci) {
        if (!this.vezaDB) {
            throw new Error("Baza nije spojena");
        }
        return new Promise((resolve, reject) => {
            this.vezaDB.all(sql, podaci, (err, rows) => {
                if (err) {
                    console.error("Greška pri izvršavanju upita:", err);
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async izvrsiUpit(sql) {
        if (!this.vezaDB) {
            throw new Error("Baza nije spojena");
        }
        return new Promise((resolve, reject) => {
            this.vezaDB.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Greška pri izvršavanju upita:', err);
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async zatvoriVezu() {
        if (!this.vezaDB) {
            return;
        }
        return new Promise((resolve, reject) => {
            this.vezaDB.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
