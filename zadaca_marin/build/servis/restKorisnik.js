import { KorisnikDAO } from "./korisnikDAO.js";
import { kreirajSHA256 } from "../zajednicko/kodovi.js";
import { zabiljeziPrijavu, zabiljeziOdjavu, zabiljeziPristupEndpointu, zabiljeziRadnju } from "./statistikaPomocnik.js";
export class RestKorisnik {
    kdao;
    konf;
    constructor(konf) {
        this.kdao = new KorisnikDAO();
        this.konf = konf;
    }
    provjeriAutorizaciju(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!sesija?.korisnik || !sesija?.korime) {
            odgovor.status(403).json({ pogreska: "zabranjen pristup" });
            return false;
        }
        return true;
    }
    async provjeriAdmin(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!sesija?.korisnik || !sesija?.korime) {
            odgovor.status(403).json({ pogreska: "zabranjen pristup nedovoljna prava" });
            return false;
        }
        const korisnik = await this.kdao.dajSaUlogom(sesija.korime);
        if (korisnik?.uloga !== "admin") {
            odgovor.status(403).json({ pogreska: "zabranjen pristup nedovoljna prava" });
            return false;
        }
        return true;
    }
    async getKorisnici(zahtjev, odgovor) {
        if (!(await this.provjeriAdmin(zahtjev, odgovor)))
            return;
        zabiljeziPristupEndpointu(zahtjev, "/rest/korisnici");
        zabiljeziRadnju(zahtjev, "pregled", "/rest/korisnici");
        const stranicaParam = zahtjev.query["stranica"];
        const stranica = Math.max(1, parseInt(stranicaParam) || 1);
        const podatakaPoStranici = 5;
        const sviKorisnici = await this.kdao.dajSve();
        sviKorisnici.forEach((k) => { k.lozinka = null; });
        const ukupno = sviKorisnici.length;
        const ukupnoStranica = Math.ceil(ukupno / podatakaPoStranici);
        const pocetak = (stranica - 1) * podatakaPoStranici;
        const korisnici = sviKorisnici.slice(pocetak, pocetak + podatakaPoStranici);
        odgovor.type("application/json").status(200).json({
            results: korisnici,
            page: stranica,
            total_pages: ukupnoStranica,
            total_results: ukupno
        });
    }
    async postKorisnici(zahtjev, odgovor) {
        zabiljeziPristupEndpointu(zahtjev, "/rest/korisnici");
        odgovor.type("application/json");
        const podaci = zahtjev.body;
        const korime = podaci.korime;
        const email = podaci.email;
        const lozinka = podaci.lozinka;
        if (!korime?.trim() || !email?.trim() || !lozinka?.trim()) {
            odgovor.status(400).json({
                pogreska: "Nedostaju obavezni podaci (email, korisničko ime, lozinka)"
            });
            return;
        }
        if (await this.kdao.daj(korime)) {
            odgovor.status(400).json({ pogreska: "Korisničko ime zauzeto!" });
            return;
        }
        podaci.ime = podaci.ime?.trim() || "";
        podaci.prezime = podaci.prezime?.trim() || "";
        podaci.lozinka = kreirajSHA256(lozinka, korime);
        await this.kdao.dodaj(podaci);
        zabiljeziRadnju(zahtjev, "dodavanje", "/rest/korisnici");
        odgovor.status(201).json({ izvrseno: "ok" });
    }
    deleteKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json").status(405).json({ pogreska: "metoda nije podržana" });
    }
    putKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json").status(405).json({ pogreska: "metoda nije podržana" });
    }
    async getKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json");
        const korime = zahtjev.params["korime"];
        if (!korime) {
            odgovor.status(400).json({ pogreska: "Nepostojeće korime" });
            return;
        }
        const korisnik = await this.kdao.daj(korime);
        if (!korisnik) {
            odgovor.status(404).json({ pogreska: "nema resursa" });
            return;
        }
        korisnik.lozinka = null;
        odgovor.status(200).json(korisnik);
    }
    async getKorisnikMe(zahtjev, odgovor) {
        odgovor.type("application/json");
        const sesija = zahtjev.session;
        if (!sesija?.korime) {
            odgovor.status(401).json({ pogreska: "Niste prijavljeni" });
            return;
        }
        try {
            const korisnikPodaci = await this.kdao.dajSaUlogom(sesija.korime);
            if (!korisnikPodaci) {
                odgovor.status(404).json({ pogreska: "Korisnik nije pronađen" });
                return;
            }
            odgovor.status(200).json({
                korime: korisnikPodaci.korime,
                ime: korisnikPodaci.ime,
                prezime: korisnikPodaci.prezime,
                email: korisnikPodaci.email,
                uloga: korisnikPodaci.uloga || "user"
            });
        }
        catch (greska) {
            odgovor.status(400).json({
                pogreska: `Greška pri dohvaćanju podataka korisnika: ${greska?.message || "Nepoznata greška"}`
            });
        }
    }
    postKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json").status(405).json({ pogreska: "metoda nije podržana" });
    }
    async putKorisnik(zahtjev, odgovor) {
        if (!this.provjeriAutorizaciju(zahtjev, odgovor))
            return;
        odgovor.type("application/json");
        const korime = zahtjev.params["korime"];
        if (!korime) {
            odgovor.status(400).json({ pogreska: "Nedostaje korime" });
            return;
        }
        const sesija = zahtjev.session;
        const korisnikLogirani = await this.kdao.dajSaUlogom(sesija.korime);
        const isAdmin = korisnikLogirani?.uloga === "admin";
        if (korime !== sesija.korime && !isAdmin) {
            odgovor.status(403).json({ pogreska: "zabranjen pristup nedovoljna prava" });
            return;
        }
        const podaci = zahtjev.body;
        if (!podaci.lozinka) {
            odgovor.status(400).json({ pogreska: "Lozinka je obavezna!" });
            return;
        }
        if (!podaci.korime) {
            podaci.korime = korime;
        }
        podaci.lozinka = kreirajSHA256(podaci.lozinka, podaci.korime);
        zabiljeziPristupEndpointu(zahtjev, "/rest/korisnici/:korime");
        await this.kdao.azuriraj(korime, podaci);
        zabiljeziRadnju(zahtjev, "azuriranje", "/rest/korisnici/:korime");
        odgovor.status(201).json({ izvrseno: "ok" });
    }
    deleteKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json").status(405).json({ pogreska: "metoda nije podržana" });
    }
    async getKorisnikPrijava(zahtjev, odgovor) {
        try {
            odgovor.type("application/json");
            const korime = zahtjev.params["korime"];
            const lozinka = zahtjev.body?.lozinka;
            if (!this.provjeriPodatkePrijave(korime, lozinka, odgovor)) {
                return;
            }
            if (!korime || !lozinka) {
                return;
            }
            const korimeString = korime;
            const lozinkaString = lozinka;
            const korisnikPodaci = await this.kdao.dajSaUlogom(korimeString);
            if (!this.provjeriKorisnika(korisnikPodaci, odgovor)) {
                return;
            }
            if (!(await this.provjeriLozinku(korimeString, lozinkaString, korisnikPodaci.lozinka, odgovor))) {
                return;
            }
            await this.izvrsiPrijavu(zahtjev, korimeString, korisnikPodaci, odgovor);
        }
        catch (greska) {
            console.error("Greška u getKorisnikPrijava:", greska);
            odgovor.status(400).json({
                pogreska: `Greška na serveru: ${greska?.message || "Nepoznata greška"}`
            });
        }
    }
    provjeriPodatkePrijave(korime, lozinka, odgovor) {
        if (!korime || !lozinka) {
            odgovor.status(400).json({ pogreska: "Krivi podaci!" });
            return false;
        }
        return true;
    }
    provjeriKorisnika(korisnikPodaci, odgovor) {
        if (!korisnikPodaci) {
            odgovor.status(400).json({ pogreska: "Krivi podaci!" });
            return false;
        }
        if (korisnikPodaci.status === "locked") {
            odgovor.status(400).json({ pogreska: "Korisnički račun je zaključan!" });
            return false;
        }
        return true;
    }
    async izvrsiPrijavu(zahtjev, korime, korisnikPodaci, odgovor) {
        await this.kdao.resetirajBrojNeuspjesnihPrijava(korime);
        const korisnik = {
            ime: korisnikPodaci.ime,
            prezime: korisnikPodaci.prezime,
            korime: korisnikPodaci.korime,
            email: korisnikPodaci.email,
            lozinka: null,
        };
        this.postaviSesiju(zahtjev, korisnik, korisnikPodaci.uloga, odgovor);
        zabiljeziPrijavu(korime);
        odgovor.status(201).json(korisnik);
    }
    async provjeriLozinku(korime, lozinka, lozinkaHash, odgovor) {
        const unesenaLozinkaHash = kreirajSHA256(lozinka, korime);
        if (lozinkaHash === unesenaLozinkaHash) {
            return true;
        }
        let brojNeuspjesnih = await this.kdao.dajBrojNeuspjesnihPrijava(korime);
        brojNeuspjesnih++;
        await this.kdao.povecajBrojNeuspjesnihPrijava(korime);
        if (brojNeuspjesnih >= this.konf.dajKonf().neuspjesnePrijave) {
            await this.kdao.azurirajStatus(korime, "locked", brojNeuspjesnih);
            odgovor.status(400).json({
                pogreska: "Korisnički račun je zaključan zbog previše neuspješnih prijava!"
            });
            return false;
        }
        odgovor.status(400).json({ pogreska: "Krivi podaci!" });
        return false;
    }
    postaviSesiju(zahtjev, korisnik, uloga, odgovor) {
        const sesija = zahtjev.session;
        sesija.korisnik = `${korisnik.ime} ${korisnik.prezime}`;
        sesija.korime = korisnik.korime;
        sesija.uloga = uloga || "user";
        odgovor.cookie("uloga", sesija.uloga, { httpOnly: false });
    }
    async putKorisnikPrijava(zahtjev, odgovor) {
        if (!this.provjeriAutorizaciju(zahtjev, odgovor))
            return;
        odgovor.type("application/json");
        const korime = zahtjev.params["korime"];
        const sesija = zahtjev.session;
        if (korime !== sesija.korime) {
            odgovor.status(403).json({ pogreska: "zabranjen pristup nedovoljna prava" });
            return;
        }
        zabiljeziOdjavu(korime);
        zahtjev.session?.destroy(() => { });
        odgovor.status(201).json({ izvrseno: "ok" });
    }
    async putKorisnikStatus(zahtjev, odgovor) {
        if (!(await this.provjeriAdmin(zahtjev, odgovor)))
            return;
        zabiljeziPristupEndpointu(zahtjev, "/rest/korisnici/:korime/status");
        odgovor.type("application/json");
        const korime = zahtjev.params["korime"];
        if (!korime) {
            odgovor.status(400).json({ pogreska: "Nedostaje korime" });
            return;
        }
        const status = zahtjev.body?.status;
        const brojNeuspjesnihPrijava = zahtjev.body?.brojNeuspjesnihPrijava || 0;
        if (status !== "active" && status !== "locked") {
            odgovor.status(400).json({ pogreska: "Nevaljan status" });
            return;
        }
        try {
            await this.kdao.azurirajStatus(korime, status, brojNeuspjesnihPrijava);
            zabiljeziRadnju(zahtjev, "azuriranje", "/rest/korisnici/:korime/status");
            odgovor.status(201).json({ izvrseno: "ok" });
        }
        catch (greska) {
            console.error("Greška pri ažuriranju statusa:", greska);
            odgovor.status(400).json({
                pogreska: `Greška pri ažuriranju statusa korisnika: ${greska?.message || "Nepoznata greška"}`
            });
        }
    }
}
