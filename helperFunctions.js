export const applyFilters = (item, filter) => {
    if (!filter) return true;
    
    return Object.entries(filter).every(([key, value]) => {
        if (!value) return true;

        if (key === 'base' && typeof value === 'object') {
            return applyFilters(item, value);
        }

        if (Array.isArray(item[key])) {
            return item[key].includes(value);
        }

        if (typeof item[key] === 'string' && typeof value === 'string') {
            return item[key].toLowerCase().includes(value.toLowerCase());
        }

        return item[key] === value;
    });
};

export const validateContinentCode = (code) => {
    if (typeof code !== 'string') return false;
    return /^[A-Z]{2}$/.test(code);
};

export const validateCountryCode = (code) => {
    if (typeof code !== 'string') return false;
    return /^[A-Z]{2}$/.test(code);
};

export const validateLandmarkName = (name) => {
    if (typeof name !== 'string') return false;
    return name.length >= 2 && name.length <= 100;
};

export const validateCountryData = (country) => {
    const requiredFields = ['name', 'capital', 'code'];
    const missingFields = requiredFields.filter(field => !country[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Brakujące wymagane pola: ${missingFields.join(', ')}`);
    }

    if (!validateCountryCode(country.code)) {
        throw new Error('Nieprawidłowy format kodu kraju (wymagane 2 wielkie litery)');
    }

    if (country.landmarks && !Array.isArray(country.landmarks)) {
        throw new Error('Pole landmarks musi być tablicą');
    }
};

export const validateLandmarkData = (landmark) => {
    const requiredFields = ['name', 'type', 'description'];
    const missingFields = requiredFields.filter(field => !landmark[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Brakujące wymagane pola: ${missingFields.join(', ')}`);
    }

    if (!validateLandmarkName(landmark.name)) {
        throw new Error('Nieprawidłowa nazwa zabytku (wymagane od 2 do 100 znaków)');
    }
};

export const validateExtendedCountryData = (country) => {
    validateCountryData(country.base);

    const details = country.details;
    if (details) {
        if (details.population && isNaN(Number(details.population))) {
            throw new Error('Populacja musi być liczbą');
        }
        if (details.area && isNaN(Number(details.area))) {
            throw new Error('Powierzchnia musi być liczbą');
        }
        if (details.languages && !Array.isArray(details.languages)) {
            throw new Error('Języki muszą być tablicą');
        }
    }
};

export const validateExtendedLandmarkData = (landmark) => {
    validateLandmarkData(landmark.base);

    const details = landmark.details;
    if (details) {
        const validStatuses = ['active', 'under_renovation', 'closed', 'planned'];
        if (details.status && !validStatuses.includes(details.status)) {
            throw new Error('Nieprawidłowy status zabytku');
        }

        if (details.visiting_hours && !validateVisitingHours(details.visiting_hours)) {
            throw new Error('Nieprawidłowy format godzin otwarcia');
        }

        if (details.price_range && !validatePriceRange(details.price_range)) {
            throw new Error('Nieprawidłowy format zakresu cenowego');
        }
    }
};

export const validateVisitingHours = (hours) => {
    if (hours === 'closed') return true;
    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(hours);
};

export const validatePriceRange = (range) => {
    if (range === 'free') return true;
    return /^\d+-\d+$/.test(range);
};

export const sortItems = (items, sort) => {
    if (!sort || !sort.field) return items;
    
    const { field, order = 'ASC' } = sort;
    return [...items].sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];

        if (aValue < bValue) return order === 'ASC' ? -1 : 1;
        if (aValue > bValue) return order === 'ASC' ? 1 : -1;
        return 0;
    });
}; 