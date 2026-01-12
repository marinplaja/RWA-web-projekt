import Baza from "../zajednicko/sqliteBaza.js";
export class KorisnikDAO {
    baza;
    constructor() {
        this.baza = new Baza("podaci/RWA2025mplastic21.sqlite");
        this.baza.spoji();
    }
    async dajSve() {
        let sql = "SELECT ime, prezime, korime, lozinka, email, status, uloga FROM KORISNIK;";
        var podaci = (await this.baza.dajPodatke(sql, []));
        return podaci;
    }
    async daj(korime) {
        let sql = "SELECT ime, prezime, korime, lozinka, email, status, uloga FROM KORISNIK WHERE korime=?;";
        var podaci = (await this.baza.dajPodatke(sql, [
            korime,
        ]));
        if (podaci.length == 1 && podaci[0] != undefined) {
            let k = podaci[0];
            return k;
        }
        return null;
    }
    async dajPoId(id) {
        let sql = "SELECT ime, prezime, korime, lozinka, email, status, uloga FROM KORISNIK WHERE idKORISNIK=?;";
        var podaci = (await this.baza.dajPodatke(sql, [
            id,
        ]));
        if (podaci.length == 1 && podaci[0] != undefined) {
            let k = podaci[0];
            return k;
        }
        return null;
    }
    async dajSaUlogom(korime) {
        let sql = "SELECT idKORISNIK, ime, prezime, korime, lozinka, email, uloga, status, " +
            "COALESCE(brojNeuspjesnihPrijava, 0) as brojNeuspjesnihPrijava " +
            "FROM KORISNIK WHERE korime=?;";
        var podaci = (await this.baza.dajPodatke(sql, [korime]));
        if (podaci.length == 1 && podaci[0] != undefined) {
            return podaci[0];
        }
        return null;
    }
    async dodaj(korisnik) {
        let sql = `INSERT INTO KORISNIK ` +
            `(ime,prezime,lozinka,email,korime,uloga,status,telefon,adresa,grad,brojNeuspjesnihPrijava) ` +
            `VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
        let podaci = [
            korisnik.ime,
            korisnik.prezime,
            korisnik.lozinka,
            korisnik.email,
            korisnik.korime,
            "user",
            "active",
            korisnik.telefon || null,
            korisnik.adresa || null,
            korisnik.grad || null,
            0,
        ];
        await this.baza.ubaciAzurirajPodatke(sql, podaci);
        return true;
    }
    async obrisi(korime) {
        let sql = "DELETE FROM KORISNIK WHERE korime=?";
        await this.baza.ubaciAzurirajPodatke(sql, [korime]);
        return true;
    }
    async azuriraj(korime, korisnik) {
        let sql = `UPDATE KORISNIK SET ime=?, prezime=?, lozinka=?, email=?, korime=? WHERE korime=?`;
        let podaci = [
            korisnik.ime,
            korisnik.prezime,
            korisnik.lozinka,
            korisnik.email,
            korisnik.korime,
            korime,
        ];
        await this.baza.ubaciAzurirajPodatke(sql, podaci);
        return true;
    }
    async azurirajStatus(korime, status, brojNeuspjesnihPrijava) {
        let sql = `UPDATE KORISNIK SET status=?, brojNeuspjesnihPrijava=? WHERE korime=?`;
        await this.baza.ubaciAzurirajPodatke(sql, [status, brojNeuspjesnihPrijava, korime]);
        return true;
    }
    async azurirajUlogu(korime, uloga) {
        let sql = `UPDATE KORISNIK SET uloga=? WHERE korime=?`;
        await this.baza.ubaciAzurirajPodatke(sql, [uloga, korime]);
        return true;
    }
    async povecajBrojNeuspjesnihPrijava(korime) {
        let sql = `UPDATE KORISNIK SET brojNeuspjesnihPrijava = COALESCE(brojNeuspjesnihPrijava, 0) + 1 WHERE korime=?`;
        await this.baza.ubaciAzurirajPodatke(sql, [korime]);
    }
    async resetirajBrojNeuspjesnihPrijava(korime) {
        let sql = `UPDATE KORISNIK SET brojNeuspjesnihPrijava = 0 WHERE korime=?`;
        await this.baza.ubaciAzurirajPodatke(sql, [korime]);
    }
    async dajBrojNeuspjesnihPrijava(korime) {
        let sql = `SELECT COALESCE(brojNeuspjesnihPrijava, 0) as broj FROM KORISNIK WHERE korime=?`;
        var podaci = await this.baza.dajPodatke(sql, [korime]);
        if (podaci.length > 0) {
            return podaci[0].broj || 0;
        }
        return 0;
    }
}
