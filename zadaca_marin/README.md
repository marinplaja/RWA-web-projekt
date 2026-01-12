# RWA-web-projekt

Web aplikacija za praćenje TV serija. Omogućava pretraživanje serija preko TMDB API-ja i evidenciju što si odgledao.

## Pokretanje

Potrebno je imati Node.js instaliran. Također trebaš TMDB API ključ koji ide u `podaci/konfiguracija.csv`.

```bash
npm install
npm run start-local
```

Ovo će kompajlirati TypeScript kod i pokrenuti server na lokalnom portu.

## Struktura

- `src/` - TypeScript izvorni kod
- `build/` - kompajlirani JavaScript
- `podaci/` - SQLite baza i konfiguracija
- `dokumentacija/` - dokumentacija projekta

## Funkcionalnosti

Aplikacija ima tri razine pristupa:
- Gosti mogu pretraživati serije i registrirati se
- Prijavljeni korisnici mogu dodavati serije u listu odgledanih
- Admini mogu upravljati korisnicima i gledati statistiku

## REST API

Glavni endpointi:
- `/rest/tmdb/serije` - pretraživanje serija
- `/rest/serije` - upravljanje odgledanim serijama
- `/rest/korisnici` - upravljanje korisnicima
- `/rest/statistika` - statistika (samo admin)

## Autor

Marin Plastic
