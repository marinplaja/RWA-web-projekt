let url = "http://" + window.location.hostname + ":" + citajRestPortIzKolacica();

window.addEventListener("load", async () => {
    provjeriPrijavu();
    let params = new URLSearchParams(window.location.search);
    let id = params.get("id");
    if (id) {
        await ucitajDetalje(id);
    } else {
        document.getElementById("poruka").innerHTML = "<p style='color:red'>Nedostaje ID serije</p>";
    }
});

async function ucitajDetalje(tmdbId) {
    try {
        let odgovor = await fetch(url + "/rest/serije/" + tmdbId + "/detalji", {
            credentials: "include"
        });
        let podaci = await odgovor.json();
        
        if (podaci.pogreska) {
            document.getElementById("poruka").innerHTML = "<p style='color:red'>" + podaci.pogreska + "</p>";
            return;
        }

        let detaljiDiv = document.getElementById("detalji");
        let html = "";

        if (podaci.serija) {
            html += "<h2>Serija u bazi</h2>";
            html += "<div class='serija-baza'>";
            html += "<p><strong>Naziv:</strong> " + podaci.serija.naziv + "</p>";
            if (podaci.serija.opis) {
                html += "<p><strong>Opis:</strong> " + podaci.serija.opis + "</p>";
            }
            html += "</div>";

            if (podaci.detalji) {
                html += prikaziDetaljeTMDB(podaci.detalji, podaci.slicne, podaci.youtubeVideo);
            }
            
            let jeOdgledana = await provjeriJeLiOdgledana(podaci.serija.idSERIJA);
            if (!jeOdgledana) {
                let serijaIdAttr = podaci.serija.idSERIJA;
                let gumbId = "dodajOdgledaneGumb";
                let gumbTekst = "Dodaj u odgledane";
                let gumbAttrs = "id='" + gumbId + "' data-serija-id='" + serijaIdAttr + "'";
                let gumbHtml = "<button " + gumbAttrs + ">" + gumbTekst + "</button>";
                html += gumbHtml;
            } else {
                html += "<p style='color:green'>Serija je već u vašim odgledanim serijama</p>";
            }
        } else {
            html += "<h2>Serija nije u bazi</h2>";
            if (podaci.detalji) {
                html += prikaziDetaljeTMDB(podaci.detalji, null, null);
                html += "<button id='dodajUbazuGumb' data-tmdb-id='" + tmdbId + "'>Dodaj u bazu</button>";
            }
        }

        detaljiDiv.innerHTML = html;
        let dodajOdgledaneGumb = document.getElementById("dodajOdgledaneGumb");
        if (dodajOdgledaneGumb) {
            dodajOdgledaneGumb.addEventListener("click", () => {
                dodajUOdgledane(parseInt(dodajOdgledaneGumb.getAttribute("data-serija-id")));
            });
        }
        
        let dodajUbazuGumb = document.getElementById("dodajUbazuGumb");
        if (dodajUbazuGumb) {
            dodajUbazuGumb.addEventListener("click", () => {
                dodajUbazu(parseInt(dodajUbazuGumb.getAttribute("data-tmdb-id")));
            });
        }
    } catch (greska) {
        console.error(greska);
        document.getElementById("poruka").innerHTML = "<p style='color:red'>Greška pri učitavanju detalja</p>";
    }
}

