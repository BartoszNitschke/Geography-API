import express, {Request, Response} from "express";
import { faker } from "@faker-js/faker";

const app = express();

app.get("/", (req: Request, res: Response) => {
  faker.seed(1);
  const random = faker.person.fullName();
  res.send(random);
});

app.listen(8989, () => {
  console.log("Started on 8989");
});
