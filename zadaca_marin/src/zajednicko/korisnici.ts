import { Session } from "express-session";

export interface Korisnik {
	ime: string;
	prezime: string;
	email: string;
	korime: string;
	lozinka: string | null;
	status?: string;
	uloga?: string;
}

export interface RWASession extends Session {
	korisnik: string | null;
	korime: string;
	uloga?: string;
}

