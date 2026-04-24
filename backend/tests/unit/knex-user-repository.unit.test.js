const { KnexUserRepository } = require("../../dist/infrastructure/database/repositories/KnexUserRepository");

describe("KnexUserRepository", () => {
  test("keeps object attributes and preserves birth dates from MySQL date values", () => {
    const repository = new KnexUserRepository({});

    const user = repository.mapToEntity({
      id: "user-1",
      google_id: "google-1",
      email: "user-1@example.com",
      display_name: "User One",
      trust_score: 50,
      attributes: {
        joinedAt: "",
        notifyEmail: true
      },
      personal_gender: "nam",
      personal_birth_date: new Date("2003-12-01T17:00:00.000Z")
    });

    expect(user.attributes).toEqual({
      joinedAt: "",
      notifyEmail: true
    });
    expect(user.personalDetail).toEqual({
      gender: "nam",
      birthDate: "2003-12-02"
    });
  });

  test("parses JSON string attributes when the driver returns text", () => {
    const repository = new KnexUserRepository({});

    const user = repository.mapToEntity({
      id: "user-2",
      google_id: null,
      email: "user-2@example.com",
      display_name: "User Two",
      trust_score: 50,
      attributes: "{\"joinedAt\":\"2026-04-24\",\"showOnline\":false}",
      personal_gender: null,
      personal_birth_date: null
    });

    expect(user.attributes).toEqual({
      joinedAt: "2026-04-24",
      showOnline: false
    });
  });
});
