window.addEventListener("load", () => {
	let forma = document.getElementById("registracijaForma");
	if (forma) {
		forma.addEventListener("submit", (event) => {
			dodajKorisnika(event, forma);
		});
	}
});

async function dodajKorisnika(event, korisnik) {
	event.preventDefault();
	let tijelo = {
		ime: korisnik.ime.value,
		prezime: korisnik.prezime.value,
		lozinka: korisnik.lozinka.value,
		email: korisnik.email.value,
		korime: korisnik.korime.value,
		telefon: korisnik.telefon?.value || null,
		adresa: korisnik.adresa?.value || null,
		grad: korisnik.grad?.value || null,
	};

	let zaglavlje = new Headers();
	zaglavlje.set("Content-Type", "application/json");

	let parametri = {
		method: "POST",
		body: JSON.stringify(tijelo),
		headers: zaglavlje,
		credentials: "include"
	};
	
	let portRest = citajRestPortIzKolacica();
	if (!portRest) {
		portRest = window.location.port || "12057";
	}
	let puniUrl = "http://" + window.location.hostname + ":" + portRest + "/rest/korisnici";
	let odgovor = await fetch(puniUrl, parametri);

	let poruka = document.getElementById("poruka");
	poruka.style.display = "block";
	
	try {
		if (!odgovor.ok && odgovor.status !== 201 && odgovor.status !== 400) {
			throw new Error(`HTTP ${odgovor.status}: ${odgovor.statusText}`);
		}
		
		let tekstOdgovora = await odgovor.text();
		let podaci;
		
		try {
			podaci = JSON.parse(tekstOdgovora);
		} catch (e) {
			poruka.style.color = "red";
			poruka.innerHTML = "<p>Neočekivani odgovor od servera: " + tekstOdgovora.substring(0, 100) + "</p>";
			console.error("Neuspjelo parsiranje JSON-a:", tekstOdgovora);
			return;
		}
		
		if (odgovor.status == 201) {
			poruka.style.color = "green";
			poruka.innerHTML = "<p>Korisnik uspješno registriran! Možete se prijaviti!</p>";
			setTimeout(() => {
				window.location.href = "/prijava";
			}, 2000);
		} else {
			poruka.style.color = "red";
			poruka.innerHTML = "<p>" + (podaci.pogreska || podaci.greska || "Greška pri registraciji") + "</p>";
		}
	} catch (greska) {
		poruka.style.color = "red";
		poruka.innerHTML = "<p>Greška pri komunikaciji sa serverom: " + greska.message + "</p>";
		console.error("Detalji greške:", greska);
	}
}
