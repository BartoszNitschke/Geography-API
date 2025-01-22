import express from 'express';
import fs from 'fs';
import path, {dirname} from 'path';
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../dane.json');

const loadCountriesData = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) reject(error);
            else resolve(JSON.parse(data));
        });
    });
};

const saveCountriesData = (data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

router.get('/countries', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    try {
        const data = await loadCountriesData();
        const allCountries = data.map(continent => continent.continent.countries).flat();
        
        res.status(200).json({
            countries: allCountries,
            _links: {
                self: { href: 'http://localhost:3000/api/countries', method: 'GET' },
                addCountry: { href: 'http://localhost:3000/api/countries/add', method: 'POST' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu listy krajów:', error);
        res.status(500).send('Błąd przy wczytywaniu listy krajów');
    }
});

router.get('/countries/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const countryCode = req.params.code.toUpperCase();

    try {
        const data = await loadCountriesData();
        const country = data
            .map(continent => continent.continent.countries)
            .flat()
            .find(c => c.code === countryCode);

        if (!country) {
            return res.status(404).send('Kraj o podanym kodzie nie został znaleziony');
        }

        res.status(200).json({
            country,
            _links: {
                self: { href: `http://localhost:3000/api/countries/${countryCode}`, method: 'GET' },
                update: { href: `http://localhost:3000/api/countries/${countryCode}`, method: 'PUT' },
                delete: { href: `http://localhost:3000/api/countries/${countryCode}`, method: 'DELETE' },
                allCountries: { href: 'http://localhost:3000/api/countries', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu danych kraju:', error);
        res.status(500).send('Błąd przy wczytywaniu danych kraju');
    }
});

router.post('/countries', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Country Creation');
    res.setHeader('X-Request-ID', Date.now().toString());

    const newCountry = req.body;

    if (!newCountry.name || !newCountry.code || !newCountry.capital) {
        return res.status(400).json({
            error: 'Brakujące wymagane pola',
            requiredFields: ['name', 'code', 'capital']
        });
    }

    try {
        const data = await loadCountriesData();
        const existingCountry = data
            .map(continent => continent.continent.countries)
            .flat()
            .find(c => c.code === newCountry.code);

        if (existingCountry) {
            return res.status(409).json({
                error: 'Kraj o podanym kodzie już istnieje'
            });
        }

        data[0].continent.countries.push({
            ...newCountry,
            landmarks: []
        });

        await saveCountriesData(data);

        res.status(201).json({
            message: 'Kraj został dodany pomyślnie',
            country: newCountry,
            _links: {
                self: { href: `http://localhost:3000/api/countries/${newCountry.code}`, method: 'GET' },
                allCountries: { href: 'http://localhost:3000/api/countries', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas dodawania kraju:', error);
        res.status(500).send('Błąd przy dodawaniu kraju');
    }
});

// Aktualizuj kraj
router.put('/countries/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Country Update');
    res.setHeader('X-Request-ID', Date.now().toString());

    const countryCode = req.params.code.toUpperCase();
    const updatedCountry = req.body;

    if (!updatedCountry.name || !updatedCountry.capital) {
        return res.status(400).json({
            error: 'Brakujące wymagane pola',
            requiredFields: ['name', 'capital']
        });
    }

    try {
        const data = await loadCountriesData();
        let countryFound = false;

        for (let continent of data) {
            const countryIndex = continent.continent.countries
                .findIndex(c => c.code === countryCode);
            
            if (countryIndex !== -1) {
                continent.continent.countries[countryIndex] = {
                    ...updatedCountry,
                    code: countryCode
                };
                countryFound = true;
                break;
            }
        }

        if (!countryFound) {
            return res.status(404).send('Kraj o podanym kodzie nie istnieje');
        }

        await saveCountriesData(data);

        res.status(200).json({
            message: 'Kraj został zaktualizowany pomyślnie',
            country: updatedCountry,
            _links: {
                self: { href: `http://localhost:3000/api/countries/${countryCode}`, method: 'GET' },
                allCountries: { href: 'http://localhost:3000/api/countries', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji kraju:', error);
        res.status(500).send('Błąd przy aktualizacji kraju');
    }
});

router.delete('/countries/:code', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Country Deletion');
    res.setHeader('X-Powered-By', 'Express');

    const countryCode = req.params.code.toUpperCase();

    try {
        const data = await loadCountriesData();
        let countryFound = false;

        for (let continent of data) {
            const countryIndex = continent.continent.countries
                .findIndex(c => c.code === countryCode);
            
            if (countryIndex !== -1) {
                continent.continent.countries.splice(countryIndex, 1);
                countryFound = true;
                break;
            }
        }

        if (!countryFound) {
            return res.status(404).send('Kraj o podanym kodzie nie istnieje');
        }

        await saveCountriesData(data);

        res.status(200).json({
            message: `Kraj o kodzie ${countryCode} został usunięty`,
            _links: {
                countries: { href: 'http://localhost:3000/api/countries', method: 'GET' },
                addCountry: { href: 'http://localhost:3000/api/countries/add', method: 'POST' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas usuwania kraju:', error);
        res.status(500).send('Błąd przy usuwaniu kraju');
    }
});

export default router;