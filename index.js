import express from "express";
import cors from 'cors';

import continents from "./routes/continents.js";
import countries from "./routes/countries.js";
import landmarks from "./routes/landmarks.js";


const app = express();

app.use(express.json());

const allowedOrigins = ['http://localhost:3000']; 
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Cache-Control', 'no-store');
    next();
});



app.use('/api/', continents, countries, landmarks);

app.get('/', (req, res) => {
    res.send('Witamy w API drużyn NBA!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});