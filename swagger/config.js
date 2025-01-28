export const swaggerConfig = {
    openapi: '3.0.0',
    info: {
        title: 'API GraphQL Krajów i Kontynentów',
        version: '1.0.0',
        description: 'API do zarządzania informacjami o krajach, kontynentach i zabytkach',
        contact: {
            name: 'Administrator API',
            email: 'admin@example.com'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000/graphql',
            description: 'Serwer lokalny'
        }
    ]
}; 