import express from 'express';
import fs from 'fs';
import path, {dirname} from 'path';
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../dane.json');

const loadContinentsData = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) reject(error);
            else resolve(JSON.parse(data));
        });
    });
};

const saveContinentsData = (data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

router.get('/continent', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    try {
        const data = await loadContinentsData();
        const continents = data.map(item => item.continent);
        
        res.status(200).json({
            continents,
            _links: {
                self: { href: 'http://localhost:3000/api/continent', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu informacji o kontynentach:', error);
        res.status(500).send('Błąd przy wczytywaniu informacji o kontynentach');
    }
});

router.get('/continent/countries', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    try {
        const data = await loadContinentsData();
        const allCountries = data.map(item => ({
            continent: item.continent.name,
            countries: item.continent.countries.map(country => ({
                name: country.name,
                code: country.code,
                capital: country.capital
            }))
        }));

        res.status(200).json({
            continentCountries: allCountries,
            _links: {
                self: { href: 'http://localhost:3000/api/continent/countries', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu listy krajów:', error);
        res.status(500).send('Błąd przy wczytywaniu listy krajów');
    }
});

router.get('/continent/countries/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const countryCode = req.params.code.toUpperCase();

    try {
        const data = await loadContinentsData();
        let foundCountry = null;
        let continentName = null;

        for (const item of data) {
            const country = item.continent.countries.find(c => c.code === countryCode);
            if (country) {
                foundCountry = country;
                continentName = item.continent.name;
                break;
            }
        }

        if (!foundCountry) {
            return res.status(404).json({
                error: 'Kraj o podanym kodzie nie został znaleziony'
            });
        }

        res.status(200).json({
            continent: continentName,
            country: foundCountry,
            _links: {
                self: { href: `http://localhost:3000/api/continent/countries/${countryCode}`, method: 'GET' },
                landmarks: { href: `http://localhost:3000/api/continent/countries/${countryCode}/landmarks`, method: 'GET' },
                allCountries: { href: 'http://localhost:3000/api/continent/countries', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu danych kraju:', error);
        res.status(500).send('Błąd przy wczytywaniu danych kraju');
    }
});

router.get('/continent/countries/:code/landmarks', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const countryCode = req.params.code.toUpperCase();

    try {
        const data = await loadContinentsData();
        let foundCountry = null;
        let continentName = null;

        for (const item of data) {
            const country = item.continent.countries.find(c => c.code === countryCode);
            if (country) {
                foundCountry = country;
                continentName = item.continent.name;
                break;
            }
        }

        if (!foundCountry) {
            return res.status(404).json({
                error: 'Kraj o podanym kodzie nie został znaleziony'
            });
        }

        res.status(200).json({
            continent: continentName,
            country: foundCountry.name,
            landmarks: foundCountry.landmarks,
            _links: {
                self: { href: `http://localhost:3000/api/continent/countries/${countryCode}/landmarks`, method: 'GET' },
                country: { href: `http://localhost:3000/api/continent/countries/${countryCode}`, method: 'GET' },
                allCountries: { href: 'http://localhost:3000/api/continent/countries', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu zabytków kraju:', error);
        res.status(500).send('Błąd przy wczytywaniu zabytków kraju');
    }
});

router.put('/continent/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Continent Update');
    res.setHeader('X-Request-ID', Date.now().toString());

    const continentCode = req.params.code.toUpperCase();
    const updatedContinent = req.body;

    if (!updatedContinent.name) {
        return res.status(400).json({
            error: 'Brakujące wymagane pole name',
            requiredFields: ['name']
        });
    }

    try {
        const data = await loadContinentsData();
        const continentIndex = data.findIndex(item => item.continent.code === continentCode);

        if (continentIndex === -1) {
            return res.status(404).send('Kontynent o podanym kodzie nie istnieje');
        }

        data[continentIndex].continent = {
            ...data[continentIndex].continent,
            name: updatedContinent.name,
            population: updatedContinent.population,
            area: updatedContinent.area
        };

        await saveContinentsData(data);

        res.status(200).json({
            message: 'Kontynent został zaktualizowany pomyślnie',
            continent: data[continentIndex].continent,
            _links: {
                self: { href: `http://localhost:3000/api/continent/${continentCode}`, method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji kontynentu:', error);
        res.status(500).send('Błąd przy aktualizacji kontynentu');
    }
});

router.delete('/continent/:code', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Continent Deletion');
    res.setHeader('X-Powered-By', 'Express');

    const continentCode = req.params.code.toUpperCase();

    try {
        const data = await loadContinentsData();
        const continentIndex = data.findIndex(item => item.continent.code === continentCode);

        if (continentIndex === -1) {
            return res.status(404).send('Kontynent o podanym kodzie nie istnieje');
        }

        data.splice(continentIndex, 1);
        await saveContinentsData(data);

        res.status(200).json({
            message: `Kontynent o kodzie ${continentCode} został usunięty`,
            _links: {
                continents: { href: 'http://localhost:3000/api/continent', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas usuwania kontynentu:', error);
        res.status(500).send('Błąd przy usuwaniu kontynentu');
    }
});

export default router;