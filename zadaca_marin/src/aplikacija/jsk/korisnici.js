let url = "http://" + window.location.hostname + ":" + citajRestPortIzKolacica();
let trenutnaStranica = 1;
let ukupnoStranica = 1;

window.addEventListener("load", async () => {
    provjeriPrijavu();
    await ucitajKorisnike(1);
    
    let statistikaGumb = document.getElementById("statistikaGumb");
    if (statistikaGumb) {
        statistikaGumb.addEventListener("click", () => {
            dohvatiStatistiku();
        });
    }
});

async function ucitajKorisnike(stranica) {
    try {
        let odgovor = await fetch(url + "/rest/korisnici?stranica=" + stranica, {
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
            prikaziKorisnike(podaci.results);
            prikaziStranicenjeKorisnika(trenutnaStranica, ukupnoStranica);
        } else {
            prikaziKorisnike(podaci);
        }
    } catch (greska) {
        console.error(greska);
        document.getElementById("poruka").innerHTML = "<p style='color:red'>Greška pri učitavanju korisnika</p>";
    }
}

function ucitajKorisnikeStranica(stranica) {
    ucitajKorisnike(stranica);
}

function prikaziStranicenjeKorisnika(str, ukupno) {
    let prikaz = document.getElementById("stranicenjeKorisnici");
    if (!prikaz) {
        let korisniciDiv = document.getElementById("korisnici");
        if (korisniciDiv) {
            prikaz = document.createElement("div");
            prikaz.id = "stranicenjeKorisnici";
            korisniciDiv.appendChild(prikaz);
        } else {
            return;
        }
    }
    
    let html = "";
    str = parseInt(str);
    if (str > 1) {
        html = '<button onClick="ucitajKorisnikeStranica(1)"><<</button>';
        html += '<button onClick="ucitajKorisnikeStranica(' + (str - 1) + ')"><</button>';
    }
    html += '<button onClick="ucitajKorisnikeStranica(' + str + ')">' + str + "/" + ukupno + "</button>";
    if (str < ukupno) {
        html += '<button onClick="ucitajKorisnikeStranica(' + (str + 1) + ')">></button>';
        html += '<button onClick="ucitajKorisnikeStranica(' + ukupno + ')">>></button>';
    }
    prikaz.innerHTML = html;
}

async function prikaziKorisnike(korisnici) {
    let korisniciDiv = document.getElementById("korisnici");
    let html = "<h2>Korisnici</h2>";
    html += "<table><thead><tr>";
    html += "<th>Ime</th><th>Prezime</th><th>Email</th>";
    html += "<th>Korisničko ime</th><th>Status</th><th>Uloga</th><th>Akcije</th>";
    html += "</tr></thead><tbody>";
    
    for (let korisnik of korisnici) {
        html += "<tr>";
        html += "<td>" + korisnik.ime + "</td>";
        html += "<td>" + korisnik.prezime + "</td>";
        html += "<td>" + korisnik.email + "</td>";
        html += "<td>" + korisnik.korime + "</td>";
        html += "<td>" + (korisnik.status || "active") + "</td>";
        html += "<td>" + (korisnik.uloga || "user") + "</td>";
        html += "<td>";
        html += "<button class='azuriraj-gumb' data-korime='" + korisnik.korime + "'>Ažuriraj</button> ";
        if (korisnik.status === "locked") {
            let korimeAttr = korisnik.korime;
            let gumbKlasa = "status-gumb";
            let gumbTekst = "Otključaj";
            let gumbAttrs = "class='" + gumbKlasa + "' data-korime='" + korimeAttr + "' data-status='active'";
            let statusGumbHtml = "<button " + gumbAttrs + ">" + gumbTekst + "</button>";
            html += statusGumbHtml;
        } else {
            let korimeAttr2 = korisnik.korime;
            let gumbKlasa2 = "status-gumb";
            let gumbTekst2 = "Zaključaj";
            let gumbAttrs2 = "class='" + gumbKlasa2 + "' data-korime='" + korimeAttr2 + "' data-status='locked'";
            let statusGumbHtml2 = "<button " + gumbAttrs2 + ">" + gumbTekst2 + "</button>";
            html += statusGumbHtml2;
        }
        html += "</td>";
        html += "</tr>";
    }
    
    html += "</tbody></table>";
    korisniciDiv.innerHTML = html;
    let azurirajGumbovi = korisniciDiv.querySelectorAll(".azuriraj-gumb");
    for (let gumb of azurirajGumbovi) {
        gumb.addEventListener("click", () => {
            azurirajKorisnika(gumb.getAttribute("data-korime"));
        });
    }
    
    let statusGumbovi = korisniciDiv.querySelectorAll(".status-gumb");
    for (let gumb of statusGumbovi) {
        gumb.addEventListener("click", () => {
            let korime = gumb.getAttribute("data-korime");
            let status = gumb.getAttribute("data-status");
            if (status === "locked") {
                zakljucajKorisnika(korime);
            } else {
                otkljucajKorisnika(korime);
            }
        });
    }
}

async function azurirajKorisnika(korime) {
    let novoKorime = prompt("Korisničko ime:", korime);
    let ime = prompt("Ime:");
    let prezime = prompt("Prezime:");
    let email = prompt("Email:");
    let lozinka = prompt("Nova lozinka:");
    
    if (!novoKorime || !ime || !prezime || !email || !lozinka) {
        alert("Sva polja su obavezna, uključujući lozinku!");
        return;
    }

    let tijelo = {
        korime: novoKorime,
        ime: ime,
        prezime: prezime,
        email: email,
        lozinka: lozinka
    };

    try {
        let odgovor = await fetch(url + "/rest/korisnici/" + encodeURIComponent(korime), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tijelo),
            credentials: "include"
        });

        let podaci = await odgovor.json();
        if (odgovor.status == 201) {
            alert("Korisnik uspješno ažuriran!");
            await ucitajKorisnike(trenutnaStranica);
        } else {
            alert(podaci.pogreska || "Greška pri ažuriranju");
        }
    } catch (greska) {
        console.error(greska);
        alert("Greška pri ažuriranju korisnika");
    }
}

