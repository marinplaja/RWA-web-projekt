import { StatistikaDAO } from "./statistikaDAO.js";
import { KorisnikDAO } from "./korisnikDAO.js";
let statistikaDAO = null;
let korisnikDAO = null;
export async function inicijalizirajStatistiku() {
    if (!statistikaDAO) {
        statistikaDAO = new StatistikaDAO();
        await statistikaDAO.inicijaliziraj();
    }
    if (!korisnikDAO) {
        korisnikDAO = new KorisnikDAO();
    }
}
export async function dodajStatistiku(unos) {
    try {
        if (!statistikaDAO) {
            await inicijalizirajStatistiku();
        }
        await statistikaDAO.dodaj(unos);
    }
    catch (greska) {
        console.error("Greška pri dodavanju statistike:", greska);
    }
}
async function dohvatiKorisnikId(korime) {
    if (!korime)
        return null;
    try {
        if (!korisnikDAO) {
            await inicijalizirajStatistiku();
        }
        let korisnik = await korisnikDAO.dajSaUlogom(korime);
        return korisnik ? korisnik.idKORISNIK : null;
    }
    catch {
        return null;
    }
}
export async function zabiljeziPrijavu(korime) {
    let korisnik_id = await dohvatiKorisnikId(korime);
    await dodajStatistiku({
        tipRadnje: "prijava",
        korisnik_id: korisnik_id ?? undefined,
        datumVrijeme: new Date().toISOString(),
    });
}
export async function zabiljeziOdjavu(korime) {
    let korisnik_id = await dohvatiKorisnikId(korime);
    await dodajStatistiku({
        tipRadnje: "odjava",
        korisnik_id: korisnik_id ?? undefined,
        datumVrijeme: new Date().toISOString(),
    });
}
export async function zabiljeziPristupStranici(zahtjev, stranica) {
    let sesija = zahtjev.session;
    let korisnik_id = await dohvatiKorisnikId(sesija.korime);
    await dodajStatistiku({
        tipRadnje: "pristup_stranica",
        stranica: stranica,
        korisnik_id: korisnik_id ?? undefined,
        datumVrijeme: new Date().toISOString(),
    });
}
export async function zabiljeziPristupEndpointu(zahtjev, endpoint) {
    try {
        let sesija = zahtjev.session;
        let korisnik_id = await dohvatiKorisnikId(sesija.korime);
        await dodajStatistiku({
            tipRadnje: "pristup_endpoint",
            endpoint: endpoint,
            korisnik_id: korisnik_id ?? undefined,
            datumVrijeme: new Date().toISOString(),
        });
    }
    catch {
    }
}
export async function zabiljeziRadnju(zahtjev, vrstaRadnje, endpoint) {
    try {
        let sesija = zahtjev.session;
        let korisnik_id = await dohvatiKorisnikId(sesija.korime);
        await dodajStatistiku({
            tipRadnje: "radnja",
            vrstaRadnje: vrstaRadnje,
            endpoint: endpoint,
            korisnik_id: korisnik_id ?? undefined,
            datumVrijeme: new Date().toISOString(),
        });
    }
    catch {
    }
}
