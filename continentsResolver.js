import data from "../dane/dane.json" assert { type: "json" };
import { applyFilters } from "./helperFunctions.js";

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
        landmarks: country.landmarks
    };
};

const mapLandmark = (landmark) => {
    return {
        name: landmark.name,
        type: landmark.type,
        description: landmark.description
    };
};

export const continentResolvers = {
    GetContinents: (req, res) => {
        const { filter, sort } = req.request || {};
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

        const continents = result.map((continent) => mapContinent(continent));
        res(null, { continents });
    },

    GetContinent: (req, res) => {
        const code = req.request.code;
        const continent = data.find(item => item.continent.code === code)?.continent;

        if (!continent) {
            res({ code: 5, message: "Kontynent nie został znaleziony" }, null);
            return;
        }

        const result = mapContinent(continent);
        res(null, result);
    },

    UpdateContinent: (req, res) => {
        const { code, continent: continentInput } = req.request;
        const continentIndex = data.findIndex(item => item.continent.code === code);

        if (continentIndex === -1) {
            res({ code: 5, message: "Kontynent nie został znaleziony" }, null);
            return;
        }

        data[continentIndex].continent = {
            ...data[continentIndex].continent,
            ...continentInput,
            code // zachowujemy oryginalny kod
        };

        const result = mapContinent(data[continentIndex].continent);
        res(null, result);
    },

    DeleteContinent: (req, res) => {
        const code = req.request.code;
        const continentIndex = data.findIndex(item => item.continent.code === code);

        if (continentIndex === -1) {
            return res(null, {
                success: false,
                message: "Kontynent nie został znaleziony",
                code: "404"
            });
        }

        data.splice(continentIndex, 1);
        res(null, {
            success: true,
            message: "Kontynent został usunięty",
            code: "200"
        });
    }
};