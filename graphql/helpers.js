export const applyFilters = (item, filters) => {
    for (const { field, operation, value } of filters) {
        const itemValue = item[field];

        // Konwersja wartości na odpowiedni typ
        let compareValue = value;
        let compareItemValue = itemValue;

        // Konwersja wartości numerycznych
        if (field === 'population' || field === 'area') {
            compareValue = parseFloat(value);
            compareItemValue = parseFloat(itemValue);
        }

        switch (operation) {
            case "EQUAL":
                if (compareItemValue !== compareValue) return false;
                break;
            case "NOT_EQUAL":
                if (compareItemValue === compareValue) return false;
                break;
            case "CONTAINS":
                if (!String(itemValue).toLowerCase().includes(String(value).toLowerCase())) return false;
                break;
            case "NOT_CONTAINS":
                if (String(itemValue).toLowerCase().includes(String(value).toLowerCase())) return false;
                break;
            case "GREATER":
                if (compareItemValue <= compareValue) return false;
                break;
            case "GREATER_OR_EQUAL":
                if (compareItemValue < compareValue) return false;
                break;
            case "LESS":
                if (compareItemValue >= compareValue) return false;
                break;
            case "LESS_OR_EQUAL":
                if (compareItemValue > compareValue) return false;
                break;
            case "STARTS_WITH":
                if (!String(itemValue).toLowerCase().startsWith(String(value).toLowerCase())) return false;
                break;
            case "ENDS_WITH":
                if (!String(itemValue).toLowerCase().endsWith(String(value).toLowerCase())) return false;
                break;
            default:
                throw new Error(`Nieobsługiwana operacja filtrowania: ${operation}`);
        }
    }
    return true;
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