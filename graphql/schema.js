export const typeDefs = `#graphql
    scalar CountryCode
    scalar Name
    scalar BigNumber

    type Landmark {
        name: Name!
        type: String!
        description: String!
    }

    type Country {
        name: Name!
        capital: String!
        code: CountryCode!
        landmarks: [Landmark]!
    }

    type Continent {
        name: Name!
        code: CountryCode!
        countries: [Country]!
        population: BigNumber
        area: BigNumber
    }

    input LandmarkInput {
        name: String!
        type: String!
        description: String!
    }

    input CountryInput {
        name: String!
        capital: String!
        code: String!
        landmarks: [LandmarkInput]
    }

    input FilterInput {
        field: String!
        operation: String!
        value: String!
    }

    input SortInput {
        field: String!
        order: String!
    }

    type DeleteResponse {
        success: Boolean!
        message: String
        code: String!
    }

    type ErrorResponse {
        message: String!
        errorCode: String!
    }

    union ContinentResult = Continent | ErrorResponse
    union CountryResult = Country | ErrorResponse
    union LandmarkResult = Landmark | ErrorResponse

    type Query {
        # Zapytania dla kontynentów
        continents(filter: [FilterInput], sort: SortInput): [Continent]!
        continent(code: String!): ContinentResult!

        # Zapytania dla krajów
        countries(filter: [FilterInput], sort: SortInput): [Country]!
        country(code: String!): CountryResult!

        # Zapytania dla zabytków
        landmarks(countryCode: String, filter: [FilterInput], sort: SortInput): [Landmark]!
    }

    type Mutation {
        # Mutacje dla krajów
        createCountry(continentCode: String!, countryInput: CountryInput!): Country!
        updateCountry(code: String!, countryInput: CountryInput!): Country!
        deleteCountry(code: String!): DeleteResponse!

        # Mutacje dla zabytków
        addLandmark(countryCode: String!, landmark: LandmarkInput!): Landmark!
        updateLandmark(countryCode: String!, landmarkName: String!, landmark: LandmarkInput!): Landmark!
        deleteLandmark(countryCode: String!, landmarkName: String!): DeleteResponse!

        # Mutacje dla kontynentów
        updateContinent(code: String!, name: String!, population: String, area: String): Continent!
        deleteContinent(code: String!): DeleteResponse!
    }
`;