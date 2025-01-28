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

/**
 * @swagger
 * components:
 *   schemas:
 *     Country:
 *       type: object
 *       required:
 *         - name
 *         - capital
 *         - code
 *         - continentCode
 *       properties:
 *         name:
 *           type: string
 *           description: Nazwa kraju
 *         capital:
 *           type: string
 *           description: Stolica kraju
 *         code:
 *           type: string
 *           description: Kod kraju (2 litery)
 *         continentCode:
 *           type: string
 *           description: Kod kontynentu, do którego należy kraj (2 litery)
 *         landmarks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Landmark'
 */

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Pobierz wszystkie kraje
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: Lista krajów
 *       500:
 *         description: Błąd serwera
 *   post:
 *     summary: Dodaj nowy kraj
 *     tags: [Countries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - capital
 *               - continentCode
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               capital:
 *                 type: string
 *               continentCode:
 *                 type: string
 *                 description: Kod kontynentu, do którego ma być przypisany kraj
 *               landmarks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Landmark'
 *     responses:
 *       201:
 *         description: Kraj został dodany
 *       400:
 *         description: Nieprawidłowe dane
 *       404:
 *         description: Podany kontynent nie istnieje
 *       409:
 *         description: Kraj o podanym kodzie już istnieje
 *       500:
 *         description: Błąd serwera
 * 
 * /countries/{code}:
 *   get:
 *     summary: Pobierz szczegóły kraju
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kraju (2 litery)
 *     responses:
 *       200:
 *         description: Szczegóły kraju
 *       404:
 *         description: Kraj nie został znaleziony
 *       500:
 *         description: Błąd serwera
 *   put:
 *     summary: Aktualizuj kraj
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kraju (2 litery)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Country'
 *     responses:
 *       200:
 *         description: Kraj zaktualizowany
 *       400:
 *         description: Nieprawidłowe dane
 *       404:
 *         description: Kraj nie został znaleziony
 *       500:
 *         description: Błąd serwera
 *   delete:
 *     summary: Usuń kraj
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kraju (2 litery)
 *     responses:
 *       200:
 *         description: Kraj usunięty
 *       404:
 *         description: Kraj nie został znaleziony
 *       500:
 *         description: Błąd serwera
 *   patch:
 *     summary: Częściowo aktualizuj kraj
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kraju (2 litery)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nazwa kraju
 *               capital:
 *                 type: string
 *                 description: Stolica kraju
 *               landmarks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Landmark'
 *     responses:
 *       200:
 *         description: Kraj częściowo zaktualizowany
 *       400:
 *         description: Brak pól do aktualizacji
 *       404:
 *         description: Kraj nie został znaleziony
 *       500:
 *         description: Błąd serwera
 */

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

    const newCountry = req.body;

    // Dodajmy walidację kodu kontynentu
    if (!newCountry.name || !newCountry.code || !newCountry.capital || !newCountry.continentCode) {
        return res.status(400).json({
            error: 'Brakujące wymagane pola',
            requiredFields: ['name', 'code', 'capital', 'continentCode']
        });
    }

    try {
        const data = await loadCountriesData();
        
        // Sprawdź czy kraj już istnieje
        const countryExists = data.some(continent => 
            continent.continent.countries.some(c => c.code === newCountry.code.toUpperCase())
        );

        if (countryExists) {
            return res.status(409).json({
                error: 'Kraj o podanym kodzie już istnieje'
            });
        }

        // Znajdź kontynent do którego dodamy kraj
        const continentIndex = data.findIndex(item => 
            item.continent.code === newCountry.continentCode.toUpperCase()
        );

        if (continentIndex === -1) {
            return res.status(404).json({
                error: 'Podany kontynent nie istnieje',
                availableContinents: data.map(item => ({
                    code: item.continent.code,
                    name: item.continent.name
                }))
            });
        }

        // Przygotuj obiekt kraju do dodania
        const countryToAdd = {
            name: newCountry.name,
            code: newCountry.code.toUpperCase(),
            capital: newCountry.capital,
            landmarks: newCountry.landmarks || []
        };

        // Dodaj kraj do kontynentu
        data[continentIndex].continent.countries.push(countryToAdd);
        await saveCountriesData(data);

        res.status(201).json({
            message: 'Kraj został dodany pomyślnie',
            country: countryToAdd,
            continent: {
                code: data[continentIndex].continent.code,
                name: data[continentIndex].continent.name
            },
            _links: {
                self: { href: `http://localhost:3000/api/countries/${countryToAdd.code}`, method: 'GET' },
                continent: { href: `http://localhost:3000/api/continent/${data[continentIndex].continent.code}`, method: 'GET' },
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

router.patch('/countries/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Country Partial Update');
    res.setHeader('X-Request-ID', Date.now().toString());

    const countryCode = req.params.code.toUpperCase();
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            error: 'Brak pól do aktualizacji'
        });
    }

    try {
        const data = await loadCountriesData();
        let countryFound = false;
        let updatedCountry;

        for (let continent of data) {
            const countryIndex = continent.continent.countries
                .findIndex(c => c.code === countryCode);
            
            if (countryIndex !== -1) {
                const currentCountry = continent.continent.countries[countryIndex];
                updatedCountry = {
                    ...currentCountry,
                    ...(updates.name && { name: updates.name }),
                    ...(updates.capital && { capital: updates.capital }),
                    ...(updates.landmarks && { landmarks: updates.landmarks }),
                    code: countryCode // zachowujemy oryginalny kod
                };
                
                continent.continent.countries[countryIndex] = updatedCountry;
                countryFound = true;
                break;
            }
        }

        if (!countryFound) {
            return res.status(404).json({
                error: 'Kraj o podanym kodzie nie został znaleziony'
            });
        }

        await saveCountriesData(data);

        res.status(200).json({
            message: 'Kraj został częściowo zaktualizowany',
            updatedFields: Object.keys(updates),
            country: updatedCountry,
            _links: {
                self: { href: `http://localhost:3000/api/countries/${countryCode}`, method: 'GET' },
                fullUpdate: { href: `http://localhost:3000/api/countries/${countryCode}`, method: 'PUT' },
                allCountries: { href: 'http://localhost:3000/api/countries', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas częściowej aktualizacji kraju:', error);
        res.status(500).send('Błąd przy częściowej aktualizacji kraju');
    }
});

export default router;