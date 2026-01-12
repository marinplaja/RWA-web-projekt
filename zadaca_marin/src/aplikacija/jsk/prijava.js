window.addEventListener("load", () => {
	let forma = document.getElementById("prijavaForma");
	if (forma) {
		forma.addEventListener("submit", (event) => {
			prijaviKorisnika(event, forma);
		});
	}
});

async function prijaviKorisnika(event, korisnik) {
	event.preventDefault();
	let tijelo = {
		lozinka: korisnik.lozinka.value,
	};

	let zaglavlje = new Headers();
	zaglavlje.set("Content-Type", "application/json");

	let parametri = {
		method: "POST",
		body: JSON.stringify(tijelo),
		headers: zaglavlje,
		credentials: "include"
	};
	
	let korime = korisnik.korime.value;
	let portRest = citajRestPortIzKolacica();
	if (!portRest) {
		portRest = window.location.port || "12057";
	}
	let korimeEncoded = encodeURIComponent(korime);
	let puniUrl = "http://" + window.location.hostname + ":" + portRest + "/rest/korisnici/" + korimeEncoded + "/prijava";
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
			poruka.innerHTML = "<p>Korisnik uspješno prijavljen!</p>";
			await provjeriPrijavu();
			setTimeout(() => {
				window.location.href = "/";
			}, 1000);
		} else {
			poruka.style.color = "red";
			poruka.innerHTML = "<p>" + (podaci.pogreska || podaci.greska || "Greška pri prijavi") + "</p>";
		}
	} catch (greska) {
		poruka.style.color = "red";
		poruka.innerHTML = "<p>Greška pri komunikaciji sa serverom: " + greska.message + "</p>";
		console.error("Detalji greške:", greska);
	}
}
