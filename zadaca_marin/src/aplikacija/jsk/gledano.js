let url = "http://" + window.location.hostname + ":" + citajRestPortIzKolacica();
let trenutnaStranica = 1;
let ukupnoStranica = 1;
let sveOdgledane = [];

window.addEventListener("load", async () => {
    provjeriPrijavu();
    await ucitajOdgledane(1);
    
    let pretraga = document.getElementById("pretraga");
    if (pretraga) {
        pretraga.addEventListener("input", (e) => {
            filtriratiOdgledane(e.target.value);
        });
    }
});

async function ucitajOdgledane(stranica) {
    try {
        let odgovor = await fetch(url + "/rest/serije/0/odgledano?stranica=" + stranica, {
            credentials: "include"
        });
        let podaci = await odgovor.json();
        
        if (podaci.pogreska) {
            document.getElementById("poruka").innerHTML = "<p style='color:red'>" + podaci.pogreska + "</p>";
            return;
        }

        if (podaci.results) {
            ukupnoStranica = podaci.total_pages || 1;
            trenutnaStranica = podaci.page || 1;
            prikaziOdgledane(podaci.results);
            prikaziStranicenje(trenutnaStranica, ukupnoStranica, "ucitajOdgledaneStranica");
        } else {
            sveOdgledane = podaci;
            prikaziOdgledane(podaci);
        }
    } catch (greska) {
        console.error(greska);
        let porukaHtml = "<p style='color:red'>Greška pri učitavanju odgledanih serija</p>";
        document.getElementById("poruka").innerHTML = porukaHtml;
    }
}

function ucitajOdgledaneStranica(stranica) {
    ucitajOdgledane(stranica);
}

function filtriratiOdgledane(pretraga) {
    if (!sveOdgledane || sveOdgledane.length === 0) {
        ucitajSveZaPretragu();
        return;
    }
    
    let filtrirane = sveOdgledane.filter(serija => 
        serija.naziv.toLowerCase().includes(pretraga.toLowerCase())
    );
    
    prikaziOdgledane(filtrirane);
}

async function ucitajSveZaPretragu() {
    let sve = [];
    for (let i = 1; i <= ukupnoStranica; i++) {
        let odgovor = await fetch(url + "/rest/serije/0/odgledano?stranica=" + i, {
            credentials: "include"
        });
        let podaci = await odgovor.json();
        if (podaci.results) {
            sve = sve.concat(podaci.results);
        }
    }
    sveOdgledane = sve;
}

function prikaziOdgledane(serije) {
    let rezultati = document.getElementById("rezultati");
    
    if (serije.length === 0) {
        rezultati.innerHTML = "<p>Nemate odgledanih serija</p>";
        return;
    }

    let html = "<table><thead><tr><th>Naziv</th><th>Opis</th><th>Akcije</th></tr></thead><tbody>";
    
    for (let serija of serije) {
        html += "<tr>";
        html += "<td>" + serija.naziv + "</td>";
        html += "<td>" + (serija.opis || "-") + "</td>";
        html += "<td><button class='ukloni-gumb' data-serija-id='" + serija.idSERIJA + "'>Ukloni</button></td>";
        html += "</tr>";
    }
    
    html += "</tbody></table>";
    rezultati.innerHTML = html;
    let ukloniGumbovi = rezultati.querySelectorAll(".ukloni-gumb");
    for (let gumb of ukloniGumbovi) {
        gumb.addEventListener("click", () => {
            ukloniOdgledanu(parseInt(gumb.getAttribute("data-serija-id")));
        });
    }
}

async function ukloniOdgledanu(serijaId) {
    if (!confirm("Jeste li sigurni da želite ukloniti seriju iz odgledanih?")) {
        return;
    }

    try {
        let odgovor = await fetch(url + "/rest/serije/" + serijaId + "/odgledano", {
            method: "DELETE",
            credentials: "include"
        });

        let podaci = await odgovor.json();
        if (odgovor.status == 201) {
            await ucitajOdgledane(trenutnaStranica);
            document.getElementById("poruka").innerHTML = "<p style='color:green'>Serija uklonjena iz odgledanih</p>";
        } else {
            let porukaTekst = podaci.pogreska || "Greška pri uklanjanju";
            let porukaHtml2 = "<p style='color:red'>" + porukaTekst + "</p>";
            document.getElementById("poruka").innerHTML = porukaHtml2;
        }
    } catch (greska) {
        console.error(greska);
        document.getElementById("poruka").innerHTML = "<p style='color:red'>Greška pri uklanjanju serije</p>";
    }
}

