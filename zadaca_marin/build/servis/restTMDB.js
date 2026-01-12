import { TMDBklijent } from "./klijentTMDB.js";
export class RestTMDB {
    tmdbKlijent;
    konf;
    constructor(api_kljuc, konf) {
        this.tmdbKlijent = new TMDBklijent(api_kljuc);
        this.konf = konf;
        this.tmdbKlijent
            .dohvatiSeriju(1396)
            .catch(() => {
        });
    }
    async getZanr(zahtjev, odgovor) {
        try {
            const zanrovi = await this.tmdbKlijent.dohvatiZanrove();
            odgovor.type("application/json").json(zanrovi);
        }
        catch (greska) {
            odgovor.status(400).json(greska);
        }
    }
    async getSerije(zahtjev, odgovor) {
        odgovor.type("application/json");
        const stranica = zahtjev.query["stranica"];
        const trazi = zahtjev.query["trazi"];
        if (typeof stranica !== "string" || typeof trazi !== "string") {
            odgovor.status(400).json({ pogreska: "neocekivani podaci" });
            return;
        }
        if (trazi.length < 2) {
            odgovor.status(200).json({
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            });
            return;
        }
        try {
            const podatakaPoStranici = this.konf.dajKonf().appStranicenje;
            const stranicaBroj = parseInt(stranica);
            const paginacija = this.izracunajPaginaciju(stranicaBroj, podatakaPoStranici);
            const serije = await this.tmdbKlijent.pretraziSerijePoNazivu(trazi, paginacija.tmdbStranica);
            let rezultati = this.izvuciRezultate(serije, paginacija, podatakaPoStranici);
            if (rezultati.length < podatakaPoStranici && serije.total_pages > paginacija.tmdbStranica) {
                rezultati = await this.dohvatiDodatneRezultate(trazi, paginacija, podatakaPoStranici, rezultati, serije);
            }
            const ukupnoStranica = Math.ceil(serije.total_results / podatakaPoStranici);
            odgovor.status(200).json({
                page: stranicaBroj,
                results: rezultati,
                total_pages: ukupnoStranica,
                total_results: serije.total_results
            });
        }
        catch (greska) {
            odgovor.status(400).json({ pogreska: "Greška pri pretraživanju serija" });
        }
    }
    async getSerijaDetalji(zahtjev, odgovor) {
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
            const detalji = await this.tmdbKlijent.dohvatiSeriju(id);
            odgovor.status(200).json(detalji);
        }
        catch (greska) {
            odgovor.status(400).json({ pogreska: "Greška pri dohvaćanju detalja serije" });
        }
    }
    izracunajPaginaciju(stranicaBroj, podatakaPoStranici) {
        const tmdbStranica = Math.floor((stranicaBroj - 1) * podatakaPoStranici / 20) + 1;
        const offsetUnutarStranice = ((stranicaBroj - 1) * podatakaPoStranici) % 20;
        return { tmdbStranica, offsetUnutarStranice };
    }
    izvuciRezultate(serije, paginacija, podatakaPoStranici) {
        const pocetak = paginacija.offsetUnutarStranice;
        return serije.results.slice(pocetak, pocetak + podatakaPoStranici);
    }
    async dohvatiDodatneRezultate(trazi, paginacija, podatakaPoStranici, rezultati, serije) {
        const sljedecaStranica = await this.tmdbKlijent.pretraziSerijePoNazivu(trazi, paginacija.tmdbStranica + 1);
        const potrebnoDodatnih = podatakaPoStranici - rezultati.length;
        return rezultati.concat(sljedecaStranica.results.slice(0, potrebnoDodatnih));
    }
}
