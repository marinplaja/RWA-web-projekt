import dsPromise from "fs/promises";
export class Konfiguracija {
    konf;
    constructor() {
        this.konf = this.initKonf();
    }
    initKonf() {
        return {
            tajniKljucSesija: "",
            appStranicenje: 0,
            trajanjeSesije: 0,
            neuspjesnePrijave: 0,
            tmdbApiKeyV3: "",
        };
    }
    dajKonf() {
        return this.konf;
    }
    async ucitajKonfiguraciju() {
        if (process.argv[2] == undefined)
            throw new Error("Nedostaje putanja do konfiguracijske datoteke!");
        let putanja = process.argv[2];
        var podaci = await dsPromise.readFile(putanja, {
            encoding: "utf-8",
        });
        this.pretvoriCSVkonfig(podaci);
        this.provjeriPodatkeKonfiguracije();
    }
    pretvoriCSVkonfig(podaci) {
        const konf = {};
        const nizPodataka = podaci.split("\n");
        for (const podatak of nizPodataka) {
            const podatakNiz = podatak.split(":");
            if (podatakNiz.length < 2)
                continue;
            const naziv = podatakNiz[0]?.trim();
            if (!naziv)
                continue;
            const vrijednost = podatakNiz.slice(1).join(":").trim();
            if (vrijednost.includes(":")) {
                throw new Error(`Vrijednost za ${naziv} ne smije sadržavati znak dvotočka`);
            }
            konf[naziv] = vrijednost;
        }
        this.konf.tajniKljucSesija = konf["tajniKljucSesija"] || "";
        this.konf.appStranicenje = parseInt(konf["appStranicenje"] || "0");
        this.konf.trajanjeSesije = parseInt(konf["trajanjeSesije"] || "0");
        this.konf.neuspjesnePrijave = parseInt(konf["neuspjesnePrijave"] || "0");
        this.konf.tmdbApiKeyV3 = konf["tmdbApiKeyV3"] || "";
    }
    provjeriPodatkeKonfiguracije() {
        this.provjeriTajniKljucSesija();
        this.provjeriAppStranicenje();
        this.provjeriTrajanjeSesije();
        this.provjeriNeuspjesnePrijave();
        this.provjeriTmdbApiKey();
    }
    provjeriTajniKljucSesija() {
        const kljuc = this.konf.tajniKljucSesija?.trim();
        if (!kljuc) {
            throw new Error("Fali tajniKljucSesija u konfiguraciji. Veličina: 75-100 znakova.");
        }
        if (kljuc.length < 75 || kljuc.length > 100) {
            throw new Error(`tajniKljucSesija mora biti između 75 i 100 znakova. Trenutna duljina: ${kljuc.length}`);
        }
    }
    provjeriAppStranicenje() {
        const vrijednost = this.konf.appStranicenje;
        if (isNaN(vrijednost)) {
            throw new Error("Fali appStranicenje u konfiguraciji. Vrijednost: broj od 5-20.");
        }
        if (vrijednost < 5 || vrijednost > 20) {
            throw new Error(`appStranicenje mora biti broj između 5 i 20. Trenutna vrijednost: ${vrijednost}`);
        }
    }
    provjeriTrajanjeSesije() {
        const vrijednost = this.konf.trajanjeSesije;
        if (isNaN(vrijednost)) {
            throw new Error("Fali trajanjeSesije u konfiguraciji. Vrijednost: broj od 5-30 (minute).");
        }
        if (vrijednost < 5 || vrijednost > 30) {
            throw new Error(`trajanjeSesije mora biti broj između 5 i 30. Trenutna vrijednost: ${vrijednost}`);
        }
    }
    provjeriNeuspjesnePrijave() {
        const vrijednost = this.konf.neuspjesnePrijave;
        if (isNaN(vrijednost)) {
            throw new Error("Fali neuspjesnePrijave u konfiguraciji. Vrijednost: broj od 3-10.");
        }
        if (vrijednost < 3 || vrijednost > 10) {
            throw new Error(`neuspjesnePrijave mora biti broj između 3 i 10. Trenutna vrijednost: ${vrijednost}`);
        }
    }
    provjeriTmdbApiKey() {
        if (!this.konf.tmdbApiKeyV3?.trim()) {
            throw new Error("Fali tmdbApiKeyV3 u konfiguraciji.");
        }
    }
}
