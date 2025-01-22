import data from "../dane.json" assert { type: 'json' };
import { applyFilters, validateContinentCode, validateCountryCode, validateLandmarkName, validateLandmarkData } from "./helpers.js";

export const resolvers = {
    Query: {
        continents: (_, { filter, sort }) => {
            let result = data.map(item => item.continent);

            if (filter) {
                result = result.filter((item) => applyFilters(item, filter));
            }

            if (sort) {
                const { field, order } = sort;
                result = result.sort((a, b) => {
                    if (a[field] < b[field]) return order === "ASC" ? -1 : 1;
                    if (a[field] > b[field]) return order === "ASC" ? 1 : -1;
                    return 0;
                });
            }

            return result;
        },

        continent: (_, { code }) => {
            if (!validateContinentCode(code)) {
                return {
                    __typename: "ErrorResponse",
                    message: "Nieprawidłowy format kodu kontynentu",
                    errorCode: "400"
                };
            }

            const continent = data.find(item => item.continent.code === code)?.continent;

            if (!continent) {
                return {
                    __typename: "ErrorResponse",
                    message: "Kontynent nie został znaleziony",
                    errorCode: "404"
                };
            }

            return {
                __typename: "Continent",
                ...continent
            };
        },

        countries: (_, { filter, sort }) => {
            let result = data
                .map(item => item.continent.countries)
                .flat();

            if (filter) {
                result = result.filter((item) => applyFilters(item, filter));
            }

            if (sort) {
                const { field, order } = sort;
                result = result.sort((a, b) => {
                    if (a[field] < b[field]) return order === "ASC" ? -1 : 1;
                    if (a[field] > b[field]) return order === "ASC" ? 1 : -1;
                    return 0;
                });
            }

            return result;
        },

        country: (_, { code }) => {
            if (!validateCountryCode(code)) {
                return {
                    __typename: "ErrorResponse",
                    message: "Nieprawidłowy format kodu kraju",
                    errorCode: "400"
                };
            }

            let foundCountry = null;
            let continentName = null;

            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === code);
                if (country) {
                    foundCountry = country;
                    continentName = item.continent.name;
                    break;
                }
            }

            if (!foundCountry) {
                return {
                    __typename: "ErrorResponse",
                    message: "Kraj nie został znaleziony",
                    errorCode: "404"
                };
            }

            return {
                __typename: "Country",
                ...foundCountry,
                continent: continentName
            };
        },

        landmarks: (_, { countryCode, filter, sort }) => {
            let result = [];

            if (countryCode) {
                const country = data
                    .map(item => item.continent.countries)
                    .flat()
                    .find(c => c.code === countryCode);

                result = country ? country.landmarks : [];
            } else {
                result = data
                    .map(item => item.continent.countries)
                    .flat()
                    .map(country => country.landmarks)
                    .flat();
            }

            if (filter) {
                result = result.filter((item) => applyFilters(item, filter));
            }

            if (sort) {
                const { field, order } = sort;
                result = result.sort((a, b) => {
                    if (a[field] < b[field]) return order === "ASC" ? -1 : 1;
                    if (a[field] > b[field]) return order === "ASC" ? 1 : -1;
                    return 0;
                });
            }

            return result;
        }
    },

    Mutation: {
        createCountry: (_, { continentCode, countryInput }) => {
            if (!validateContinentCode(continentCode)) {
                throw new Error("Nieprawidłowy format kodu kontynentu");
            }

            const continentIndex = data.findIndex(item => item.continent.code === continentCode);
            if (continentIndex === -1) {
                throw new Error("Kontynent nie został znaleziony");
            }

            const newCountry = {
                ...countryInput,
                landmarks: countryInput.landmarks || []
            };

            data[continentIndex].continent.countries.push(newCountry);
            return newCountry;
        },

        updateCountry: (_, { code, countryInput }) => {
            if (!validateCountryCode(code)) {
                throw new Error("Nieprawidłowy format kodu kraju");
            }

            let updated = false;
            for (const item of data) {
                const countryIndex = item.continent.countries.findIndex(c => c.code === code);
                if (countryIndex !== -1) {
                    item.continent.countries[countryIndex] = {
                        ...item.continent.countries[countryIndex],
                        ...countryInput,
                        code // zachowujemy oryginalny kod
                    };
                    updated = true;
                    return item.continent.countries[countryIndex];
                }
            }

            if (!updated) {
                throw new Error("Kraj nie został znaleziony");
            }
        },

        deleteCountry: (_, { code }) => {
            if (!validateCountryCode(code)) {
                return { 
                    success: false, 
                    message: "Nieprawidłowy format kodu kraju", 
                    errorCode: "400"
                };
            }

            let deleted = false;
            for (const item of data) {
                const countryIndex = item.continent.countries.findIndex(c => c.code === code);
                if (countryIndex !== -1) {
                    item.continent.countries.splice(countryIndex, 1);
                    deleted = true;
                    break;
                }
            }

            if (!deleted) {
                return { 
                    success: false, 
                    message: "Kraj nie został znaleziony", 
                    errorCode: "404"
                };
            }

            return { 
                success: true, 
                message: "Kraj został usunięty", 
                errorCode: "200"
            };
        },

        addLandmark: (_, { countryCode, landmark }) => {
            if (!validateCountryCode(countryCode)) {
                throw new Error("Nieprawidłowy format kodu kraju");
            }

            validateLandmarkData(landmark);

            let added = false;
            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === countryCode);
                if (country) {
                    // Sprawdź, czy zabytek o takiej nazwie już istnieje
                    if (country.landmarks.some(l => l.name === landmark.name)) {
                        throw new Error("Zabytek o takiej nazwie już istnieje");
                    }
                    country.landmarks.push(landmark);
                    added = true;
                    return landmark;
                }
            }

            if (!added) {
                throw new Error("Kraj nie został znaleziony");
            }
        },

        updateLandmark: (_, { countryCode, landmarkName, landmark }) => {
            if (!validateCountryCode(countryCode)) {
                throw new Error("Nieprawidłowy format kodu kraju");
            }

            validateLandmarkData(landmark);

            let updated = false;
            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === countryCode);
                if (country) {
                    const landmarkIndex = country.landmarks.findIndex(l => l.name === landmarkName);
                    if (landmarkIndex === -1) {
                        throw new Error("Zabytek nie został znaleziony");
                    }
                    country.landmarks[landmarkIndex] = landmark;
                    updated = true;
                    return landmark;
                }
            }

            if (!updated) {
                throw new Error("Kraj nie został znaleziony");
            }
        },

        deleteLandmark: (_, { countryCode, landmarkName }) => {
            if (!validateCountryCode(countryCode)) {
                return {
                    success: false,
                    message: "Nieprawidłowy format kodu kraju",
                    code: "400"
                };
            }

            let deleted = false;
            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === countryCode);
                if (country) {
                    const landmarkIndex = country.landmarks.findIndex(l => l.name === landmarkName);
                    if (landmarkIndex === -1) {
                        return {
                            success: false,
                            message: "Zabytek nie został znaleziony",
                            code: "404"
                        };
                    }
                    country.landmarks.splice(landmarkIndex, 1);
                    deleted = true;
                    break;
                }
            }

            if (!deleted) {
                return {
                    success: false,
                    message: "Kraj nie został znaleziony",
                    code: "404"
                };
            }

            return {
                success: true,
                message: "Zabytek został usunięty",
                code: "200"
            };
        }
    }
};