async function otkljucajKorisnika(korime) {
    await promijeniStatusKorisnika(korime, "active");
}

async function zakljucajKorisnika(korime) {
    await promijeniStatusKorisnika(korime, "locked");
}

async function promijeniStatusKorisnika(korime, status) {
    try {
        let odgovor = await fetch(url + "/rest/korisnici/" + encodeURIComponent(korime) + "/status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: status }),
            credentials: "include"
        });

        let podaci = await odgovor.json();
        if (odgovor.status == 201) {
            alert("Status korisnika uspješno promijenjen!");
            await ucitajKorisnike(trenutnaStranica);
        } else {
            alert(podaci.pogreska || "Greška pri promjeni statusa");
        }
    } catch (greska) {
        console.error(greska);
        alert("Greška pri promjeni statusa korisnika");
    }
}

async function dohvatiStatistiku() {
    let datumOd = document.getElementById("datumOd").value.trim();
    let datumDo = document.getElementById("datumDo").value.trim();
    
    if (!datumOd || !datumDo) {
        alert("Molimo unesite datum od i do u formatu: dan.mjesec.godina sati:minute:sekunde");
        return;
    }

    try {
        let podaci = await dohvatiPodatkeStatistike(datumOd, datumDo);
        if (podaci.pogreska) {
            prikaziGreskuStatistike(podaci.pogreska);
            return;
        }
        let html = generirajHtmlStatistike(podaci);
        document.getElementById("statistikaRezultati").innerHTML = html;
    } catch (greska) {
        console.error(greska);
        prikaziGreskuStatistike("Greška pri dohvaćanju statistike: " + greska.message);
    }
}

