import data from "../dane/dane.json" assert { type: "json" };
import { applyFilters, validateCountryCode, validateLandmarkData } from "./helperFunctions.js";

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

const mapExtendedLandmark = (landmark, details) => {
    return {
        base: mapLandmark(landmark),
        details: {
            category: details?.category || "",
            status: details?.status || "",
            price_range: details?.price_range || "",
            visiting_hours: details?.visiting_hours || "",
            accessibility: details?.accessibility || "",
            last_renovation: details?.last_renovation || ""
        }
    };
};

export const landmarkResolvers = {
    GetLandmarks: (req, res) => {
        const { filter, sort } = req.request || {};
        let result = [];

        // Zbieramy wszystkie zabytki ze wszystkich krajów
        data.forEach(item => {
            item.continent.countries.forEach(country => {
                if (country.landmarks) {
                    result = result.concat(country.landmarks.map(landmark => ({
                        ...landmark,
                        country_code: country.code
                    })));
                }
            });
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

        const landmarks = result.map((landmark) => mapLandmark(landmark));
        res(null, { landmarks });
    },

    GetLandmark: (req, res) => {
        const { country_code, name } = req.request;

        if (!validateCountryCode(country_code)) {
            res({ code: 3, message: "Nieprawidłowy format kodu kraju" }, null);
            return;
        }

        let landmark = null;
        data.some(item => {
            const country = item.continent.countries.find(c => c.code === country_code);
            if (country) {
                landmark = country.landmarks.find(l => l.name === name);
                return true;
            }
            return false;
        });

        if (!landmark) {
            res({ code: 5, message: "Zabytek nie został znaleziony" }, null);
            return;
        }

        const result = mapLandmark(landmark);
        res(null, result);
    },

    AddLandmark: (req, res) => {
        const { country_code, landmark: landmarkInput } = req.request;

        if (!validateCountryCode(country_code)) {
            res({ code: 3, message: "Nieprawidłowy format kodu kraju" }, null);
            return;
        }

        validateLandmarkData(landmarkInput);

        let added = false;
        for (const item of data) {
            const country = item.continent.countries.find(c => c.code === country_code);
            if (country) {
                if (country.landmarks.some(l => l.name === landmarkInput.name)) {
                    res({ code: 6, message: "Zabytek o takiej nazwie już istnieje" }, null);
                    return;
                }
                country.landmarks.push(landmarkInput);
                added = true;
                const result = mapLandmark(landmarkInput);
                res(null, result);
                return;
            }
        }

        if (!added) {
            res({ code: 5, message: "Kraj nie został znaleziony" }, null);
        }
    },

    UpdateLandmark: (req, res) => {
        const { country_code, name, landmark: landmarkInput } = req.request;

        if (!validateCountryCode(country_code)) {
            res({ code: 3, message: "Nieprawidłowy format kodu kraju" }, null);
            return;
        }

        validateLandmarkData(landmarkInput);

        let updated = false;
        for (const item of data) {
            const country = item.continent.countries.find(c => c.code === country_code);
            if (country) {
                const landmarkIndex = country.landmarks.findIndex(l => l.name === name);
                if (landmarkIndex === -1) {
                    res({ code: 5, message: "Zabytek nie został znaleziony" }, null);
                    return;
                }
                country.landmarks[landmarkIndex] = landmarkInput;
                updated = true;
                const result = mapLandmark(landmarkInput);
                res(null, result);
                return;
            }
        }

        if (!updated) {
            res({ code: 5, message: "Kraj nie został znaleziony" }, null);
        }
    },

    DeleteLandmark: (req, res) => {
        const { country_code, name } = req.request;

        if (!validateCountryCode(country_code)) {
            return res(null, {
                success: false,
                message: "Nieprawidłowy format kodu kraju",
                code: "400"
            });
        }

        let deleted = false;
        for (const item of data) {
            const country = item.continent.countries.find(c => c.code === country_code);
            if (country) {
                const landmarkIndex = country.landmarks.findIndex(l => l.name === name);
                if (landmarkIndex !== -1) {
                    country.landmarks.splice(landmarkIndex, 1);
                    deleted = true;
                    break;
                }
            }
        }

        if (!deleted) {
            return res(null, {
                success: false,
                message: "Zabytek nie został znaleziony",
                code: "404"
            });
        }

        return res(null, {
            success: true,
            message: "Zabytek został usunięty",
            code: "200"
        });
    }
};

export const extendedLandmarkResolvers = {
    GetLandmarkStats: (req, res) => {
        const { country_code } = req.request;
        let landmarks = [];

        if (country_code) {
            // Zbierz zabytki tylko z danego kraju
            data.some(item => {
                const country = item.continent.countries.find(c => c.code === country_code);
                if (country) {
                    landmarks = country.landmarks;
                    return true;
                }
                return false;
            });
        } else {
            // Zbierz wszystkie zabytki
            data.forEach(item => {
                item.continent.countries.forEach(country => {
                    landmarks = landmarks.concat(country.landmarks);
                });
            });
        }

        const stats = {
            total_count: landmarks.length,
            by_type: {},
            by_status: {},
            by_category: {},
            most_visited: []
        };

        landmarks.forEach(landmark => {
            // Zliczanie po typach
            stats.by_type[landmark.type] = (stats.by_type[landmark.type] || 0) + 1;
            
            // Zliczanie po statusach
            if (landmark.details?.status) {
                stats.by_status[landmark.details.status] = 
                    (stats.by_status[landmark.details.status] || 0) + 1;
            }
            
            // Zliczanie po kategoriach
            if (landmark.details?.category) {
                stats.by_category[landmark.details.category] = 
                    (stats.by_category[landmark.details.category] || 0) + 1;
            }
        });

        // Dodanie najczęściej odwiedzanych zabytków
        stats.most_visited = landmarks
            .sort((a, b) => (b.details?.visitors || 0) - (a.details?.visitors || 0))
            .slice(0, 5)
            .map(l => l.name);

        res(null, stats);
    }
};