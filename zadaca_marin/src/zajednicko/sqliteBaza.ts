import sqlite3 from 'sqlite3';

export default class Baza {
	private vezaDB: sqlite3.Database | null;
	private putanjaSQLliteDatoteka: string;

	constructor(putanjaSQLliteDatoteka: string) {
		this.putanjaSQLliteDatoteka = putanjaSQLliteDatoteka;
		this.vezaDB = null;
	}
  
	async spoji() {
		return new Promise<void>((resolve, reject) => {
			this.vezaDB = new sqlite3.Database(this.putanjaSQLliteDatoteka, (err) => {
				if (err) {
					reject(err);
				} else {
					this.vezaDB!.exec('PRAGMA foreign_keys = ON;', (err) => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				}
			});
		});
	}
	
	async ubaciAzurirajPodatke(sql: string, podaci: Array<string | number | null>) {
		if (!this.vezaDB) {
			throw new Error("Baza nije spojena");
		}
		
		return new Promise<sqlite3.RunResult>((resolve, reject) => {
			this.vezaDB!.run(sql, podaci, function(err) {
				if (err) {
					console.error("Greška pri izvršavanju upita:", err);
					reject(err);
				} else {
					resolve(this);
				}
			});
		});
	}
	
	async dajPodatke(sql: string, podaci: Array<string | number>) {
		if (!this.vezaDB) {
			throw new Error("Baza nije spojena");
		}
		
		return new Promise<any[]>((resolve, reject) => {
			this.vezaDB!.all(sql, podaci, (err, rows) => {
				if (err) {
					console.error("Greška pri izvršavanju upita:", err);
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	async izvrsiUpit(sql: string) {
		if (!this.vezaDB) {
			throw new Error("Baza nije spojena");
		}
		
		return new Promise<any[]>((resolve, reject) => {
			this.vezaDB!.all(sql, [], (err, rows) => {
				if (err) {
					console.error('Greška pri izvršavanju upita:', err);
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	async zatvoriVezu() {
		if (!this.vezaDB) {
			return;
		}
		
		return new Promise<void>((resolve, reject) => {
			this.vezaDB!.close((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}