function parsirajDatumVrijeme(tekst) {
    let dijelovi = tekst.trim().split(' ');
    if (dijelovi.length !== 2) {
        throw new Error("Neispravan format. Očekivano: dan.mjesec.godina sati:minute:sekunde");
    }
    
    let datumDijelovi = dijelovi[0].split('.');
    let vrijemeDijelovi = dijelovi[1].split(':');
    
    if (datumDijelovi.length !== 3 || vrijemeDijelovi.length !== 3) {
        throw new Error("Neispravan format. Očekivano: dan.mjesec.godina sati:minute:sekunde");
    }
    
    let dan = parseInt(datumDijelovi[0], 10);
    let mjesec = parseInt(datumDijelovi[1], 10) - 1;
    let godina = parseInt(datumDijelovi[2], 10);
    let sati = parseInt(vrijemeDijelovi[0], 10);
    let minute = parseInt(vrijemeDijelovi[1], 10);
    let sekunde = parseInt(vrijemeDijelovi[2], 10);
    
    let datum = new Date(godina, mjesec, dan, sati, minute, sekunde);
    
    if (isNaN(datum.getTime())) {
        throw new Error("Neispravan datum ili vrijeme");
    }
    
    return datum.toISOString();
}

async function dohvatiPodatkeStatistike(datumOd, datumDo) {
    try {
        let datumOdISO = parsirajDatumVrijeme(datumOd);
        let datumDoISO = parsirajDatumVrijeme(datumDo);
        let datumOdEncoded = encodeURIComponent(datumOdISO);
        let datumDoEncoded = encodeURIComponent(datumDoISO);
        let statistikaUrl = url + "/rest/statistika?od=" + datumOdEncoded + "&do=" + datumDoEncoded;
        let odgovor = await fetch(statistikaUrl, {
            credentials: "include"
        });
        return await odgovor.json();
    } catch (greska) {
        return { pogreska: greska.message || "Greška pri parsiranju datuma i vremena" };
    }
}

function prikaziGreskuStatistike(poruka) {
    let porukaHtml = "<p style='color:red'>" + poruka + "</p>";
    document.getElementById("statistikaRezultati").innerHTML = porukaHtml;
}

function generirajHtmlStatistike(podaci) {
    let html = "<h3>Statistika korištenja sustava</h3>";
    html += "<p><strong>Broj prijava:</strong> " + (podaci.brojPrijava || 0) + "</p>";
    html += "<p><strong>Broj odjava:</strong> " + (podaci.brojOdjava || 0) + "</p>";
    html += generirajHtmlPristupaPoStranici(podaci.pristupiPoStranici);
    html += generirajHtmlPristupaPoEndpointu(podaci.pristupiPoEndpointu);
    html += generirajHtmlRadnji(podaci.radnje);
    return html;
}

function generirajHtmlPristupaPoStranici(pristupiPoStranici) {
    let html = "<p><strong>Broj pristupa po stranici:</strong></p>";
    pristupiPoStranici = pristupiPoStranici || {};
    if (Object.keys(pristupiPoStranici).length > 0) {
        html += "<ul>";
        for (let stranica in pristupiPoStranici) {
            html += "<li>" + stranica + ": " + pristupiPoStranici[stranica] + "</li>";
        }
        html += "</ul>";
    } else {
        html += "<p>Nema pristupa po stranicama u odabranom periodu</p>";
    }
    return html;
}

function generirajHtmlPristupaPoEndpointu(pristupiPoEndpointu) {
    let html = "<p><strong>Broj pristupa po krajnjoj točki (endpoint):</strong></p>";
    pristupiPoEndpointu = pristupiPoEndpointu || {};
    if (Object.keys(pristupiPoEndpointu).length > 0) {
        html += "<ul>";
        for (let endpoint in pristupiPoEndpointu) {
            html += "<li>" + endpoint + ": " + pristupiPoEndpointu[endpoint] + "</li>";
        }
        html += "</ul>";
    } else {
        html += "<p>Nema pristupa po endpointima u odabranom periodu</p>";
    }
    return html;
}

function generirajHtmlRadnji(radnje) {
    let html = "<p><strong>Broj vrste radnje:</strong></p>";
    html += "<ul>";
    html += "<li>Pregled: " + (radnje?.pregled || 0) + "</li>";
    html += "<li>Dodavanje: " + (radnje?.dodavanje || 0) + "</li>";
    html += "<li>Ažuriranje: " + (radnje?.azuriranje || 0) + "</li>";
    html += "<li>Brisanje: " + (radnje?.brisanje || 0) + "</li>";
    html += "</ul>";
    return html;
}

