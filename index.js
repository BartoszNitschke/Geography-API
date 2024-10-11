import express from "express";
import { faker } from "@faker-js/faker";

const app = new express();

app.get("/", (req, res) => {
  faker.seed(1);
  const random = faker.person.fullName();
  res.send(random);
});

app.listen(8989, () => {
  console.log("Started on 8989");
});
