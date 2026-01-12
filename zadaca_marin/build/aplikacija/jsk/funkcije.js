function prikaziStranicenje(str, ukupno, funkcijaZaDohvat) {
	let prikaz = document.getElementById("stranicenje");
	html = "";
	str = parseInt(str);
	if (str > 1) {
		html = '<button onClick="' + funkcijaZaDohvat + '(1)"><<</button>';
		html +=
			'<button onClick="' +
			funkcijaZaDohvat +
			"(" +
			(str - 1) +
			')"><</button>';
	}
	html +=
		'<button onClick="' +
		funkcijaZaDohvat +
		"(" +
		str +
		')">' +
		str +
		"/" +
		ukupno +
		"</button>";
	if (str < ukupno) {
		html +=
			'<button onClick="' +
			funkcijaZaDohvat +
			"(" +
			(str + 1) +
			')">></button>';
		html +=
			'<button onClick="' + funkcijaZaDohvat + "(" + ukupno + ')">>></button>';
	}
	prikaz.innerHTML = html;
}

function citajRestPortIzKolacica() {
	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith("portRest=")) {
			return cookie.substring("portRest=".length);
		}
	}
	const port = window.location.port;
	return port || "12057";
}

function provjeriJeLiPrijavljen() {
	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith("uloga=")) {
			const uloga = cookie.substring("uloga=".length);
			if (uloga && uloga.length > 0) {
				return true;
			}
		}
	}
	return false;
}

async function provjeriPrijavu() {
	let korisnikLinki = document.getElementById("korisnikLinki");
	let gostLinki = document.getElementById("gostLinki");
	let adminLinki = document.getElementById("adminLinki");
	let loginLink = document.getElementById("loginLink");
	let watchedLink = document.getElementById("watchedLink");
	let adminLink = document.getElementById("adminLink");
	let userInfo = document.getElementById("userInfo");
	
	if (provjeriJeLiPrijavljen()) {
		if (gostLinki) gostLinki.style.display = "none";
		if (loginLink) loginLink.style.display = "none";
		if (korisnikLinki) korisnikLinki.style.display = "inline";
		if (watchedLink) watchedLink.style.display = "inline";
		try {
			let url = "http://" + window.location.hostname + ":" + citajRestPortIzKolacica();
			let odgovor = await fetch(url + "/rest/korisnici/me", {
				credentials: "include"
			});
			
			if (odgovor.ok) {
				let korisnik = await odgovor.json();
				let sada = new Date();
				let dan = String(sada.getDate()).padStart(2, '0');
				let mjesec = String(sada.getMonth() + 1).padStart(2, '0');
				let godina = sada.getFullYear();
				let sati = String(sada.getHours()).padStart(2, '0');
				let minute = String(sada.getMinutes()).padStart(2, '0');
				let sekunde = String(sada.getSeconds()).padStart(2, '0');
				let formatiraniDatum = `${dan}.${mjesec}.${godina}`;
				let formatiranoVrijeme = `${sati}:${minute}:${sekunde}`;
				
				if (userInfo) {
					let korisnikInfo = `${korisnik.ime} ${korisnik.prezime} (${korisnik.uloga || "user"})`;
					userInfo.textContent = ` | ${formatiraniDatum} ${formatiranoVrijeme} | ${korisnikInfo}`;
				}
				
				if (adminLinki && korisnik.uloga === "admin") {
					adminLinki.style.display = "inline";
				} else {
					if (adminLinki) adminLinki.style.display = "none";
				}
			} else {
				let uloga = document.cookie.match(/uloga=([^;]+)/)?.[1];
				if (adminLinki && uloga === "admin") {
					adminLinki.style.display = "inline";
				} else {
					if (adminLinki) adminLinki.style.display = "none";
				}
			}
		} catch (greska) {
			console.error("Greška pri dohvaćanju korisnika:", greska);
			let uloga = document.cookie.match(/uloga=([^;]+)/)?.[1];
			if (adminLinki && uloga === "admin") {
				adminLinki.style.display = "inline";
			} else {
				if (adminLinki) adminLinki.style.display = "none";
			}
		}
		let logoutBtn = document.getElementById("logoutBtn");
		if (logoutBtn) {
			logoutBtn.style.display = "inline-block";
		}
	} else {
		if (gostLinki) gostLinki.style.display = "inline";
		if (loginLink) loginLink.style.display = "inline";
		if (korisnikLinki) korisnikLinki.style.display = "none";
		if (watchedLink) watchedLink.style.display = "none";
		if (adminLinki) adminLinki.style.display = "none";
		if (userInfo) userInfo.textContent = "";
		let logoutBtn = document.getElementById("logoutBtn");
		if (logoutBtn) {
			logoutBtn.style.display = "none";
		}
	}
}

function azurirajDatumVrijeme() {
	let datumVrijemeElement = document.getElementById("datumVrijeme");
	if (datumVrijemeElement) {
		let sada = new Date();
		let dan = String(sada.getDate()).padStart(2, '0');
		let mjesec = String(sada.getMonth() + 1).padStart(2, '0');
		let godina = sada.getFullYear();
		let sati = String(sada.getHours()).padStart(2, '0');
		let minute = String(sada.getMinutes()).padStart(2, '0');
		let sekunde = String(sada.getSeconds()).padStart(2, '0');
		let formatiraniDatum = `${dan}.${mjesec}.${godina}`;
		let formatiranoVrijeme = `${sati}:${minute}:${sekunde}`;
		datumVrijemeElement.textContent = `${formatiraniDatum} ${formatiranoVrijeme}`;
	}
}

function formatirajDatumSamo(datumString) {
	if (!datumString) {
		return "";
	}
	
	let dijelovi = datumString.split('-');
	if (dijelovi.length === 3) {
		let godina = dijelovi[0];
		let mjesec = dijelovi[1];
		let dan = dijelovi[2];
		return `${dan}.${mjesec}.${godina}`;
	}
	
	if (datumString.includes('T')) {
		let datumDio = datumString.split('T')[0];
		return formatirajDatumSamo(datumDio);
	}
	
	return datumString;
}

function pokreniAžuriranjeDatuma() {
	azurirajDatumVrijeme();
	setInterval(azurirajDatumVrijeme, 1000);
}

window.addEventListener("load", () => {
	pokreniAžuriranjeDatuma();
	provjeriPrijavu();
	setInterval(async () => {
		if (provjeriJeLiPrijavljen()) {
			await provjeriPrijavu();
		}
	}, 1000);
});
