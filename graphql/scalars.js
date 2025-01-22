import { GraphQLScalarType } from 'graphql';

const CountryCode = new GraphQLScalarType({
    name: 'CountryCode',
    description: 'Kod kraju składający się z 2 wielkich liter (np. PL, DE, FR)',
    parseValue(value) {
        if (typeof value !== 'string' || !/^[A-Z]{2}$/.test(value)) {
            throw new Error('Kod kraju musi składać się z 2 wielkich liter');
        }
        return value;
    },
    serialize(value) {
        return value;
    },
    parseLiteral(ast) {
        if (ast.kind === 'StringValue' && /^[A-Z]{2}$/.test(ast.value)) {
            return ast.value;
        }
        throw new Error('Kod kraju musi składać się z 2 wielkich liter');
    },
});

const Name = new GraphQLScalarType({
    name: 'Name',
    description: 'Nazwa o długości od 2 do 100 znaków',
    parseValue(value) {
        if (typeof value !== 'string' || value.length < 2 || value.length > 100) {
            throw new Error('Nazwa musi mieć od 2 do 100 znaków');
        }
        return value;
    },
    serialize(value) {
        return value;
    },
    parseLiteral(ast) {
        if (ast.kind === 'StringValue' && ast.value.length >= 2 && ast.value.length <= 100) {
            return ast.value;
        }
        throw new Error('Nazwa musi mieć od 2 do 100 znaków');
    },
});

const BigNumber = new GraphQLScalarType({
    name: 'BigNumber',
    description: 'Duża liczba całkowita jako string (np. populacja, powierzchnia)',
    parseValue(value) {
        if (!/^\d+$/.test(value)) {
            throw new Error('Wartość musi być liczbą całkowitą zapisaną jako tekst');
        }
        return value;
    },
    serialize(value) {
        return value;
    },
    parseLiteral(ast) {
        if (ast.kind === 'StringValue' && /^\d+$/.test(ast.value)) {
            return ast.value;
        }
        throw new Error('Wartość musi być liczbą całkowitą zapisaną jako tekst');
    },
});

export { CountryCode, Name, BigNumber }; 