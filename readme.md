# Geography API

REST API do zarządzania informacjami geograficznymi o kontynentach, krajach i zabytkach. API zapewnia kompleksowe endpointy do pobierania, dodawania, aktualizacji i usuwania danych związanych z turystyką i geografią.

## 🌍 Opis projektu

Geography API to RESTowe API stworzone z myślą o aplikacjach turystycznych i geograficznych. Pozwala na zarządzanie hierarchiczną strukturą danych: kontynenty → kraje → zabytki. API wykorzystuje plik JSON jako bazę danych i oferuje pełną dokumentację Swagger.

## 🚀 Funkcjonalności

- **Zarządzanie kontynentami**: CRUD operacje na kontynentach
- **Zarządzanie krajami**: Pełne zarządzanie krajami przypisanymi do kontynentów
- **Zarządzanie zabytkami**: Operacje na zabytkach przypisanych do krajów
- **Dokumentacja Swagger**: Automatycznie generowana dokumentacja API
- **CORS**: Skonfigurowane wsparcie dla Cross-Origin Resource Sharing
- **Walidacja danych**: Sprawdzanie poprawności przesyłanych danych

## 🛠️ Technologie

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework webowy
- **Swagger** - Dokumentacja API (swagger-jsdoc, swagger-ui-express)
- **CORS** - Obsługa Cross-Origin Resource Sharing
- **File System** - Przechowywanie danych w pliku JSON

## 📋 Wymagania

- Node.js w wersji 14.x lub nowszej
- npm lub yarn

## 🔧 Instalacja

1. Sklonuj repozytorium:

```bash
git clone https://github.com/BartoszNitschke/Geography-API.git
cd Geography-API
```

2. Zainstaluj dependencies:

```bash
npm install
```

3. Uruchom serwer:

```bash
npm start
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

## 📖 Dokumentacja API

Po uruchomieniu serwera, dokumentacja Swagger jest dostępna pod adresem:

```
http://localhost:3000/api-docs
```

## 🗂️ Struktura projektu

```
Geography-API/
├── routes/
│   ├── continents.js    # Endpointy dla kontynentów
│   ├── countries.js     # Endpointy dla krajów
│   └── landmarks.js     # Endpointy dla zabytków
├── dane.json           # Baza danych w formacie JSON
├── index.js            # Główny plik aplikacji
├── package.json        # Konfiguracja projektu
├── test.http          # Przykładowe requesty HTTP
└── README.md          # Dokumentacja projektu
```

## 🌐 Endpoints

### Kontynenty

- `GET /api/continent` - Pobierz wszystkie kontynenty
- `POST /api/continent` - Dodaj nowy kontynent
- `GET /api/continent/{code}` - Pobierz kontynent po kodzie
- `PUT /api/continent/{code}` - Aktualizuj kontynent
- `PATCH /api/continent/{code}` - Częściowo aktualizuj kontynent
- `DELETE /api/continent/{code}` - Usuń kontynent

### Kraje

- `GET /api/countries` - Pobierz wszystkie kraje
- `POST /api/countries` - Dodaj nowy kraj
- `GET /api/countries/{code}` - Pobierz kraj po kodzie
- `PUT /api/countries/{code}` - Aktualizuj kraj
- `PATCH /api/countries/{code}` - Częściowo aktualizuj kraj
- `DELETE /api/countries/{code}` - Usuń kraj

### Zabytki

- `GET /api/landmarks` - Pobierz wszystkie zabytki
- `POST /api/landmarks/add` - Dodaj nowy zabytek do kraju
- `GET /api/landmarks/{countryCode}` - Pobierz zabytki kraju
- `PUT /api/landmarks/{countryCode}/{landmarkName}` - Aktualizuj zabytek
- `DELETE /api/landmarks/{countryCode}/{landmarkName}` - Usuń zabytek

## 📝 Przykłady użycia

### Pobierz wszystkie kontynenty

```http
GET /api/continent
Content-Type: application/json
```

### Dodaj nowy kontynent

```http
POST /api/continent
Content-Type: application/json

{
  "name": "Australia",
  "code": "OC",
  "population": "45 million",
  "area": "8.6 million km²"
}
```

### Pobierz kraj po kodzie

```http
GET /api/countries/PL
Content-Type: application/json
```

### Dodaj nowy zabytek

```http
POST /api/landmarks/add
Content-Type: application/json

{
  "countryCode": "PL",
  "landmark": {
    "name": "Wawel Castle",
    "type": "Historical",
    "description": "Royal castle in Krakow"
  }
}
```

## 🔧 Konfiguracja

### CORS

API jest skonfigurowane do obsługi requestów z `http://localhost:3000`. Aby zmienić dozwolone origin, edytuj plik `index.js`:

```javascript
const allowedOrigins = ["http://localhost:3000"];
```

### Port

Domyślny port to 3000. Można go zmienić poprzez zmienną środowiskową:

```bash
PORT=8080 npm start
```

## 🗄️ Struktura danych

### Kontynent

```json
{
  "name": "Asia",
  "code": "AS",
  "population": "4.6 billion",
  "area": "44.6 million km²",
  "countries": [...]
}
```

### Kraj

```json
{
  "name": "Poland",
  "capital": "Warsaw",
  "code": "PL",
  "continentCode": "EU",
  "landmarks": [...]
}
```

### Zabytek

```json
{
  "name": "Wawel Castle",
  "type": "Historical",
  "description": "Royal castle in Krakow"
}
```

## 🧪 Testowanie

W pliku `test.http` znajdziesz przykładowe requesty, które możesz uruchomić w edytorach obsługujących pliki HTTP (np. VS Code z rozszerzeniem REST Client):

```http
@baseUrl = http://localhost:3000/api

### Pobierz informacje o kontynencie
GET {{baseUrl}}/continent
Content-Type: application/json
```

## 🤝 Wkład w projekt

1. Fork projektu
2. Stwórz branch na nową funkcjonalność (`git checkout -b feature/nowa-funkcjonalność`)
3. Commit zmian (`git commit -am 'Dodaj nową funkcjonalność'`)
4. Push branch (`git push origin feature/nowa-funkcjonalność`)
5. Otwórz Pull Request

## 📄 Licencja

Projekt jest udostępniony na licencji ISC.

## 👥 Autor

Projekt stworzony przez [BartoszNitschke](https://github.com/BartoszNitschke)

---

💡 **Uwaga**: Obecnie API obsługuje tylko REST. Planowane jest dodanie obsługi GraphQL w przyszłych wersjach.
