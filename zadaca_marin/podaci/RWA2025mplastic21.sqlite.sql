PRAGMA foreign_keys = ON;

CREATE TABLE KORISNIK (
  idKORISNIK        INTEGER PRIMARY KEY AUTOINCREMENT,
  ime               VARCHAR(45)    NOT NULL,
  prezime           VARCHAR(45)    NOT NULL,
  email             VARCHAR(100)   NOT NULL UNIQUE,
  korime            VARCHAR(45)    NOT NULL UNIQUE,
  lozinka           VARCHAR(255)   NOT NULL,
  uloga             VARCHAR(20)   DEFAULT 'user',
  status            VARCHAR(20)    DEFAULT 'active',
  telefon           VARCHAR(20),
  adresa            VARCHAR(255),
  grad              VARCHAR(100),
  brojNeuspjesnihPrijava INTEGER DEFAULT 0
);

CREATE TABLE SERIJA (
  idSERIJA          INTEGER PRIMARY KEY AUTOINCREMENT,
  naziv             VARCHAR(255)   NOT NULL,
  opis              TEXT,
  tmdb_id           INTEGER UNIQUE
);

CREATE TABLE ODGLEDANA_SERIJA (
  idODGLEDANA_SERIJA INTEGER PRIMARY KEY AUTOINCREMENT,
  korisnik_id        INTEGER       NOT NULL,
  serija_id          INTEGER       NOT NULL,
  datumDodavanja     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (korisnik_id) REFERENCES KORISNIK(idKORISNIK),
  FOREIGN KEY (serija_id)  REFERENCES SERIJA(idSERIJA)
);

CREATE TABLE STATISTIKA (
  idSTATISTIKA INTEGER PRIMARY KEY AUTOINCREMENT,
  tipRadnje VARCHAR(50) NOT NULL,
  stranica VARCHAR(255),
  endpoint VARCHAR(255),
  vrstaRadnje VARCHAR(50),
  korisnik_id INTEGER,
  datumVrijeme DATETIME NOT NULL,
  FOREIGN KEY (korisnik_id) REFERENCES KORISNIK(idKORISNIK)
);