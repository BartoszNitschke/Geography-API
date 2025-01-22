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

// Pobierz wszystkie zabytki
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

// Pobierz zabytki dla konkretnego kraju
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

// Dodaj nowy zabytek do kraju
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

// Usuń zabytek z kraju
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

// Aktualizuj zabytek
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

export default router;