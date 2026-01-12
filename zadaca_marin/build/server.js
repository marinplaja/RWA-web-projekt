import sesija from "express-session";
import cors from "cors";
import express from "express";
import { dajPort } from "./zajednicko/esmPomocnik.js";
import { Konfiguracija } from "./zajednicko/konfiguracija.js";
import { pripremiPutanjeResursKorisnika, pripremiPutanjeResursTMDB, pripremiPutanjeResursSerija, pripremiPutanjeResursStatistika, } from "./servis/servis.js";
import { pripremiPutanjeWebAplikacije, pripremiStaticnePutanje, } from "./aplikacija/aplikacija.js";
main(process.argv);
async function main(argv) {
    const port = argv[3] ? parseInt(argv[3]) : dajPort("mplastic21");
    const server = express();
    try {
        const konf = await inicjalizirajKonfiguraciju();
        inicjalizirajPostavkeServera(server, konf);
        pripremiPutanjeServera(server, konf, port);
        pokreniServer(server, port);
    }
    catch (greska) {
        if (process.argv.length === 2) {
            console.error("Potrebno je dati naziv datoteke");
        }
        else if (greska.path) {
            console.error("Nije moguće otvoriti datoteku: " + greska.path);
        }
        else {
            console.error(greska.message);
        }
        process.exit(1);
    }
}
function inicjalizirajPostavkeServera(server, konf) {
    server.use(sesija({
        secret: konf.dajKonf().tajniKljucSesija,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * konf.dajKonf().trajanjeSesije },
        resave: false,
    }));
    server.use(express.urlencoded({ extended: true }));
    server.use(express.json());
    server.use(cors({
        origin: provjeriCorsOrigin,
        optionsSuccessStatus: 200,
    }));
}
function provjeriCorsOrigin(origin, callback) {
    const dozvoljeno = !origin ||
        origin.startsWith("http://spider.foi.hr:") ||
        origin.startsWith("http://localhost:");
    const greska = dozvoljeno ? null : new Error("Nije dozvoljeno zbog CORS");
    callback(greska, dozvoljeno);
}
async function inicjalizirajKonfiguraciju() {
    const konf = new Konfiguracija();
    await konf.ucitajKonfiguraciju();
    return konf;
}
function pripremiPutanjeServera(server, konf, port) {
    pripremiPutanjeResursKorisnika(server, konf);
    pripremiPutanjeResursTMDB(server, konf);
    pripremiPutanjeResursSerija(server, konf);
    pripremiPutanjeResursStatistika(server, konf);
    pripremiPutanjeWebAplikacije(server, konf, port);
    pripremiStaticnePutanje(server);
    server.use((zahtjev, odgovor) => {
        odgovor.status(404).json({ pogreska: "nema resursa" });
    });
}
function pokreniServer(server, port) {
    server.listen(port, () => {
        console.log(`Server pokrenut na portu: ${port}`);
    });
}
