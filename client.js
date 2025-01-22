import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";


const continentPackageDefinition = protoLoader.loadSync("proto/continents.proto");
const countryPackageDefinition = protoLoader.loadSync("proto/countries.proto");
const landmarkPackageDefinition = protoLoader.loadSync("proto/landmarks.proto");

const continentProto = grpc.loadPackageDefinition(continentPackageDefinition);
const countryProto = grpc.loadPackageDefinition(countryPackageDefinition);
const landmarkProto = grpc.loadPackageDefinition(landmarkPackageDefinition);

const clientContinent = new continentProto.continents.ContinentService(
    "127.0.0.1:50051",
    grpc.ChannelCredentials.createInsecure(),
    (err) => err && console.error('Błąd połączenia z serwisem kontynentów:', err)
);

const clientCountry = new countryProto.continents.CountryService(
    "127.0.0.1:50051",
    grpc.ChannelCredentials.createInsecure(),
    (err) => err && console.error('Błąd połączenia z serwisem krajów:', err)
);

const clientLandmark = new landmarkProto.continents.LandmarkService(
    "127.0.0.1:50051",
    grpc.ChannelCredentials.createInsecure(),
    (err) => err && console.error('Błąd połączenia z serwisem zabytków:', err)
);

const clientExtendedCountry = new countryProto.continents.ExtendedCountryService(
    "127.0.0.1:50051",
    grpc.ChannelCredentials.createInsecure(),
    (err) => err && console.error('Błąd połączenia z rozszerzonym serwisem krajów:', err)
);

const clientExtendedLandmark = new landmarkProto.continents.ExtendedLandmarkService(
    "127.0.0.1:50051",
    grpc.ChannelCredentials.createInsecure(),
    (err) => err && console.error('Błąd połączenia z rozszerzonym serwisem zabytków:', err)
);

export { 
    clientContinent, 
    clientCountry, 
    clientLandmark,
    clientExtendedCountry,
    clientExtendedLandmark 
};