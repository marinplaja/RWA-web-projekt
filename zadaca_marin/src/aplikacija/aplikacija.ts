import express, { Application } from "express";

import { __dirname } from "../zajednicko/esmPomocnik.js";
import { HtmlUpravitelj } from "./htmlUpravitelj.js";

import { Konfiguracija } from "../zajednicko/konfiguracija.js";

export function pripremiStaticnePutanje(server: Application) {
	server.use("/js", express.static(__dirname() + "/jsk"));
	server.use("/css", express.static(__dirname() + "/html"));
	server.use("/slike", express.static(__dirname() + "/../../dokumentacija/slike"));
}

export function pripremiPutanjeWebAplikacije(
	server: Application,
	konf: Konfiguracija,
	portRest: number
) {
	let htmlUpravitelj = new HtmlUpravitelj(portRest, konf);
	server.get("/", htmlUpravitelj.pocetna.bind(htmlUpravitelj));
	server.get("/reg", htmlUpravitelj.registracija.bind(htmlUpravitelj));
	server.post("/reg", htmlUpravitelj.registracija.bind(htmlUpravitelj));
	server.get("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
	server.post("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
	server.get("/odjava", htmlUpravitelj.odjava.bind(htmlUpravitelj));
	server.get("/detalji", htmlUpravitelj.detalji.bind(htmlUpravitelj));
	server.get("/gledano", htmlUpravitelj.gledano.bind(htmlUpravitelj));
	server.get("/korisnici", htmlUpravitelj.korisnici.bind(htmlUpravitelj));
	server.post("/korisnici", htmlUpravitelj.korisnici.bind(htmlUpravitelj));
	server.get("/info", htmlUpravitelj.info.bind(htmlUpravitelj));
}
