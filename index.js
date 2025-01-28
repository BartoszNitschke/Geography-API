import express from "express";
import cors from 'cors';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import swaggerUi from 'swagger-ui-express';
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import { CountryCode, Name, BigNumber } from "./graphql/scalars.js";
import { graphqlDocs } from './swagger/documentation.js';

const app = express();
const ports = [4000, 4001, 4002, 4003]; 

async function startServer() {
    try {
        const apolloServer = new ApolloServer({
            typeDefs,
            resolvers: {
                CountryCode,
                Name,
                BigNumber,
                ...resolvers
            },
            formatError: (error) => {
                console.error('GraphQL Error:', error);
                return {
                    message: error.message,
                    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
                    path: error.path
                };
            },
        });

        await apolloServer.start();

        app.use(cors());
        app.use(express.json());

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(graphqlDocs));

        app.use("/graphql", 
            expressMiddleware(apolloServer, {
                context: async ({ req }) => ({
                    token: req.headers.authorization,
                })
            })
        );

        for (const port of ports) {
            try {
                await new Promise((resolve, reject) => {
                    const server = app.listen(port)
                        .once('listening', () => {
                            console.log(`Serwer GraphQL działa na http://localhost:${port}/graphql`);
                            // console.log(`Dokumentacja Swagger dostępna na http://localhost:${port}/api-docs`);
                            resolve();
                        })
                        .once('error', (err) => {
                            if (err.code === 'EADDRINUSE') {
                                console.log(`Port ${port} jest zajęty.`);
                                server.close();
                                resolve(); 
                            } else {
                                reject(err);
                            }
                        });
                });
            } catch (error) {
                console.error(`Błąd podczas próby użycia portu ${port}:`, error);
                continue;
            }
            break; 
        }
    } catch (error) {
        console.error('Błąd podczas uruchamiania serwera:', error);
        process.exit(1);
    }
}

startServer();