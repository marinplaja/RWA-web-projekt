import { __dirname } from "../zajednicko/esmPomocnik.js";
import ds from "fs/promises";
import path from "path";
import { zabiljeziPristupStranici } from "../servis/statistikaPomocnik.js";
export class HtmlUpravitelj {
    portRest;
    constructor(portRest, konf) {
        this.portRest = portRest;
    }
    provjeriPristupPoUlozi(ulogaKorisnika, potrebnaUloga) {
        if (!ulogaKorisnika) {
            return potrebnaUloga === "guest";
        }
        const hijerarhija = {
            "guest": 0,
            "user": 1,
            "admin": 2
        };
        return (hijerarhija[ulogaKorisnika] ?? 0) >= (hijerarhija[potrebnaUloga] ?? 0);
    }
    async pocetna(zahtjev, odgovor) {
        zabiljeziPristupStranici(zahtjev, "/");
        const pocetna = await this.ucitajStranicu("pocetna", zahtjev);
        odgovor.cookie("portRest", this.portRest, { httpOnly: false });
        odgovor.send(pocetna);
    }
    async registracija(zahtjev, odgovor) {
        zabiljeziPristupStranici(zahtjev, "/reg");
        const stranica = await this.ucitajStranicu("registracija", zahtjev);
        odgovor.send(stranica);
    }
    async odjava(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        sesija.korisnik = null;
        zahtjev.session.destroy(() => { });
        odgovor.clearCookie("uloga");
        odgovor.redirect("/");
    }
    async prijava(zahtjev, odgovor) {
        zabiljeziPristupStranici(zahtjev, "/prijava");
        const stranica = await this.ucitajStranicu("prijava", zahtjev);
        odgovor.send(stranica);
    }
    async detalji(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!this.provjeriPristupPoUlozi(sesija?.uloga, "user")) {
            return odgovor.redirect("/prijava");
        }
        zabiljeziPristupStranici(zahtjev, "/detalji");
        const stranica = await this.ucitajStranicu("detalji", zahtjev);
        odgovor.cookie("portRest", this.portRest, { httpOnly: false });
        odgovor.send(stranica);
    }
    async gledano(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!this.provjeriPristupPoUlozi(sesija?.uloga, "user")) {
            return odgovor.redirect("/prijava");
        }
        zabiljeziPristupStranici(zahtjev, "/gledano");
        const stranica = await this.ucitajStranicu("gledano", zahtjev);
        odgovor.cookie("portRest", this.portRest, { httpOnly: false });
        odgovor.send(stranica);
    }
    async korisnici(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!this.provjeriPristupPoUlozi(sesija?.uloga, "admin")) {
            return odgovor.redirect("/");
        }
        zabiljeziPristupStranici(zahtjev, "/korisnici");
        const stranica = await this.ucitajStranicu("korisnici", zahtjev);
        odgovor.cookie("portRest", this.portRest, { httpOnly: false });
        odgovor.send(stranica);
    }
    async info(zahtjev, odgovor) {
        zabiljeziPristupStranici(zahtjev, "/info");
        try {
            let dokumentacija = await ds.readFile(path.join(__dirname(), "../../dokumentacija/dokumentacija.html"), "utf-8");
            const navigacija = await this.ucitajHTML("navigacija");
            dokumentacija = dokumentacija
                .replace("#navigacija#", navigacija)
                .replace(/#korisnikInfo#/g, "")
                .replace(/#datumVrijeme#/g, "");
            odgovor.send(dokumentacija);
        }
        catch (greska) {
            odgovor.status(404).send("Dokumentacija nije pronađena");
        }
    }
    async ucitajStranicu(nazivStranice, zahtjev) {
        const [stranica, nav] = await Promise.all([
            this.ucitajHTML(nazivStranice),
            this.ucitajHTML("navigacija"),
        ]);
        if (!stranica || !nav)
            return "";
        return stranica
            .replace("#navigacija#", nav)
            .replace(/#korisnikInfo#/g, "")
            .replace(/#datumVrijeme#/g, "");
    }
    ucitajHTML(htmlStranica) {
        return ds.readFile(__dirname() + "/html/" + htmlStranica + ".html", "utf-8");
    }
}
