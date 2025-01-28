import { buildSchema } from 'graphql';
import { typeDefs } from '../graphql/schema.js';

const schema = buildSchema(typeDefs);

export const graphqlDocs = {
    openapi: '3.0.0',
    info: {
        title: 'API GraphQL',
        version: '1.0.0',
        description: 'Dokumentacja API GraphQL dla systemu zarządzania krajami i kontynentami'
    },
    tags: [
        { name: 'Queries', description: 'Zapytania GraphQL' },
        { name: 'Mutations', description: 'Mutacje GraphQL' }
    ],
    paths: {
        '/graphql': {
            post: {
                tags: ['Queries', 'Mutations'],
                summary: 'Endpoint GraphQL',
                description: 'Wykonaj zapytanie lub mutację GraphQL',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['query'],
                                properties: {
                                    query: { type: 'string' },
                                    variables: { type: 'object' }
                                }
                            },
                            examples: {
                               
                                'Pobierz kontynenty': {
                                    value: {
                                        query: `query {
                                            continents {
                                                name
                                                code
                                                countries {
                                                    name
                                                    capital
                                                }
                                            }
                                        }`
                                    }
                                },
                                'Pobierz kraje': {
                                    value: {
                                        query: `query {
                                            countries {
                                                name
                                                capital
                                                code
                                                landmarks {
                                                    name
                                                    type
                                                }
                                            }
                                        }`
                                    }
                                },
                                'Pobierz zabytki': {
                                    value: {
                                        query: `query {
                                            landmarks {
                                                name
                                                type
                                                description
                                            }
                                        }`
                                    }
                                },
                                
                                'Dodaj kraj': {
                                    value: {
                                        query: `mutation {
                                            createCountry(
                                                continentCode: "EU",
                                                countryInput: {
                                                    name: "Polska",
                                                    capital: "Warszawa",
                                                    code: "PL"
                                                }
                                            ) {
                                                name
                                                capital
                                                code
                                            }
                                        }`
                                    }
                                },
                                'Aktualizuj kraj': {
                                    value: {
                                        query: `mutation {
                                            updateCountry(
                                                code: "PL",
                                                countryInput: {
                                                    name: "Polska",
                                                    capital: "Warszawa"
                                                }
                                            ) {
                                                name
                                                capital
                                                code
                                            }
                                        }`
                                    }
                                },
                                'Usuń kraj': {
                                    value: {
                                        query: `mutation {
                                            deleteCountry(code: "PL") {
                                                success
                                                message
                                                errorCode
                                            }
                                        }`
                                    }
                                },
                                'Dodaj zabytek': {
                                    value: {
                                        query: `mutation {
                                            addLandmark(
                                                countryCode: "PL",
                                                landmark: {
                                                    name: "Wawel",
                                                    type: "Zamek",
                                                    description: "Zamek królewski w Krakowie"
                                                }
                                            ) {
                                                name
                                                type
                                                description
                                            }
                                        }`
                                    }
                                },
                                'Aktualizuj zabytek': {
                                    value: {
                                        query: `mutation {
                                            updateLandmark(
                                                countryCode: "PL",
                                                landmarkName: "Wawel",
                                                landmark: {
                                                    name: "Wawel",
                                                    type: "Zamek królewski",
                                                    description: "Zamek królewski na wzgórzu wawelskim w Krakowie"
                                                }
                                            ) {
                                                name
                                                type
                                                description
                                            }
                                        }`
                                    }
                                },
                                'Usuń zabytek': {
                                    value: {
                                        query: `mutation {
                                            deleteLandmark(
                                                countryCode: "PL",
                                                landmarkName: "Wawel"
                                            ) {
                                                success
                                                message
                                                errorCode
                                            }
                                        }`
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Sukces',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { type: 'object' },
                                        errors: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' },
                                                    path: { type: 'array', items: { type: 'string' } }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Błędne zapytanie',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        errors: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            Query: {
                type: 'object',
                properties: {
                    continents: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Continent'
                        }
                    },
                    countries: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Country'
                        }
                    },
                    landmarks: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Landmark'
                        }
                    }
                }
            },
            Continent: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        example: 'Europa'
                    },
                    code: {
                        type: 'string',
                        example: 'EU'
                    },
                    countries: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Country'
                        }
                    },
                    population: {
                        type: 'string',
                        example: '746419440'
                    },
                    area: {
                        type: 'string',
                        example: '10180000'
                    }
                }
            },
            Country: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        example: 'Polska'
                    },
                    capital: {
                        type: 'string',
                        example: 'Warszawa'
                    },
                    code: {
                        type: 'string',
                        example: 'PL'
                    },
                    landmarks: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Landmark'
                        }
                    }
                }
            },
            Landmark: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        example: 'Wawel'
                    },
                    type: {
                        type: 'string',
                        example: 'Zamek'
                    },
                    description: {
                        type: 'string',
                        example: 'Zamek królewski w Krakowie'
                    }
                }
            }
        },
        examples: {
            GetContinents: {
                value: {
                    query: `
                        query {
                            continents {
                                name
                                code
                                countries {
                                    name
                                    capital
                                }
                            }
                        }
                    `
                }
            },
            GetCountries: {
                value: {
                    query: `
                        query {
                            countries {
                                name
                                capital
                                code
                                landmarks {
                                    name
                                    type
                                }
                            }
                        }
                    `
                }
            },
            GetLandmarks: {
                value: {
                    query: `
                        query {
                            landmarks {
                                name
                                type
                                description
                            }
                        }
                    `
                }
            },
            CreateCountry: {
                value: {
                    query: `
                        mutation {
                            createCountry(
                                continentCode: "EU",
                                countryInput: {
                                    name: "Polska",
                                    capital: "Warszawa",
                                    code: "PL"
                                }
                            ) {
                                name
                                capital
                                code
                            }
                        }
                    `
                }
            },
            UpdateCountry: {
                value: {
                    query: `
                        mutation {
                            updateCountry(
                                code: "PL",
                                countryInput: {
                                    name: "Polska",
                                    capital: "Warszawa"
                                }
                            ) {
                                name
                                capital
                                code
                            }
                        }
                    `
                }
            },
            DeleteCountry: {
                value: {
                    query: `
                        mutation {
                            deleteCountry(code: "PL") {
                                success
                                message
                                errorCode
                            }
                        }
                    `
                }
            },
            AddLandmark: {
                value: {
                    query: `
                        mutation {
                            addLandmark(
                                countryCode: "PL",
                                landmark: {
                                    name: "Wawel",
                                    type: "Zamek",
                                    description: "Zamek królewski w Krakowie"
                                }
                            ) {
                                name
                                type
                                description
                            }
                        }
                    `
                }
            },
            UpdateLandmark: {
                value: {
                    query: `
                        mutation {
                            updateLandmark(
                                countryCode: "PL",
                                landmarkName: "Wawel",
                                landmark: {
                                    name: "Wawel",
                                    type: "Zamek królewski",
                                    description: "Zamek królewski na wzgórzu wawelskim w Krakowie"
                                }
                            ) {
                                name
                                type
                                description
                            }
                        }
                    `
                }
            },
            DeleteLandmark: {
                value: {
                    query: `
                        mutation {
                            deleteLandmark(
                                countryCode: "PL",
                                landmarkName: "Wawel"
                            ) {
                                success
                                message
                                code
                            }
                        }
                    `
                }
            },
            UpdateContinent: {
                value: {
                    query: `
                        mutation {
                            updateContinent(
                                code: "EU",
                                name: "Europa",
                                population: "746419440",
                                area: "10180000"
                            ) {
                                name
                                code
                                population
                                area
                            }
                        }
                    `
                }
            },
            DeleteContinent: {
                value: {
                    query: `
                        mutation {
                            deleteContinent(code: "EU") {
                                success
                                message
                                code
                            }
                        }
                    `
                }
            }
        }
    }
}; 