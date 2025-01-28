import express from "express";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import continents from "./routes/continents.js";
import countries from "./routes/countries.js";
import landmarks from "./routes/landmarks.js";

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Kontynentów, Krajów i Zabytków',
            version: '1.0.0',
            description: 'API do zarządzania informacjami o kontynentach, krajach i zabytkach',
            contact: {
                name: 'Administrator API',
                email: 'admin@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Serwer lokalny'
            }
        ]
    },
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/', continents, countries, landmarks);

app.get('/', (req, res) => {
    res.send('API Kontynentów, Krajów i Zabytków');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
    console.log(`Dokumentacja Swagger dostępna pod adresem: http://localhost:${PORT}/api-docs`);
});