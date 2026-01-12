import { __dirname } from "../zajednicko/esmPomocnik.js";
import ds from "fs/promises";
import { Request, Response } from "express";
import { RWASession } from "../zajednicko/korisnici.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import path from "path";
import { zabiljeziPristupStranici } from "../servis/statistikaPomocnik.js";

export class HtmlUpravitelj {
	private portRest: number;

	constructor(portRest: number, konf: Konfiguracija) {
		this.portRest = portRest;
	}

	private provjeriPristupPoUlozi(
		ulogaKorisnika: string | undefined,
		potrebnaUloga: "guest" | "user" | "admin"
	): boolean {
		if (!ulogaKorisnika) {
			return potrebnaUloga === "guest";
		}

		const hijerarhija: { [key: string]: number } = {
			"guest": 0,
			"user": 1,
			"admin": 2
		};

		return (hijerarhija[ulogaKorisnika] ?? 0) >= (hijerarhija[potrebnaUloga] ?? 0);
	}

	async pocetna(zahtjev: Request, odgovor: Response) {
		zabiljeziPristupStranici(zahtjev, "/");
		const pocetna = await this.ucitajStranicu("pocetna", zahtjev);
		odgovor.cookie("portRest", this.portRest, { httpOnly: false });
		odgovor.send(pocetna);
	}

	async registracija(zahtjev: Request, odgovor: Response) {
		zabiljeziPristupStranici(zahtjev, "/reg");
		const stranica = await this.ucitajStranicu("registracija", zahtjev);
		odgovor.send(stranica);
	}

	async odjava(zahtjev: Request, odgovor: Response) {
		const sesija = zahtjev.session as RWASession;
		sesija.korisnik = null;
		zahtjev.session.destroy(() => {});
		odgovor.clearCookie("uloga");
		odgovor.redirect("/");
	}

	async prijava(zahtjev: Request, odgovor: Response) {
		zabiljeziPristupStranici(zahtjev, "/prijava");
		const stranica = await this.ucitajStranicu("prijava", zahtjev);
		odgovor.send(stranica);
	}

	async detalji(zahtjev: Request, odgovor: Response) {
		const sesija = zahtjev.session as RWASession;
		if (!this.provjeriPristupPoUlozi(sesija?.uloga, "user")) {
			return odgovor.redirect("/prijava");
		}
		zabiljeziPristupStranici(zahtjev, "/detalji");
		const stranica = await this.ucitajStranicu("detalji", zahtjev);
		odgovor.cookie("portRest", this.portRest, { httpOnly: false });
		odgovor.send(stranica);
	}

	async gledano(zahtjev: Request, odgovor: Response) {
		const sesija = zahtjev.session as RWASession;
		if (!this.provjeriPristupPoUlozi(sesija?.uloga, "user")) {
			return odgovor.redirect("/prijava");
		}
		zabiljeziPristupStranici(zahtjev, "/gledano");
		const stranica = await this.ucitajStranicu("gledano", zahtjev);
		odgovor.cookie("portRest", this.portRest, { httpOnly: false });
		odgovor.send(stranica);
	}

	async korisnici(zahtjev: Request, odgovor: Response) {
		const sesija = zahtjev.session as RWASession;
		if (!this.provjeriPristupPoUlozi(sesija?.uloga, "admin")) {
			return odgovor.redirect("/");
		}
		zabiljeziPristupStranici(zahtjev, "/korisnici");
		const stranica = await this.ucitajStranicu("korisnici", zahtjev);
		odgovor.cookie("portRest", this.portRest, { httpOnly: false });
		odgovor.send(stranica);
	}

	async info(zahtjev: Request, odgovor: Response) {
		zabiljeziPristupStranici(zahtjev, "/info");
		try {
			let dokumentacija = await ds.readFile(
				path.join(__dirname(), "../../dokumentacija/dokumentacija.html"),
				"utf-8"
			);
			const navigacija = await this.ucitajHTML("navigacija");
		
			dokumentacija = dokumentacija
				.replace("#navigacija#", navigacija)
				.replace(/#korisnikInfo#/g, "")
				.replace(/#datumVrijeme#/g, "");
			
			odgovor.send(dokumentacija);
		} catch (greska) {
			odgovor.status(404).send("Dokumentacija nije pronađena");
		}
	}

	private async ucitajStranicu(nazivStranice: string, zahtjev?: Request) {
		const [stranica, nav] = await Promise.all([
			this.ucitajHTML(nazivStranice),
			this.ucitajHTML("navigacija"),
		]);
		
		if (!stranica || !nav) return "";
		
		return stranica
			.replace("#navigacija#", nav)
			.replace(/#korisnikInfo#/g, "")
			.replace(/#datumVrijeme#/g, "");
	}

	private ucitajHTML(htmlStranica: string) {
		return ds.readFile(
			__dirname() + "/html/" + htmlStranica + ".html",
			"utf-8"
		);
	}
}
