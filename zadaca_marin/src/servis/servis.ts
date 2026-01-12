import { Application } from "express";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { RestKorisnik } from "./restKorisnik.js";
import { RestTMDB } from "./restTMDB.js";
import { RestSerija } from "./restSerija.js";
import { RestStatistika } from "./restStatistika.js";

export function pripremiPutanjeResursKorisnika(
	server: Application,
	konf: Konfiguracija
) {
	let restKorisnik = new RestKorisnik(konf);
	server.get("/rest/korisnici", restKorisnik.getKorisnici.bind(restKorisnik));
	server.post("/rest/korisnici", restKorisnik.postKorisnici.bind(restKorisnik));
	server.put("/rest/korisnici", restKorisnik.putKorisnici.bind(restKorisnik));
	server.delete(
		"/rest/korisnici",
		restKorisnik.deleteKorisnici.bind(restKorisnik)
	);
	server.get(
		"/rest/korisnici/me",
		restKorisnik.getKorisnikMe.bind(restKorisnik)
	);
	server.get(
		"/rest/korisnici/:korime",
		restKorisnik.getKorisnik.bind(restKorisnik)
	);
	server.post(
		"/rest/korisnici/:korime/prijava",
		restKorisnik.getKorisnikPrijava.bind(restKorisnik)
	);
	server.put(
		"/rest/korisnici/:korime/prijava",
		restKorisnik.putKorisnikPrijava.bind(restKorisnik)
	);
	server.put(
		"/rest/korisnici/:korime",
		restKorisnik.putKorisnik.bind(restKorisnik)
	);
	server.put(
		"/rest/korisnici/:korime/status",
		restKorisnik.putKorisnikStatus.bind(restKorisnik)
	);
}

export function pripremiPutanjeResursTMDB(
	server: Application,
	konf: Konfiguracija
) {
	let restTMDB = new RestTMDB(konf.dajKonf().tmdbApiKeyV3, konf);
	server.get("/rest/tmdb/zanr", restTMDB.getZanr.bind(restTMDB));
	server.get("/rest/tmdb/serije", restTMDB.getSerije.bind(restTMDB));
	server.get("/rest/tmdb/serije/:id", restTMDB.getSerijaDetalji.bind(restTMDB));
}

export function pripremiPutanjeResursSerija(
	server: Application,
	konf: Konfiguracija
) {
	let restSerija = new RestSerija(konf.dajKonf().tmdbApiKeyV3);
	server.get("/rest/serije", restSerija.getSerije.bind(restSerija));
	server.post("/rest/serije", restSerija.postSerije.bind(restSerija));
	server.get("/rest/serije/:id", restSerija.getSerija.bind(restSerija));
	server.get("/rest/serije/:id/odgledano", restSerija.getSerijaOdgledano.bind(restSerija));
	server.post("/rest/serije/:id/odgledano", restSerija.postSerijaOdgledano.bind(restSerija));
	server.delete("/rest/serije/:id/odgledano", restSerija.deleteSerijaOdgledano.bind(restSerija));
	server.get("/rest/serije/:id/detalji", restSerija.getSerijaDetaljiTMDB.bind(restSerija));
}

export function pripremiPutanjeResursStatistika(
	server: Application,
	konf: Konfiguracija
) {
	let restStatistika = new RestStatistika();
	server.get("/rest/statistika", restStatistika.getStatistika.bind(restStatistika));
}
