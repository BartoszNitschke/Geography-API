import express from 'express';
import fs from 'fs';
import path, {dirname} from 'path';
import {fileURLToPath} from "url";
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../dane.json');

const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Action', 'X-Request-ID']
};

router.use(cors(corsOptions));

const loadLandmarksData = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) reject(error);
            else resolve(JSON.parse(data));
        });
    });
};

const saveLandmarksData = (data) => {
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
 *     Landmark:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: Nazwa zabytku
 *         type:
 *           type: string
 *           description: Typ zabytku
 *         description:
 *           type: string
 *           description: Opis zabytku
 */

/**
 * @swagger
 * /landmarks:
 *   get:
 *     summary: Pobierz wszystkie zabytki
 *     tags: [Landmarks]
 *     responses:
 *       200:
 *         description: Lista zabytków
 *       500:
 *         description: Błąd serwera
 */

router.get('/landmarks', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    try {
        const data = await loadLandmarksData();
        const allLandmarks = data
            .map(continent => continent.continent.countries)
            .flat()
            .map(country => country.landmarks.map(landmark => ({
                ...landmark,
                country: country.name,
                countryCode: country.code
            })))
            .flat();

        res.status(200).json({
            landmarks: allLandmarks,
            _links: {
                self: { href: 'http://localhost:3000/api/landmarks', method: 'GET' },
                addLandmark: { href: 'http://localhost:3000/api/landmarks/add', method: 'POST' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu listy zabytków:', error);
        res.status(500).send('Błąd przy wczytywaniu listy zabytków');
    }
});

/**
 * @swagger
 * /landmarks/country/{code}:
 *   get:
 *     summary: Pobierz zabytki dla konkretnego kraju
 *     tags: [Landmarks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kraju (2 litery)
 *     responses:
 *       200:
 *         description: Lista zabytków w kraju
 *       404:
 *         description: Kraj nie został znaleziony
 *       500:
 *         description: Błąd serwera
 */

router.get('/landmarks/country/:code', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const countryCode = req.params.code.toUpperCase();

    try {
        const data = await loadLandmarksData();
        const country = data
            .map(continent => continent.continent.countries)
            .flat()
            .find(c => c.code === countryCode);

        if (!country) {
            return res.status(404).send('Kraj o podanym kodzie nie został znaleziony');
        }

        res.status(200).json({
            country: country.name,
            landmarks: country.landmarks,
            _links: {
                self: { href: `http://localhost:3000/api/landmarks/country/${countryCode}`, method: 'GET' },
                country: { href: `http://localhost:3000/api/countries/${countryCode}`, method: 'GET' },
                allLandmarks: { href: 'http://localhost:3000/api/landmarks', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu zabytków kraju:', error);
        res.status(500).send('Błąd przy wczytywaniu zabytków kraju');
    }
});

/**
 * @swagger
 * /landmarks/country/{code}:
 *   post:
 *     summary: Dodaj nowy zabytek do kraju
 *     tags: [Landmarks]
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
 *             required:
 *               - name
 *               - type
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Zabytek został dodany
 *       400:
 *         description: Nieprawidłowe dane
 *       404:
 *         description: Kraj nie został znaleziony
 *       500:
 *         description: Błąd serwera
 */

router.post('/landmarks/country/:code', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Landmark Addition');
    res.setHeader('X-Powered-By', 'Express');

    const countryCode = req.params.code.toUpperCase();
    const newLandmark = req.body;

    if (!newLandmark.name || !newLandmark.type || !newLandmark.description) {
        return res.status(400).json({
            error: 'Brakujące wymagane pola',
            requiredFields: ['name', 'type', 'description']
        });
    }

    try {
        const data = await loadLandmarksData();
        let countryFound = false;

        for (let continent of data) {
            const country = continent.continent.countries.find(c => c.code === countryCode);
            if (country) {
                country.landmarks.push(newLandmark);
                countryFound = true;
                break;
            }
        }

        if (!countryFound) {
            return res.status(404).send('Kraj o podanym kodzie nie istnieje');
        }

        await saveLandmarksData(data);

        res.status(201).json({
            message: 'Zabytek został dodany pomyślnie',
            landmark: newLandmark,
            _links: {
                countryLandmarks: { href: `http://localhost:3000/api/landmarks/country/${countryCode}`, method: 'GET' },
                allLandmarks: { href: 'http://localhost:3000/api/landmarks', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas dodawania zabytku:', error);
        res.status(500).send('Błąd przy dodawaniu zabytku');
    }
});

/**
 * @swagger
 * /landmarks/country/{code}/{name}:
 *   put:
 *     summary: Aktualizuj zabytek
 *     tags: [Landmarks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kraju (2 litery)
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nazwa zabytku
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Landmark'
 *     responses:
 *       200:
 *         description: Zabytek zaktualizowany
 *       400:
 *         description: Nieprawidłowe dane
 *       404:
 *         description: Zabytek nie został znaleziony
 *       500:
 *         description: Błąd serwera
 */

router.put('/landmarks/country/:code/:name', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Landmark Update');
    res.setHeader('X-Request-ID', Date.now().toString());

    const countryCode = req.params.code.toUpperCase();
    const landmarkName = req.params.name;
    const updatedLandmark = req.body;

    if (!updatedLandmark.type || !updatedLandmark.description) {
        return res.status(400).json({
            error: 'Brakujące wymagane pola',
            requiredFields: ['type', 'description']
        });
    }

    try {
        const data = await loadLandmarksData();
        let landmarkUpdated = false;

        for (let continent of data) {
            const country = continent.continent.countries.find(c => c.code === countryCode);
            if (country) {
                const landmarkIndex = country.landmarks.findIndex(l => l.name === landmarkName);
                if (landmarkIndex !== -1) {
                    country.landmarks[landmarkIndex] = {
                        name: landmarkName,
                        ...updatedLandmark
                    };
                    landmarkUpdated = true;
                    break;
                }
            }
        }

        if (!landmarkUpdated) {
            return res.status(404).json({
                error: 'Zabytek nie został znaleziony'
            });
        }

        await saveLandmarksData(data);

        res.status(200).json({
            message: 'Zabytek został zaktualizowany',
            landmark: {
                name: landmarkName,
                ...updatedLandmark
            },
            _links: {
                self: { href: `http://localhost:3000/api/landmarks/country/${countryCode}/${landmarkName}`, method: 'GET' },
                countryLandmarks: { href: `http://localhost:3000/api/landmarks/country/${countryCode}`, method: 'GET' },
                allLandmarks: { href: 'http://localhost:3000/api/landmarks', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji zabytku:', error);
        res.status(500).send('Błąd przy aktualizacji zabytku');
    }
});

/**
 * @swagger
 * /landmarks/country/{code}/{name}:
 *   patch:
 *     summary: Częściowo aktualizuj zabytek
 *     tags: [Landmarks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kraju (2 litery)
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nazwa zabytku
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Typ zabytku
 *               description:
 *                 type: string
 *                 description: Opis zabytku
 *     responses:
 *       200:
 *         description: Zabytek częściowo zaktualizowany
 *       400:
 *         description: Brak pól do aktualizacji
 *       404:
 *         description: Zabytek nie został znaleziony
 *       500:
 *         description: Błąd serwera
 */

router.patch('/landmarks/country/:code/:name', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Landmark Partial Update');
    res.setHeader('X-Request-ID', Date.now().toString());

    const countryCode = req.params.code.toUpperCase();
    const landmarkName = req.params.name;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            error: 'Brak pól do aktualizacji'
        });
    }

    try {
        const data = await loadLandmarksData();
        let landmarkUpdated = false;
        let updatedLandmark;

        for (let continent of data) {
            const country = continent.continent.countries.find(c => c.code === countryCode);
            if (country) {
                const landmarkIndex = country.landmarks.findIndex(l => l.name === landmarkName);
                if (landmarkIndex !== -1) {
                    const currentLandmark = country.landmarks[landmarkIndex];
                    updatedLandmark = {
                        ...currentLandmark,
                        ...(updates.type && { type: updates.type }),
                        ...(updates.description && { description: updates.description }),
                        name: landmarkName // zachowujemy oryginalną nazwę
                    };
                    
                    country.landmarks[landmarkIndex] = updatedLandmark;
                    landmarkUpdated = true;
                    break;
                }
            }
        }

        if (!landmarkUpdated) {
            return res.status(404).json({
                error: 'Zabytek nie został znaleziony'
            });
        }

        await saveLandmarksData(data);

        res.status(200).json({
            message: 'Zabytek został częściowo zaktualizowany',
            updatedFields: Object.keys(updates),
            landmark: updatedLandmark,
            _links: {
                self: { href: `http://localhost:3000/api/landmarks/country/${countryCode}/${landmarkName}`, method: 'GET' },
                fullUpdate: { href: `http://localhost:3000/api/landmarks/country/${countryCode}/${landmarkName}`, method: 'PUT' },
                countryLandmarks: { href: `http://localhost:3000/api/landmarks/country/${countryCode}`, method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas częściowej aktualizacji zabytku:', error);
        res.status(500).send('Błąd przy częściowej aktualizacji zabytku');
    }
});

/**
 * @swagger
 * /landmarks/country/{code}/{name}:
 *   delete:
 *     summary: Usuń zabytek
 *     tags: [Landmarks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kod kraju (2 litery)
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nazwa zabytku
 *     responses:
 *       200:
 *         description: Zabytek usunięty
 *       404:
 *         description: Zabytek nie został znaleziony
 *       500:
 *         description: Błąd serwera
 */

router.delete('/landmarks/country/:code/:name', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Landmark Deletion');
    res.setHeader('X-Powered-By', 'Express');

    const countryCode = req.params.code.toUpperCase();
    const landmarkName = req.params.name;

    try {
        const data = await loadLandmarksData();
        let landmarkDeleted = false;

        for (let continent of data) {
            const country = continent.continent.countries.find(c => c.code === countryCode);
            if (country) {
                const landmarkIndex = country.landmarks.findIndex(l => l.name === landmarkName);
                if (landmarkIndex !== -1) {
                    country.landmarks.splice(landmarkIndex, 1);
                    landmarkDeleted = true;
                    break;
                }
            }
        }

        if (!landmarkDeleted) {
            return res.status(404).send('Zabytek nie został znaleziony');
        }

        await saveLandmarksData(data);

        res.status(200).json({
            message: `Zabytek ${landmarkName} został usunięty`,
            _links: {
                countryLandmarks: { href: `http://localhost:3000/api/landmarks/country/${countryCode}`, method: 'GET' },
                allLandmarks: { href: 'http://localhost:3000/api/landmarks', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas usuwania zabytku:', error);
        res.status(500).send('Błąd przy usuwaniu zabytku');
    }
});

export default router;