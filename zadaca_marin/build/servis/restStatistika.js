import { StatistikaDAO } from "./statistikaDAO.js";
import { KorisnikDAO } from "./korisnikDAO.js";
export class RestStatistika {
    sdao;
    kdao;
    constructor() {
        this.sdao = new StatistikaDAO();
        this.kdao = new KorisnikDAO();
    }
    async provjeriAdmin(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!sesija?.korisnik || !sesija?.korime) {
            odgovor.status(403).json({ pogreska: "zabranjen pristup" });
            return false;
        }
        const korisnik = await this.kdao.dajSaUlogom(sesija.korime);
        if (korisnik?.uloga !== "admin") {
            odgovor.status(403).json({ pogreska: "zabranjen pristup nedovoljna prava" });
            return false;
        }
        return true;
    }
    async getStatistika(zahtjev, odgovor) {
        if (!(await this.provjeriAdmin(zahtjev, odgovor)))
            return;
        odgovor.type("application/json");
        const datumOd = zahtjev.query["od"];
        const datumDo = zahtjev.query["do"];
        if (!datumOd || !datumDo) {
            odgovor.status(400).json({ pogreska: "Nedostaju parametri 'od' i 'do'" });
            return;
        }
        try {
            await this.sdao.inicijaliziraj();
            const statistika = await this.sdao.dajStatistiku(datumOd, datumDo);
            odgovor.status(200).json(statistika);
        }
        catch (greska) {
            console.error("Greška pri dohvaćanju statistike:", greska);
            odgovor.status(400).json({
                pogreska: `Greška pri dohvaćanju statistike: ${greska?.message || "Nepoznata greška"}`
            });
        }
    }
}
