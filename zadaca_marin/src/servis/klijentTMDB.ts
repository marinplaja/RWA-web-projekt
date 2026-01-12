import { SerijeTmdb, ZanrTmdb, SerijaDetaljiTmdb, SlicneSerijeTmdb, VideoTmdb } from "../zajednicko/tmdb.js";

export class TMDBklijent {
    private bazicniURL = "https://api.themoviedb.org/3";
    private apiKljuc:string;
    constructor(apiKljuc:string){
       this.apiKljuc = apiKljuc;
    }

    public async dohvatiZanrove(){
       let resurs = "/genre/tv/list";
       let odgovor = await this.obaviZahtjev(resurs);
       return JSON.parse(odgovor).genres as Array<ZanrTmdb>;
    }

    public async dohvatiSeriju(id:number){
       let resurs = "/tv/"+id;
       let parametri = {language: "en-US"};
       let odgovor = await this.obaviZahtjev(resurs, parametri);
       return JSON.parse(odgovor) as SerijaDetaljiTmdb;
    }

    public async pretraziSerijePoNazivu(trazi:string,stranica:number){
       let resurs = "/search/tv";
       let parametri = {
                        include_adult: false,
                        page: stranica,
                        query: trazi,
                        language: "en-US"};

       let odgovor = await this.obaviZahtjev(resurs,parametri);
       return JSON.parse(odgovor) as SerijeTmdb;
    }

    public async dohvatiSlicneSerije(id:number){
       let resurs = "/tv/"+id+"/similar";
       let parametri = {language: "en-US", page: 1};
       let odgovor = await this.obaviZahtjev(resurs, parametri);
       return JSON.parse(odgovor) as SlicneSerijeTmdb;
    }

    public async dohvatiVidee(id:number){
       let resurs = "/tv/"+id+"/videos";
       let parametri = {language: "en-US"};
       let odgovor = await this.obaviZahtjev(resurs, parametri);
       let podaci = JSON.parse(odgovor);
       return podaci.results as Array<VideoTmdb>;
    }

    private async obaviZahtjev(resurs:string,parametri:{[kljuc:string]:string|number|boolean}={}){
        let zahtjev = this.bazicniURL+resurs+"?api_key="+this.apiKljuc;
        for(let p in parametri){
            zahtjev+="&"+p+"="+encodeURIComponent(String(parametri[p]));
        }
        let odgovor = await fetch(zahtjev);
        let rezultat = await odgovor.text();
        return rezultat;
    }
}
