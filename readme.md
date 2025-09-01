# TAPI - Travel Geographic API

A comprehensive REST API for managing geographical data including continents, countries, and landmarks. This API provides detailed information about world geography with full CRUD operations.

## 🌍 Features

- **Continents Management**: Create, read, update, and delete continent information
- **Countries Management**: Manage countries within continents with detailed information
- **Landmarks Management**: Handle landmark data for each country
- **Interactive Documentation**: Swagger UI for API exploration
- **RESTful Design**: Following REST principles with proper HTTP methods and status codes
- **HATEOAS Support**: Hypermedia links in API responses for better discoverability
- **CORS Enabled**: Cross-origin resource sharing support

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BartoszNitschke/TAPI.git
cd TAPI
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

### API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` for the interactive Swagger documentation.

## 📊 Data Structure

The API manages a hierarchical structure of geographical data:

```
Continents
├── Countries
    └── Landmarks
```

### Continent Schema
```json
{
  "name": "string",
  "code": "string (2 letters)",
  "population": "string",
  "area": "string",
  "countries": []
}
```

### Country Schema
```json
{
  "name": "string",
  "capital": "string",
  "code": "string (2 letters)",
  "landmarks": []
}
```

### Landmark Schema
```json
{
  "name": "string",
  "type": "string",
  "description": "string"
}
```

## 🛠 API Endpoints

### Continents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/continent` | Get all continents |
| GET | `/api/continent/{code}` | Get continent by code |
| POST | `/api/continent` | Create new continent |
| PUT | `/api/continent/{code}` | Update continent |
| PATCH | `/api/continent/{code}` | Partially update continent |
| DELETE | `/api/continent/{code}` | Delete continent |

### Countries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/countries` | Get all countries |
| GET | `/api/countries/{code}` | Get country by code |
| POST | `/api/countries` | Create new country |
| PUT | `/api/countries/{code}` | Update country |
| PATCH | `/api/countries/{code}` | Partially update country |
| DELETE | `/api/countries/{code}` | Delete country |

### Landmarks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/landmarks` | Get all landmarks |
| GET | `/api/landmarks/country/{code}` | Get landmarks by country |
| POST | `/api/landmarks/country/{code}` | Add landmark to country |
| PUT | `/api/landmarks/country/{code}/{name}` | Update landmark |
| PATCH | `/api/landmarks/country/{code}/{name}` | Partially update landmark |
| DELETE | `/api/landmarks/country/{code}/{name}` | Delete landmark |

## 💡 Usage Examples

### Get All Continents
```bash
curl -X GET "http://localhost:3000/api/continent" \
     -H "Content-Type: application/json"
```

### Get Country Details
```bash
curl -X GET "http://localhost:3000/api/countries/PL" \
     -H "Content-Type: application/json"
```

### Add New Country
```bash
curl -X POST "http://localhost:3000/api/countries" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Poland",
       "code": "PL",
       "capital": "Warsaw",
       "continentCode": "EU",
       "landmarks": []
     }'
```

### Add Landmark to Country
```bash
curl -X POST "http://localhost:3000/api/landmarks/country/PL" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Wawel Castle",
       "type": "Historical",
       "description": "Royal castle in Krakow"
     }'
```

### Update Continent Information
```bash
curl -X PUT "http://localhost:3000/api/continent/EU" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Europe",
       "population": "746419440",
       "area": "10180000"
     }'
```

## 🔧 Response Format

All API responses include HATEOAS links for better navigation:

```json
{
  "continent": {
    "name": "Europe",
    "code": "EU",
    "population": "746419440",
    "area": "10180000",
    "countries": [...]
  },
  "_links": {
    "self": { "href": "http://localhost:3000/api/continent/EU", "method": "GET" },
    "update": { "href": "http://localhost:3000/api/continent/EU", "method": "PUT" },
    "delete": { "href": "http://localhost:3000/api/continent/EU", "method": "DELETE" },
    "allContinents": { "href": "http://localhost:3000/api/continent", "method": "GET" }
  }
}
```

## 🗃 Data Storage

The API uses a JSON file (`dane.json`) for data persistence. This file contains sample data for continents, countries, and landmarks.

## ⚙️ Configuration

The application can be configured through environment variables:

- `PORT`: Server port (default: 3000)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🔍 Testing

You can test the API using the included `test.http` file with REST Client extensions, or use the Swagger UI interface at `/api-docs`.

## 🛡 Error Handling

The API provides comprehensive error handling with appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate resources)
- `500`: Internal Server Error
