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

    input ContinentInput {
        name: String!
        code: String!
        population: String
        area: String
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

    input ContinentPatchInput {
        name: String
        population: String
        area: String
    }

    input CountryPatchInput {
        name: String
        capital: String
        landmarks: [LandmarkInput]
    }

    input LandmarkPatchInput {
        type: String
        description: String
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
        continents(filter: [FilterInput], sort: SortInput): [Continent]!
        continent(code: String!): ContinentResult!

        countries(filter: [FilterInput], sort: SortInput): [Country]!
        country(code: String!): CountryResult!

        landmarks(countryCode: String, filter: [FilterInput], sort: SortInput): [Landmark]!
        landmark(countryCode: String!, name: String!): LandmarkResult!
    }

    type Mutation {
        createContinent(continentInput: ContinentInput!): Continent!
        updateContinent(code: String!, name: String!, population: String, area: String): Continent!
        patchContinent(code: String!, updates: ContinentPatchInput!): Continent!
        deleteContinent(code: String!): DeleteResponse!

        createCountry(continentCode: String!, countryInput: CountryInput!): Country!
        updateCountry(code: String!, countryInput: CountryInput!): Country!
        patchCountry(code: String!, updates: CountryPatchInput!): Country!
        deleteCountry(code: String!): DeleteResponse!

        addLandmark(countryCode: String!, landmark: LandmarkInput!): Landmark!
        updateLandmark(countryCode: String!, landmarkName: String!, landmark: LandmarkInput!): Landmark!
        patchLandmark(countryCode: String!, landmarkName: String!, updates: LandmarkPatchInput!): Landmark!
        deleteLandmark(countryCode: String!, landmarkName: String!): DeleteResponse!
    }
`;