function prikaziDetaljeTMDB(detalji, slicne, youtubeVideo) {
    let html = "<div class='serija-detalji'>";
    
    if (detalji.poster_path) {
        let posterUrl = "https://image.tmdb.org/t/p/original" + detalji.poster_path;
        html += "<img src='" + posterUrl + "' alt='" + detalji.name + "' />";
    }
    
    html += "<h3>" + detalji.name + "</h3>";
    html += "<p><strong>Originalni naziv:</strong> " + detalji.original_name + "</p>";
    html += "<p><strong>Opis:</strong> " + detalji.overview + "</p>";
    if (detalji.first_air_date) {
        let formatiraniDatum = formatirajDatumSamo(detalji.first_air_date);
        html += "<p><strong>Prva emitiranje:</strong> " + formatiraniDatum + "</p>";
    }
    html += "<p><strong>Broj sezona:</strong> " + detalji.number_of_seasons + "</p>";
    html += "<p><strong>Broj epizoda:</strong> " + detalji.number_of_episodes + "</p>";
    if (detalji.seasons && detalji.seasons.length > 0) {
        html += "<h4>Sezone:</h4><div class='sezone'>";
        for (let sezona of detalji.seasons) {
            html += "<div class='sezona'>";
            let sezonaNaziv = sezona.name || "Nepoznata sezona";
            html += "<p><strong>Sezona " + sezona.season_number + ":</strong> " + sezonaNaziv + "</p>";
            html += "<p>Broj epizoda: " + sezona.episode_count + "</p>";
            if (sezona.air_date) {
                let formatiraniDatumSezone = formatirajDatumSamo(sezona.air_date);
                html += "<p>Datum emitiranja: " + formatiraniDatumSezone + "</p>";
            }
            if (sezona.overview) {
                html += "<p>Opis: " + sezona.overview + "</p>";
            }
            if (sezona.poster_path) {
                let posterUrl = "https://image.tmdb.org/t/p/w200" + sezona.poster_path;
                html += "<img src='" + posterUrl + "' alt='Sezona " + sezona.season_number + "' />";
            }
            html += "</div>";
        }
        html += "</div>";
    }
    
    if (detalji.created_by && detalji.created_by.length > 0) {
        html += "<h4>Kreatori:</h4><div class='kreatori'>";
        for (let kreator of detalji.created_by) {
            let slika = kreator.profile_path 
                ? `https://image.tmdb.org/t/p/w200${kreator.profile_path}` 
                : "/css/no-poster.png";
            html += "<div class='kreator'>";
            html += "<img src='" + slika + "' alt='" + kreator.name + "' />";
            html += "<p>" + kreator.name + "</p>";
            html += "</div>";
        }
        html += "</div>";
    }

    if (youtubeVideo) {
        html += "<h4>YouTube video:</h4>";
        let youtubeUrl = "https://www.youtube.com/embed/" + youtubeVideo;
        html += "<iframe width='560' height='315' src='" + youtubeUrl + "' frameborder='0' allowfullscreen></iframe>";
    } else {
        html += "<p>Ne postoji YouTube video</p>";
    }

    if (slicne && slicne.length > 0) {
        html += "<h4>Slične serije:</h4><div class='slicne-serije'>";
        for (let serija of slicne) {
            let poster = serija.poster_path 
                ? `https://image.tmdb.org/t/p/w200${serija.poster_path}` 
                : "/css/no-poster.png";
            html += "<div class='slicna-serija'>";
            html += "<img src='" + poster + "' alt='" + serija.name + "' />";
            html += "<p><a href='/detalji?id=" + serija.id + "'>" + serija.name + "</a></p>";
            html += "</div>";
        }
        html += "</div>";
    }

    html += "</div>";
    return html;
}

async function dodajUbazu(tmdbId) {
    try {
        let detaljiOdgovor = await fetch(url + "/rest/tmdb/serije/" + tmdbId, {
            credentials: "include"
        });
        let detalji = await detaljiOdgovor.json();
        
        if (detalji.pogreska) {
            alert(detalji.pogreska);
            return;
        }

        let tijelo = {
            naziv: detalji.name,
            opis: detalji.overview,
            tmdb_id: tmdbId
        };

        let odgovor = await fetch(url + "/rest/serije", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tijelo),
            credentials: "include"
        });

        let podaci = await odgovor.json();
        if (odgovor.status == 201) {
            alert("Serija uspješno dodana u bazu!");
            location.reload();
        } else {
            alert(podaci.pogreska || "Greška pri dodavanju serije");
        }
    } catch (greska) {
        console.error(greska);
        alert("Greška pri dodavanju serije");
    }
}

async function provjeriJeLiOdgledana(serijaId) {
    try {
        let odgovor = await fetch(url + "/rest/serije/" + serijaId + "/odgledano", {
            credentials: "include"
        });
        let podaci = await odgovor.json();
        return podaci.odgledana || false;
    } catch (greska) {
        return false;
    }
}

async function dodajUOdgledane(serijaId) {
    try {
        let odgovor = await fetch(url + "/rest/serije/" + serijaId + "/odgledano", {
            method: "POST",
            credentials: "include"
        });

        let podaci = await odgovor.json();
        if (odgovor.status == 201) {
            alert("Serija dodana u odgledane!");
            location.reload();
        } else {
            alert(podaci.pogreska || "Greška pri dodavanju u odgledane");
        }
    } catch (greska) {
        console.error(greska);
        alert("Greška pri dodavanju u odgledane");
    }
}

