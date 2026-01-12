export interface Serija {
	idSERIJA?: number;
	naziv: string;
	opis?: string;
	tmdb_id: number;
}

export interface OdgledanaSerija {
	idODGLEDANA_SERIJA?: number;
	korisnik_id: number;
	serija_id: number;
	datumDodavanja?: string;
}

