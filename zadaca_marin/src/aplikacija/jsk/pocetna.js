let url = "http://" + window.location.hostname + ":" + citajRestPortIzKolacica();
let trenutnaStranica = 1;
let ukupnoStranica = 1;
let appStranicenje = 10;
let traziTekst = "";

window.addEventListener("load", async () => {
    let input = document.getElementById("pretraga");
    if (input) {
        input.addEventListener("input", async (e) => {
            let trazi = e.target.value.trim();
            traziTekst = trazi;
            if (trazi.length >= 2) {
                trenutnaStranica = 1;
                await pretraziSerije(trazi, 1);
            } else {
                document.getElementById("rezultati").innerHTML = "";
                document.getElementById("stranicenje").innerHTML = "";
            }
        });
    }
    provjeriPrijavu();
});

async function pretraziSerije(trazi, stranica) {
    try {
        let traziEncoded = encodeURIComponent(trazi);
        let serijeUrl = url + "/rest/tmdb/serije?trazi=" + traziEncoded + "&stranica=" + stranica;
        let odgovor = await fetch(serijeUrl);
        let podaci = await odgovor.json();
        
        if (podaci.pogreska) {
            document.getElementById("poruka").innerHTML = "<p style='color:red'>" + podaci.pogreska + "</p>";
            return;
        }

        ukupnoStranica = podaci.total_pages;
        prikaziSerije(podaci.results);
        prikaziStranicenje(stranica, ukupnoStranica, "pretraziSerijeStranica");
        trenutnaStranica = stranica;
    } catch (greska) {
        console.error(greska);
        document.getElementById("poruka").innerHTML = "<p style='color:red'>Greška pri pretraživanju</p>";
    }
}

function pretraziSerijeStranica(stranica) {
    if (traziTekst.length >= 2) {
        pretraziSerije(traziTekst, stranica);
    }
}

function prikaziSerije(serije) {
    let rezultati = document.getElementById("rezultati");
    let html = "<div class='serije-grid'>";
    
    let jePrijavljen = provjeriJeLiPrijavljen();
    
    for (let serija of serije) {
        let poster = serija.poster_path 
            ? `https://image.tmdb.org/t/p/w200${serija.poster_path}` 
            : "/css/no-poster.png";
        
        html += "<div class='serija-kartica'>";
        html += `<img src="${poster}" alt="${serija.name}" />`;
        let link = "";
        let nazivSerije = serija.original_name || serija.name;
        if (jePrijavljen) {
            link = `<a href="/detalji?id=${serija.id}" class="link-naziv-serije">${nazivSerije}</a>`;
        } else {
            link = `<span>${nazivSerije}</span>`;
        }
        html += `<div class='serija-naziv'>${link}</div>`;
        html += "</div>";
    }
    
    html += "</div>";
    rezultati.innerHTML = html;
}
