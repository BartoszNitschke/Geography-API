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

/**
 * @swagger
 * components:
 *   schemas:
 *     Continent:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           description: Nazwa kontynentu
 *         code:
 *           type: string
 *           description: Kod kontynentu (2 litery)
 *         population:
 *           type: string
 *           description: Populacja kontynentu
 *         area:
 *           type: string
 *           description: Powierzchnia kontynentu
 *         countries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Country'
 */

/**
 * @swagger
 * /continent:
 *   get:
 *     summary: Pobierz wszystkie kontynenty
 *     tags: [Continents]
 *     responses:
 *       200:
 *         description: Lista kontynentów
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 continents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Continent'
 *       500:
 *         description: Błąd serwera
 *   post:
 *     summary: Dodaj nowy kontynent
 *     tags: [Continents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               population:
 *                 type: string
 *               area:
 *                 type: string
 *               countries:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Country'
 *     responses:
 *       201:
 *         description: Kontynent został utworzony
 *       400:
 *         description: Nieprawidłowe dane
 *       409:
 *         description: Kontynent o podanym kodzie już istnieje
 *       500:
 *         description: Błąd serwera
 * 
 * /continent/{code}:
 *   get:
 *     summary: Pobierz kontynent po kodzie
 *     tags: [Continents]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kontynentu (2 litery)
 *     responses:
 *       200:
 *         description: Szczegóły kontynentu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Continent'
 *       404:
 *         description: Kontynent nie został znaleziony
 *       500:
 *         description: Błąd serwera
 *   put:
 *     summary: Aktualizuj kontynent
 *     tags: [Continents]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kontynentu (2 litery)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               population:
 *                 type: string
 *               area:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kontynent zaktualizowany
 *       400:
 *         description: Nieprawidłowe dane
 *       404:
 *         description: Kontynent nie został znaleziony
 *       500:
 *         description: Błąd serwera
 *   patch:
 *     summary: Częściowo aktualizuj kontynent
 *     tags: [Continents]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kontynentu (2 litery)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               population:
 *                 type: string
 *               area:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kontynent zaktualizowany częściowo
 *       404:
 *         description: Kontynent nie został znaleziony
 *       500:
 *         description: Błąd serwera
 *   delete:
 *     summary: Usuń kontynent
 *     tags: [Continents]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kontynentu (2 litery)
 *     responses:
 *       200:
 *         description: Kontynent usunięty
 *       404:
 *         description: Kontynent nie został znaleziony
 *       500:
 *         description: Błąd serwera
 */

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

router.get('/continent/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const continentCode = req.params.code.toUpperCase();

    try {
        const data = await loadContinentsData();
        const continent = data.find(item => item.continent.code === continentCode)?.continent;

        if (!continent) {
            return res.status(404).json({
                error: 'Kontynent o podanym kodzie nie został znaleziony'
            });
        }

        res.status(200).json({
            continent,
            _links: {
                self: { href: `http://localhost:3000/api/continent/${continentCode}`, method: 'GET' },
                update: { href: `http://localhost:3000/api/continent/${continentCode}`, method: 'PUT' },
                delete: { href: `http://localhost:3000/api/continent/${continentCode}`, method: 'DELETE' },
                allContinents: { href: 'http://localhost:3000/api/continent', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu danych kontynentu:', error);
        res.status(500).send('Błąd przy wczytywaniu danych kontynentu');
    }
});

router.put('/continent/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Continent Full Update');

    const continentCode = req.params.code.toUpperCase();
    const updatedContinent = req.body;

    if (!updatedContinent.name || !updatedContinent.population || !updatedContinent.area) {
        return res.status(400).json({
            error: 'Brakujące wymagane pola',
            requiredFields: ['name', 'population', 'area']
        });
    }

    try {
        const data = await loadContinentsData();
        const continentIndex = data.findIndex(item => item.continent.code === continentCode);

        if (continentIndex === -1) {
            return res.status(404).send('Kontynent o podanym kodzie nie istnieje');
        }

        data[continentIndex].continent = {
            code: continentCode,
            name: updatedContinent.name,
            population: updatedContinent.population,
            area: updatedContinent.area,
            countries: updatedContinent.countries || []
        };

        await saveContinentsData(data);

        res.status(200).json({
            message: 'Kontynent został całkowicie zaktualizowany',
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

router.post('/continent', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Continent Creation');

    const newContinent = req.body;

    if (!newContinent.name || !newContinent.code) {
        return res.status(400).json({
            error: 'Brakujące wymagane pola',
            requiredFields: ['name', 'code']
        });
    }

    try {
        const data = await loadContinentsData();
        const continentExists = data.some(item => 
            item.continent.code === newContinent.code.toUpperCase()
        );

        if (continentExists) {
            return res.status(409).json({
                error: 'Kontynent o podanym kodzie już istnieje'
            });
        }

        const continentToAdd = {
            continent: {
                name: newContinent.name,
                code: newContinent.code.toUpperCase(),
                population: newContinent.population || "0",
                area: newContinent.area || "0",
                countries: newContinent.countries || []
            }
        };

        data.push(continentToAdd);
        await saveContinentsData(data);

        res.status(201).json({
            message: 'Kontynent został dodany pomyślnie',
            continent: continentToAdd.continent,
            _links: {
                self: { href: `http://localhost:3000/api/continent/${continentToAdd.continent.code}`, method: 'GET' },
                allContinents: { href: 'http://localhost:3000/api/continent', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas dodawania kontynentu:', error);
        res.status(500).send('Błąd przy dodawaniu kontynentu');
    }
});

router.patch('/continent/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Continent Partial Update');

    const continentCode = req.params.code.toUpperCase();
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            error: 'Brak pól do aktualizacji'
        });
    }

    try {
        const data = await loadContinentsData();
        const continentIndex = data.findIndex(item => item.continent.code === continentCode);

        if (continentIndex === -1) {
            return res.status(404).json({
                error: 'Kontynent o podanym kodzie nie został znaleziony'
            });
        }

        const currentContinent = data[continentIndex].continent;
        
        data[continentIndex].continent = {
            ...currentContinent,
            ...(updates.name && { name: updates.name }),
            ...(updates.population && { population: updates.population }),
            ...(updates.area && { area: updates.area }),
            ...(updates.countries && { countries: updates.countries })
        };

        await saveContinentsData(data);

        res.status(200).json({
            message: 'Kontynent został częściowo zaktualizowany',
            updatedFields: Object.keys(updates),
            continent: data[continentIndex].continent,
            _links: {
                self: { href: `http://localhost:3000/api/continent/${continentCode}`, method: 'GET' },
                fullUpdate: { href: `http://localhost:3000/api/continent/${continentCode}`, method: 'PUT' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas częściowej aktualizacji kontynentu:', error);
        res.status(500).send('Błąd przy częściowej aktualizacji kontynentu');
    }
});

export default router;