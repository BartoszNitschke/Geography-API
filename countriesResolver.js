import data from "../dane/dane.json" assert { type: "json" };
import { applyFilters, validateCountryCode } from "./helperFunctions.js";

const mapContinent = (continent) => {
    return {
        name: continent.name,
        code: continent.code,
        countries: continent.countries,
        population: continent.population,
        area: continent.area
    };
};

const mapCountry = (country) => {
    return {
        name: country.name,
        capital: country.capital,
        code: country.code,
        landmarks: country.landmarks?.map(mapLandmark) || []
    };
};

const mapExtendedCountry = (country, details) => {
    return {
        base: mapCountry(country),
        details: {
            population: details?.population || "",
            area: details?.area || "",
            languages: details?.languages || [],
            currency: details?.currency || "",
            timezone: details?.timezone || ""
        }
    };
};

const mapLandmark = (landmark) => {
    return {
        name: landmark.name,
        type: landmark.type,
        description: landmark.description
    };
};

export const countryResolvers = {
    GetCountries: (req, res) => {
        const { filter, sort } = req.request || {};
        let result = [];

        // Zbieramy kraje ze wszystkich kontynentów
        data.forEach(item => {
            result = result.concat(item.continent.countries);
        });

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

        const countries = result.map((country) => mapCountry(country));
        res(null, { countries });
    },

    GetCountry: (req, res) => {
        const { code, continent_code } = req.request;
        let country;

        if (continent_code) {
            const continent = data.find(item => item.continent.code === continent_code)?.continent;
            country = continent?.countries.find(c => c.code === code);
        } else {
            for (const item of data) {
                country = item.continent.countries.find(c => c.code === code);
                if (country) break;
            }
        }

        if (!country) {
            res({ code: 5, message: "Kraj nie został znaleziony" }, null);
            return;
        }

        const result = mapCountry(country);
        res(null, result);
    },

    CreateCountry: (req, res) => {
        const { continent_code, country: countryInput } = req.request;
        
        if (!validateCountryCode(countryInput.code)) {
            res({ code: 3, message: "Nieprawidłowy format kodu kraju" }, null);
            return;
        }

        const continentIndex = data.findIndex(item => item.continent.code === continent_code);
        if (continentIndex === -1) {
            res({ code: 5, message: "Kontynent nie został znaleziony" }, null);
            return;
        }

        // Sprawdzamy czy kraj o takim kodzie już istnieje
        const exists = data[continentIndex].continent.countries.some(c => c.code === countryInput.code);
        if (exists) {
            res({ code: 6, message: "Kraj o takim kodzie już istnieje" }, null);
            return;
        }

        const newCountry = {
            ...countryInput,
            landmarks: countryInput.landmarks || []
        };

        data[continentIndex].continent.countries.push(newCountry);
        const result = mapCountry(newCountry);
        res(null, result);
    },

    UpdateCountry: (req, res) => {
        const { code, country: countryInput } = req.request;

        if (!validateCountryCode(code)) {
            res({ code: 3, message: "Nieprawidłowy format kodu kraju" }, null);
            return;
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
                const result = mapCountry(item.continent.countries[countryIndex]);
                res(null, result);
                return;
            }
        }

        if (!updated) {
            res({ code: 5, message: "Kraj nie został znaleziony" }, null);
        }
    },

    DeleteCountry: (req, res) => {
        const { code } = req.request;

        if (!validateCountryCode(code)) {
            return res(null, {
                success: false,
                message: "Nieprawidłowy format kodu kraju",
                code: "400"
            });
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
            return res(null, {
                success: false,
                message: "Kraj nie został znaleziony",
                code: "404"
            });
        }

        return res(null, {
            success: true,
            message: "Kraj został usunięty",
            code: "200"
        });
    }
};

export const extendedCountryResolvers = {
    // implementacja rozszerzonych resolverów
};