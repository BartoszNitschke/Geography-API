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
                result.sort((a, b) => order === "ASC" ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field]));
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
                result.sort((a, b) => order === "ASC" ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field]));
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

            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === code);
                if (country) {
                    return {
                        __typename: "Country",
                        ...country,
                        continent: item.continent.name
                    };
                }
            }

            return {
                __typename: "ErrorResponse",
                message: "Kraj nie został znaleziony",
                errorCode: "404"
            };
        },

        landmarks: (_, { countryCode, filter, sort }) => {
            let result = countryCode 
                ? data.map(item => item.continent.countries)
                    .flat()
                    .find(c => c.code === countryCode)?.landmarks || []
                : data.map(item => item.continent.countries)
                    .flat()
                    .map(country => country.landmarks)
                    .flat();

            if (filter) {
                result = result.filter((item) => applyFilters(item, filter));
            }

            if (sort) {
                const { field, order } = sort;
                result.sort((a, b) => order === "ASC" ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field]));
            }

            return result;
        },

        landmark: (_, { countryCode, name }) => {
            if (!validateCountryCode(countryCode)) {
                return {
                    __typename: "ErrorResponse",
                    message: "Nieprawidłowy format kodu kraju",
                    errorCode: "400"
                };
            }
            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === countryCode);
                if (country) {
                    const landmark = country.landmarks.find(l => l.name === name);
                    if (landmark) {
                        return {
                            __typename: "Landmark",
                            ...landmark
                        };
                    }
                }
            }
            return {
                __typename: "ErrorResponse",
                message: "Zabytek nie został znaleziony",
                errorCode: "404"
            };
        }
    },

    Mutation: {
        createContinent: (_, { continentInput }) => {
            if (!validateContinentCode(continentInput.code)) {
                throw new Error("Nieprawidłowy format kodu kontynentu");
            }
            if (data.some(item => item.continent.code === continentInput.code)) {
                throw new Error("Kontynent o takim kodzie już istnieje");
            }
            const newContinent = {
                continent: {
                    ...continentInput,
                    countries: []
                }
            };
            data.push(newContinent);
            return newContinent.continent;
        },

        updateContinent: (_, { code, name, population, area }) => {
            if (!validateContinentCode(code)) {
                throw new Error("Nieprawidłowy format kodu kontynentu");
            }
            const continent = data.find(item => item.continent.code === code)?.continent;
            if (!continent) {
                throw new Error("Kontynent nie został znaleziony");
            }
            Object.assign(continent, { name, population, area });
            return continent;
        },

        patchContinent: (_, { code, updates }) => {
            if (!validateContinentCode(code)) {
                throw new Error("Nieprawidłowy format kodu kontynentu");
            }
            const continent = data.find(item => item.continent.code === code)?.continent;
            if (!continent) {
                throw new Error("Kontynent nie został znaleziony");
            }
            Object.assign(continent, updates);
            return continent;
        },

        deleteContinent: (_, { code }) => {
            if (!validateContinentCode(code)) {
                return {
                    success: false,
                    message: "Nieprawidłowy format kodu kontynentu",
                    code: "400"
                };
            }
            const index = data.findIndex(item => item.continent.code === code);
            if (index === -1) {
                return {
                    success: false,
                    message: "Kontynent nie został znaleziony",
                    code: "404"
                };
            }
            data.splice(index, 1);
            return {
                success: true,
                message: "Kontynent został usunięty",
                code: "200"
            };
        },

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
            for (const item of data) {
                const countryIndex = item.continent.countries.findIndex(c => c.code === code);
                if (countryIndex !== -1) {
                    item.continent.countries[countryIndex] = {
                        ...item.continent.countries[countryIndex],
                        ...countryInput,
                        code
                    };
                    return item.continent.countries[countryIndex];
                }
            }
            throw new Error("Kraj nie został znaleziony");
        },

        patchCountry: (_, { code, updates }) => {
            if (!validateCountryCode(code)) {
                throw new Error("Nieprawidłowy format kodu kraju");
            }
            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === code);
                if (country) {
                    Object.assign(country, updates);
                    return country;
                }
            }
            throw new Error("Kraj nie został znaleziony");
        },

        deleteCountry: (_, { code }) => {
            if (!validateCountryCode(code)) {
                return {
                    success: false,
                    message: "Nieprawidłowy format kodu kraju",
                    code: "400"
                };
            }
            for (const item of data) {
                const countryIndex = item.continent.countries.findIndex(c => c.code === code);
                if (countryIndex !== -1) {
                    item.continent.countries.splice(countryIndex, 1);
                    return {
                        success: true,
                        message: "Kraj został usunięty",
                        code: "200"
                    };
                }
            }
            return {
                success: false,
                message: "Kraj nie został znaleziony",
                code: "404"
            };
        },

        addLandmark: (_, { countryCode, landmark }) => {
            if (!validateCountryCode(countryCode)) {
                throw new Error("Nieprawidłowy format kodu kraju");
            }
            validateLandmarkData(landmark);
            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === countryCode);
                if (country) {
                    if (country.landmarks.some(l => l.name === landmark.name)) {
                        throw new Error("Zabytek o takiej nazwie już istnieje");
                    }
                    country.landmarks.push(landmark);
                    return landmark;
                }
            }
            throw new Error("Kraj nie został znaleziony");
        },

        updateLandmark: (_, { countryCode, landmarkName, landmark }) => {
            if (!validateCountryCode(countryCode)) {
                throw new Error("Nieprawidłowy format kodu kraju");
            }
            validateLandmarkData(landmark);
            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === countryCode);
                if (country) {
                    const landmarkIndex = country.landmarks.findIndex(l => l.name === landmarkName);
                    if (landmarkIndex === -1) {
                        throw new Error("Zabytek nie został znaleziony");
                    }
                    country.landmarks[landmarkIndex] = landmark;
                    return landmark;
                }
            }
            throw new Error("Kraj nie został znaleziony");
        },

        patchLandmark: (_, { countryCode, landmarkName, updates }) => {
            if (!validateCountryCode(countryCode)) {
                throw new Error("Nieprawidłowy format kodu kraju");
            }
            for (const item of data) {
                const country = item.continent.countries.find(c => c.code === countryCode);
                if (country) {
                    const landmark = country.landmarks.find(l => l.name === landmarkName);
                    if (!landmark) {
                        throw new Error("Zabytek nie został znaleziony");
                    }
                    Object.assign(landmark, updates);
                    return landmark;
                }
            }
            throw new Error("Kraj nie został znaleziony");
        },

        deleteLandmark: (_, { countryCode, landmarkName }) => {
            if (!validateCountryCode(countryCode)) {
                return {
                    success: false,
                    message: "Nieprawidłowy format kodu kraju",
                    code: "400"
                };
            }
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
                    return {
                        success: true,
                        message: "Zabytek został usunięty",
                        code: "200"
                    };
                }
            }
            return {
                success: false,
                message: "Kraj nie został znaleziony",
                code: "404"
            };
        }
    }
};