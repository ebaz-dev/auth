import request from "supertest";
import { app } from "../../app";

it("clears the cookie after signing out", async () => {
  await request(app)
    .post(`${global.apiPrefix}/signup`)
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  const response = await request(app)
    .post(`${global.apiPrefix}/signout`)
    .send({})
    .expect(200);

  const cookie = response.get("Set-Cookie")?.[0] ?? "";

  expect(cookie).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});