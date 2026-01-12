export class TMDBklijent {
    bazicniURL = "https://api.themoviedb.org/3";
    apiKljuc;
    constructor(apiKljuc) {
        this.apiKljuc = apiKljuc;
    }
    async dohvatiZanrove() {
        let resurs = "/genre/tv/list";
        let odgovor = await this.obaviZahtjev(resurs);
        return JSON.parse(odgovor).genres;
    }
    async dohvatiSeriju(id) {
        let resurs = "/tv/" + id;
        let parametri = { language: "en-US" };
        let odgovor = await this.obaviZahtjev(resurs, parametri);
        return JSON.parse(odgovor);
    }
    async pretraziSerijePoNazivu(trazi, stranica) {
        let resurs = "/search/tv";
        let parametri = {
            include_adult: false,
            page: stranica,
            query: trazi,
            language: "en-US"
        };
        let odgovor = await this.obaviZahtjev(resurs, parametri);
        return JSON.parse(odgovor);
    }
    async dohvatiSlicneSerije(id) {
        let resurs = "/tv/" + id + "/similar";
        let parametri = { language: "en-US", page: 1 };
        let odgovor = await this.obaviZahtjev(resurs, parametri);
        return JSON.parse(odgovor);
    }
    async dohvatiVidee(id) {
        let resurs = "/tv/" + id + "/videos";
        let parametri = { language: "en-US" };
        let odgovor = await this.obaviZahtjev(resurs, parametri);
        let podaci = JSON.parse(odgovor);
        return podaci.results;
    }
    async obaviZahtjev(resurs, parametri = {}) {
        let zahtjev = this.bazicniURL + resurs + "?api_key=" + this.apiKljuc;
        for (let p in parametri) {
            zahtjev += "&" + p + "=" + encodeURIComponent(String(parametri[p]));
        }
        let odgovor = await fetch(zahtjev);
        let rezultat = await odgovor.text();
        return rezultat;
    }
}
