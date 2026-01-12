import Baza from "../zajednicko/sqliteBaza.js";
export class StatistikaDAO {
    baza;
    constructor() {
        this.baza = new Baza("podaci/RWA2025mplastic21.sqlite");
    }
    async inicijaliziraj() {
        await this.baza.spoji();
        let sql = `
			CREATE TABLE IF NOT EXISTS STATISTIKA (
				idSTATISTIKA INTEGER PRIMARY KEY AUTOINCREMENT,
				tipRadnje VARCHAR(50) NOT NULL,
				stranica VARCHAR(255),
				endpoint VARCHAR(255),
				vrstaRadnje VARCHAR(50),
				korisnik_id INTEGER,
				datumVrijeme DATETIME NOT NULL,
				FOREIGN KEY (korisnik_id) REFERENCES KORISNIK(idKORISNIK)
			)
		`;
        try {
            await this.baza.izvrsiUpit(sql);
        }
        catch (greska) {
            console.error("Greška pri kreiranju tablice STATISTIKA:", greska);
        }
    }
    async dodaj(unos) {
        let sql = `INSERT INTO STATISTIKA ` +
            `(tipRadnje, stranica, endpoint, vrstaRadnje, korisnik_id, datumVrijeme) ` +
            `VALUES (?, ?, ?, ?, ?, ?)`;
        let podaci = [
            unos.tipRadnje,
            unos.stranica || null,
            unos.endpoint || null,
            unos.vrstaRadnje || null,
            unos.korisnik_id || null,
            unos.datumVrijeme,
        ];
        await this.baza.ubaciAzurirajPodatke(sql, podaci);
    }
    async dajStatistiku(datumOd, datumDo) {
        let sqlPrijave = `
			SELECT COUNT(*) as broj 
			FROM STATISTIKA 
			WHERE tipRadnje = 'prijava' 
			AND datumVrijeme >= ? 
			AND datumVrijeme <= ?
		`;
        let prijave = await this.baza.dajPodatke(sqlPrijave, [datumOd, datumDo]);
        let sqlOdjave = `
			SELECT COUNT(*) as broj 
			FROM STATISTIKA 
			WHERE tipRadnje = 'odjava' 
			AND datumVrijeme >= ? 
			AND datumVrijeme <= ?
		`;
        let odjave = await this.baza.dajPodatke(sqlOdjave, [datumOd, datumDo]);
        let sqlStranice = `
			SELECT stranica, COUNT(*) as broj 
			FROM STATISTIKA 
			WHERE tipRadnje = 'pristup_stranica' 
			AND datumVrijeme >= ? 
			AND datumVrijeme <= ?
			GROUP BY stranica
		`;
        let stranice = await this.baza.dajPodatke(sqlStranice, [datumOd, datumDo]);
        let sqlEndpoints = `
			SELECT endpoint, COUNT(*) as broj 
			FROM STATISTIKA 
			WHERE tipRadnje = 'pristup_endpoint' 
			AND datumVrijeme >= ? 
			AND datumVrijeme <= ?
			GROUP BY endpoint
		`;
        let endpoints = await this.baza.dajPodatke(sqlEndpoints, [datumOd, datumDo]);
        let sqlRadnje = `
			SELECT vrstaRadnje, COUNT(*) as broj 
			FROM STATISTIKA 
			WHERE tipRadnje = 'radnja' 
			AND datumVrijeme >= ? 
			AND datumVrijeme <= ?
			GROUP BY vrstaRadnje
		`;
        let radnje = await this.baza.dajPodatke(sqlRadnje, [datumOd, datumDo]);
        let pristupiPoStranici = {};
        for (let s of stranice) {
            if (s.stranica) {
                pristupiPoStranici[s.stranica] = s.broj;
            }
        }
        let pristupiPoEndpointu = {};
        for (let e of endpoints) {
            if (e.endpoint) {
                pristupiPoEndpointu[e.endpoint] = e.broj;
            }
        }
        let radnjeRezultat = {
            pregled: 0,
            dodavanje: 0,
            azuriranje: 0,
            brisanje: 0,
        };
        for (let r of radnje) {
            if (r.vrstaRadnje) {
                radnjeRezultat[r.vrstaRadnje] = r.broj;
            }
        }
        return {
            brojPrijava: prijave[0]?.broj || 0,
            brojOdjava: odjave[0]?.broj || 0,
            pristupiPoStranici: pristupiPoStranici,
            pristupiPoEndpointu: pristupiPoEndpointu,
            radnje: radnjeRezultat,
        };
    }
}
