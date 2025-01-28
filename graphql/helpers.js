export const applyFilters = (item, filters) => {
    return filters.every(filter => {
        const { field, operation, value } = filter;
        const itemValue = String(item[field]);

        switch (operation) {
            case 'EQ':
                return itemValue === value;
            case 'CONTAINS':
                return itemValue.includes(value);
            case 'NOT_CONTAINS':
                return !itemValue.includes(value);
            case 'GT':
                return parseFloat(itemValue) > parseFloat(value);
            case 'LT':
                return parseFloat(itemValue) < parseFloat(value);
            default:
                return true;
        }
    });
};

export const validateContinentCode = (code) => {
    return /^[A-Z]{2}$/.test(code);
};

export const validateCountryCode = (code) => {
    return /^[A-Z]{2}$/.test(code);
};

export const validateLandmarkName = (name) => {
    return name && name.length >= 2 && name.length <= 100;
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
    if (!validateLandmarkName(landmark.name)) {
        throw new Error("Nieprawidłowa nazwa zabytku");
    }
    if (!landmark.type || landmark.type.length < 2) {
        throw new Error("Nieprawidłowy typ zabytku");
    }
    if (!landmark.description || landmark.description.length < 10) {
        throw new Error("Nieprawidłowy opis zabytku");
    }
};