import { StatistikaDAO, StatistikaUnos } from "./statistikaDAO.js";
import { RWASession } from "../zajednicko/korisnici.js";
import { Request } from "express";
import { KorisnikDAO } from "./korisnikDAO.js";

let statistikaDAO: StatistikaDAO | null = null;
let korisnikDAO: KorisnikDAO | null = null;

export async function inicijalizirajStatistiku() {
	if (!statistikaDAO) {
		statistikaDAO = new StatistikaDAO();
		await statistikaDAO.inicijaliziraj();
	}
	if (!korisnikDAO) {
		korisnikDAO = new KorisnikDAO();
	}
}

export async function dodajStatistiku(unos: StatistikaUnos) {
	try {
		if (!statistikaDAO) {
			await inicijalizirajStatistiku();
		}
		await statistikaDAO!.dodaj(unos);
	} catch (greska) {
		console.error("Greška pri dodavanju statistike:", greska);
	}
}

async function dohvatiKorisnikId(korime: string | null | undefined): Promise<number | null> {
	if (!korime) return null;
	try {
		if (!korisnikDAO) {
			await inicijalizirajStatistiku();
		}
		let korisnik = await korisnikDAO!.dajSaUlogom(korime);
		return korisnik ? korisnik.idKORISNIK : null;
	} catch {
		return null;
	}
}

export async function zabiljeziPrijavu(korime: string) {
	let korisnik_id = await dohvatiKorisnikId(korime);
	await dodajStatistiku({
		tipRadnje: "prijava",
		korisnik_id: korisnik_id ?? undefined,
		datumVrijeme: new Date().toISOString(),
	});
}

export async function zabiljeziOdjavu(korime: string) {
	let korisnik_id = await dohvatiKorisnikId(korime);
	await dodajStatistiku({
		tipRadnje: "odjava",
		korisnik_id: korisnik_id ?? undefined,
		datumVrijeme: new Date().toISOString(),
	});
}

export async function zabiljeziPristupStranici(zahtjev: Request, stranica: string) {
	let sesija = zahtjev.session as RWASession;
	let korisnik_id = await dohvatiKorisnikId(sesija.korime);
	await dodajStatistiku({
		tipRadnje: "pristup_stranica",
		stranica: stranica,
		korisnik_id: korisnik_id ?? undefined,
		datumVrijeme: new Date().toISOString(),
	});
}

export async function zabiljeziPristupEndpointu(zahtjev: Request, endpoint: string) {
	try {
		let sesija = zahtjev.session as RWASession;
		let korisnik_id = await dohvatiKorisnikId(sesija.korime);
		await dodajStatistiku({
			tipRadnje: "pristup_endpoint",
			endpoint: endpoint,
			korisnik_id: korisnik_id ?? undefined,
			datumVrijeme: new Date().toISOString(),
		});
	} catch {
	}
}

export async function zabiljeziRadnju(
	zahtjev: Request,
	vrstaRadnje: "pregled" | "dodavanje" | "azuriranje" | "brisanje",
	endpoint?: string
) {
	try {
		let sesija = zahtjev.session as RWASession;
		let korisnik_id = await dohvatiKorisnikId(sesija.korime);
		await dodajStatistiku({
			tipRadnje: "radnja",
			vrstaRadnje: vrstaRadnje,
			endpoint: endpoint,
			korisnik_id: korisnik_id ?? undefined,
			datumVrijeme: new Date().toISOString(),
		});
	} catch {
	}
}

