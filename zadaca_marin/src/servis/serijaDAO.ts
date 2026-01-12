import { Serija, OdgledanaSerija } from "../zajednicko/serija.js";
import Baza from "../zajednicko/sqliteBaza.js";

export class SerijaDAO {
	private baza: Baza;

	constructor() {
		this.baza = new Baza("podaci/RWA2025mplastic21.sqlite");
		this.baza.spoji();
	}

	async dajSve(): Promise<Array<Serija>> {
		let sql = "SELECT idSERIJA, naziv, opis, tmdb_id FROM SERIJA;";
		var podaci = (await this.baza.dajPodatke(sql, [])) as Array<Serija>;
		return podaci;
	}

	async daj(id: number): Promise<Serija | null> {
		let sql = "SELECT idSERIJA, naziv, opis, tmdb_id FROM SERIJA WHERE idSERIJA=?;";
		var podaci = (await this.baza.dajPodatke(sql, [id])) as Array<Serija>;

		if (podaci.length == 1 && podaci[0] != undefined) {
			return podaci[0];
		}

		return null;
	}

	async dajPoTmdbId(tmdb_id: number): Promise<Serija | null> {
		let sql = "SELECT idSERIJA, naziv, opis, tmdb_id FROM SERIJA WHERE tmdb_id=?;";
		var podaci = (await this.baza.dajPodatke(sql, [tmdb_id])) as Array<Serija>;

		if (podaci.length == 1 && podaci[0] != undefined) {
			return podaci[0];
		}

		return null;
	}

	async dodaj(serija: Serija): Promise<number> {
		let sql = `INSERT INTO SERIJA (naziv, opis, tmdb_id) VALUES (?,?,?)`;
		let podaci = [
			serija.naziv,
			serija.opis || null,
			serija.tmdb_id,
		];
		let rezultat = await this.baza.ubaciAzurirajPodatke(sql, podaci);
		return rezultat.lastID;
	}

	async dajOdgledaneSerije(korisnik_id: number): Promise<Array<Serija>> {
		let sql = `SELECT s.idSERIJA, s.naziv, s.opis, s.tmdb_id
                          FROM SERIJA s
                          INNER JOIN ODGLEDANA_SERIJA os ON s.idSERIJA = os.serija_id
                          WHERE os.korisnik_id = ?;`;
		var podaci = (await this.baza.dajPodatke(sql, [korisnik_id])) as Array<Serija>;
		return podaci;
	}

	async dodajOdgledanuSeriju(odgledana: OdgledanaSerija): Promise<boolean> {
		let provjera = await this.baza.dajPodatke(
			"SELECT idODGLEDANA_SERIJA FROM ODGLEDANA_SERIJA WHERE korisnik_id=? AND serija_id=?;",
			[odgledana.korisnik_id, odgledana.serija_id]
		);
		
		if (provjera.length > 0) {
			return false;
		}

		let sql = `INSERT INTO ODGLEDANA_SERIJA (korisnik_id, serija_id) VALUES (?,?)`;
		await this.baza.ubaciAzurirajPodatke(sql, [
			odgledana.korisnik_id,
			odgledana.serija_id,
		]);
		return true;
	}

	async obrisiOdgledanuSeriju(korisnik_id: number, serija_id: number): Promise<boolean> {
		let sql = "DELETE FROM ODGLEDANA_SERIJA WHERE korisnik_id=? AND serija_id=?;";
		await this.baza.ubaciAzurirajPodatke(sql, [korisnik_id, serija_id]);
		return true;
	}

	async provjeriJeLiOdgledana(korisnik_id: number, serija_id: number): Promise<boolean> {
		let sql = "SELECT idODGLEDANA_SERIJA FROM ODGLEDANA_SERIJA WHERE korisnik_id=? AND serija_id=?;";
		var podaci = await this.baza.dajPodatke(sql, [korisnik_id, serija_id]);
		return podaci.length > 0;
	}
}

