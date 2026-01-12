import { SerijaDAO } from "./serijaDAO.js";
import { KorisnikDAO } from "./korisnikDAO.js";
import { TMDBklijent } from "./klijentTMDB.js";
import { zabiljeziPristupEndpointu, zabiljeziRadnju } from "./statistikaPomocnik.js";
export class RestSerija {
    sdao;
    kdao;
    tmdbKlijent;
    constructor(api_kljuc) {
        this.sdao = new SerijaDAO();
        this.kdao = new KorisnikDAO();
        this.tmdbKlijent = new TMDBklijent(api_kljuc);
    }
    provjeriAutorizaciju(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!sesija?.korisnik || !sesija?.korime) {
            odgovor.status(403).json({ pogreska: "zabranjen pristup" });
            return false;
        }
        return true;
    }
    parsirajId(zahtjev, odgovor) {
        const idParam = zahtjev.params["id"];
        if (!idParam) {
            odgovor.status(400).json({ pogreska: "Nevaljan ID" });
            return null;
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            odgovor.status(400).json({ pogreska: "Nevaljan ID" });
            return null;
        }
        return id;
    }
    async getSerije(zahtjev, odgovor) {
        zabiljeziPristupEndpointu(zahtjev, "/rest/serije");
        zabiljeziRadnju(zahtjev, "pregled", "/rest/serije");
        odgovor.type("application/json");
        try {
            const stranicaParam = zahtjev.query["stranica"];
            const stranica = Math.max(1, parseInt(stranicaParam) || 1);
            const podatakaPoStranici = 5;
            const sveSerije = await this.sdao.dajSve();
            const ukupno = sveSerije.length;
            const ukupnoStranica = Math.ceil(ukupno / podatakaPoStranici);
            const pocetak = (stranica - 1) * podatakaPoStranici;
            odgovor.status(200).json({
                results: sveSerije.slice(pocetak, pocetak + podatakaPoStranici),
                page: stranica,
                total_pages: ukupnoStranica,
                total_results: ukupno
            });
        }
        catch (greska) {
            odgovor.status(400).json({ pogreska: "Greška pri dohvaćanju serija" });
        }
    }
    async postSerije(zahtjev, odgovor) {
        if (!this.provjeriAutorizaciju(zahtjev, odgovor))
            return;
        odgovor.type("application/json");
        const podaci = zahtjev.body;
        if (!podaci?.naziv || !podaci?.tmdb_id) {
            odgovor.status(400).json({ pogreska: "Nedostaju obavezni podaci" });
            return;
        }
        if (await this.sdao.dajPoTmdbId(podaci.tmdb_id)) {
            odgovor.status(400).json({ pogreska: "Serija već postoji u bazi" });
            return;
        }
        try {
            zabiljeziPristupEndpointu(zahtjev, "/rest/serije");
            await this.sdao.dodaj(podaci);
            zabiljeziRadnju(zahtjev, "dodavanje", "/rest/serije");
            odgovor.status(201).json({ izvrseno: "ok" });
        }
        catch (greska) {
            odgovor.status(400).json({ pogreska: "Greška pri dodavanju serije" });
        }
    }
    async getSerija(zahtjev, odgovor) {
        odgovor.type("application/json");
        const id = this.parsirajId(zahtjev, odgovor);
        if (id === null)
            return;
        const serija = await this.sdao.daj(id);
        if (!serija) {
            odgovor.status(404).json({ pogreska: "nema resursa" });
            return;
        }
        odgovor.status(200).json(serija);
    }
    async getSerijaOdgledano(zahtjev, odgovor) {
        odgovor.type("application/json");
        const sesija = zahtjev.session;
        const korime = sesija?.korime;
        if (!korime) {
            odgovor.status(200).json({
                results: [],
                page: 1,
                total_pages: 0,
                total_results: 0
            });
            return;
        }
        const korisnikPodaci = await this.kdao.dajSaUlogom(korime);
        if (!korisnikPodaci) {
            odgovor.status(400).json({ pogreska: "Korisnik nije pronađen" });
            return;
        }
        try {
            const idParam = zahtjev.params["id"];
            const id = idParam ? parseInt(idParam) : 0;
            if (isNaN(id)) {
                odgovor.status(400).json({ pogreska: "Nevaljan ID" });
                return;
            }
            if (id === 0 || !idParam) {
                const stranicaParam = zahtjev.query["stranica"];
                const stranica = Math.max(1, parseInt(stranicaParam) || 1);
                const podatakaPoStranici = 5;
                const sveOdgledane = await this.sdao.dajOdgledaneSerije(korisnikPodaci.idKORISNIK);
                const ukupno = sveOdgledane.length;
                const ukupnoStranica = Math.ceil(ukupno / podatakaPoStranici);
                const pocetak = (stranica - 1) * podatakaPoStranici;
                odgovor.status(200).json({
                    results: sveOdgledane.slice(pocetak, pocetak + podatakaPoStranici),
                    page: stranica,
                    total_pages: ukupnoStranica,
                    total_results: ukupno
                });
                return;
            }
            const jeOdgledana = await this.sdao.provjeriJeLiOdgledana(korisnikPodaci.idKORISNIK, id);
            odgovor.status(200).json({ odgledana: jeOdgledana });
        }
        catch (greska) {
            odgovor.status(400).json({ pogreska: "Greška pri dohvaćanju odgledanih serija" });
        }
    }
    async postSerijaOdgledano(zahtjev, odgovor) {
        if (!this.provjeriAutorizaciju(zahtjev, odgovor))
            return;
        odgovor.type("application/json");
        const id = this.parsirajId(zahtjev, odgovor);
        if (id === null)
            return;
        const korisnikPodaci = await this.dohvatiKorisnika(zahtjev, odgovor);
        if (!korisnikPodaci)
            return;
        if (!(await this.provjeriSeriju(id, odgovor)))
            return;
        if (await this.provjeriJeLiOdgledana(korisnikPodaci.idKORISNIK, id, odgovor))
            return;
        await this.dodajOdgledanuSeriju(zahtjev, korisnikPodaci.idKORISNIK, id, odgovor);
    }
    async deleteSerijaOdgledano(zahtjev, odgovor) {
        if (!this.provjeriAutorizaciju(zahtjev, odgovor))
            return;
        odgovor.type("application/json");
        const id = this.parsirajId(zahtjev, odgovor);
        if (id === null)
            return;
        const korisnikPodaci = await this.dohvatiKorisnika(zahtjev, odgovor);
        if (!korisnikPodaci)
            return;
        await this.obrisiOdgledanuSeriju(zahtjev, korisnikPodaci.idKORISNIK, id, odgovor);
    }
    async getSerijaDetaljiTMDB(zahtjev, odgovor) {
        if (!this.provjeriAutorizaciju(zahtjev, odgovor))
            return;
        zabiljeziPristupEndpointu(zahtjev, "/rest/serije/:id/detalji");
        zabiljeziRadnju(zahtjev, "pregled", "/rest/serije/:id/detalji");
        odgovor.type("application/json");
        const idParam = zahtjev.params["id"];
        if (!idParam) {
            odgovor.status(400).json({ pogreska: "Nevaljan ID" });
            return;
        }
        const id = parseInt(idParam);
        if (isNaN(id)) {
            odgovor.status(400).json({ pogreska: "Nevaljan ID" });
            return;
        }
        try {
            const serija = await this.sdao.dajPoTmdbId(id);
            if (serija) {
                const odgovorPodaci = await this.dohvatiDetaljeSaSerijom(id);
                odgovor.status(200).json(odgovorPodaci);
                return;
            }
            const detalji = await this.tmdbKlijent.dohvatiSeriju(id);
            odgovor.status(200).json({ serija: null, detalji });
        }
        catch (greska) {
            odgovor.status(400).json({ pogreska: "Greška pri dohvaćanju detalja serije" });
        }
    }
    async dohvatiDetaljeSaSerijom(id) {
        const [detalji, slicne, videi, serija] = await Promise.all([
            this.tmdbKlijent.dohvatiSeriju(id),
            this.tmdbKlijent.dohvatiSlicneSerije(id),
            this.tmdbKlijent.dohvatiVidee(id),
            this.sdao.dajPoTmdbId(id)
        ]);
        const youtubeVideo = videi.find((v) => v.site === "YouTube" && v.type === "Trailer");
        return {
            serija,
            detalji,
            slicne: slicne.results.slice(0, 5),
            youtubeVideo: youtubeVideo?.key || null,
        };
    }
    async dohvatiKorisnika(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        const korisnikPodaci = await this.kdao.dajSaUlogom(sesija?.korime);
        if (!korisnikPodaci) {
            odgovor.status(400).json({ pogreska: "Korisnik nije pronađen" });
            return null;
        }
        return korisnikPodaci;
    }
    async provjeriSeriju(id, odgovor) {
        const serija = await this.sdao.daj(id);
        if (!serija) {
            odgovor.status(404).json({ pogreska: "nema resursa" });
            return false;
        }
        return true;
    }
    async provjeriJeLiOdgledana(korisnikId, serijaId, odgovor) {
        const jeOdgledana = await this.sdao.provjeriJeLiOdgledana(korisnikId, serijaId);
        if (jeOdgledana) {
            odgovor.status(400).json({ pogreska: "Serija je već u popisu odgledanih" });
            return true;
        }
        return false;
    }
    async dodajOdgledanuSeriju(zahtjev, korisnikId, serijaId, odgovor) {
        try {
            zabiljeziPristupEndpointu(zahtjev, "/rest/serije/:id/odgledano");
            await this.sdao.dodajOdgledanuSeriju({
                korisnik_id: korisnikId,
                serija_id: serijaId,
            });
            zabiljeziRadnju(zahtjev, "dodavanje", "/rest/serije/:id/odgledano");
            odgovor.status(201).json({ izvrseno: "ok" });
        }
        catch (greska) {
            odgovor.status(400).json({ pogreska: "Greška pri dodavanju odgledane serije" });
        }
    }
    async obrisiOdgledanuSeriju(zahtjev, korisnikId, serijaId, odgovor) {
        try {
            zabiljeziPristupEndpointu(zahtjev, "/rest/serije/:id/odgledano");
            await this.sdao.obrisiOdgledanuSeriju(korisnikId, serijaId);
            zabiljeziRadnju(zahtjev, "brisanje", "/rest/serije/:id/odgledano");
            odgovor.status(201).json({ izvrseno: "ok" });
        }
        catch (greska) {
            odgovor.status(400).json({ pogreska: "Greška pri brisanju odgledane serije" });
        }
    }
}
