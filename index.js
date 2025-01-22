import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { continentResolvers } from "./continentsResolver.js";
import { countryResolvers, extendedCountryResolvers } from "./countriesResolver.js";
import { landmarkResolvers, extendedLandmarkResolvers } from "./landmarksResolver.js";

// Ładowanie definicji proto
const continentPackageDefinition = protoLoader.loadSync("proto/continents.proto");
const countryPackageDefinition = protoLoader.loadSync("proto/countries.proto");
const landmarkPackageDefinition = protoLoader.loadSync("proto/landmarks.proto");

// Ładowanie pakietów
const continentProto = grpc.loadPackageDefinition(continentPackageDefinition);
const countryProto = grpc.loadPackageDefinition(countryPackageDefinition);
const landmarkProto = grpc.loadPackageDefinition(landmarkPackageDefinition);

const server = new grpc.Server();

// Dodawanie podstawowych serwisów
server.addService(continentProto.continents.ContinentService.service, continentResolvers);
server.addService(countryProto.continents.CountryService.service, countryResolvers);
server.addService(landmarkProto.continents.LandmarkService.service, landmarkResolvers);

// Dodawanie rozszerzonych serwisów
server.addService(countryProto.continents.ExtendedCountryService.service, extendedCountryResolvers);
server.addService(landmarkProto.continents.ExtendedLandmarkService.service, extendedLandmarkResolvers);

server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (err) => {
        if (err) {
            console.error('Błąd podczas uruchamiania serwera:', err);
            return;
        }
        server.start();
        console.log('Serwer gRPC uruchomiony na http://127.0.0.1:50051');
    }
);