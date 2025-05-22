import { PasswordCredential } from "../util/interface";
import {
  decryptData,
  decryptPasswordCredential,
  encryptPasswordCredential,
  generateOTP,
  generateSecretKey,
  resolveErrorType,
  updateExistingCredential,
} from "../util/helper";
import { encryptData } from "../util/helper";

describe("generateSecretKey", () => {
  it("should return a 64-character hex string", () => {
    const key = generateSecretKey();
    expect(typeof key).toBe("string");
    expect(key).toMatch(/^[a-f0-9]{64}$/i);
  });

  it("should generate a different key on each call", () => {
    const key1 = generateSecretKey();
    const key2 = generateSecretKey();
    expect(key1).not.toEqual(key2);
  });
});

describe("encryptData", () => {
  const secretKey = generateSecretKey();

  it("should throw an error if data is undefined", () => {
    expect(() => encryptData(undefined, secretKey)).toThrow("No data provided for encryption");
  });

  it("should throw an error if data is null", () => {
    expect(() => encryptData(null, secretKey)).toThrow("No data provided for encryption");
  });

  it("should throw an error if data is an empty string", () => {
    expect(() => encryptData("", secretKey)).toThrow("No data provided for encryption");
  });

  it("should return an encrypted string", () => {
    const plainText = "Hello World";
    const encrypted = encryptData(plainText, secretKey);
    expect(typeof encrypted).toBe("string");
    expect(encrypted).not.toEqual(plainText);
    expect(encrypted.length).toBeGreaterThan(0);
  });
});

const secret: string = "test_secret";

test("decryptData should correctly decrypt encrypted string", () => {
  const encrypted = encryptData("myPassword", secret);
  const decrypted = decryptData(encrypted, secret);
  expect(decrypted).toBe("myPassword");
});

test("decryptData should throw error when no data is provided", () => {
  expect(() => decryptData(undefined, secret)).toThrow("No data provided for decryption");
});

test("encryptPasswordCredential should encrypt sensitive fields", () => {
  const credential: PasswordCredential = {
    service: "facebook",
    service_user_id: "rick_sanchez",
    password: "password123",
  };
  const encrypted = encryptPasswordCredential(credential, secret);
  expect(encrypted.password).not.toBe("password123");
  expect(encrypted.service_user_id).not.toBe("rick_sanchez");
});

test("decryptPasswordCredential should decrypt encrypted fields", () => {
  const original: PasswordCredential = {
    service: "facebook",
    service_user_id: "rick_sanchez",
    password: "password123",
  };
  const encrypted = encryptPasswordCredential(original, secret);
  const decrypted = decryptPasswordCredential(encrypted, secret);
  expect(decrypted).toEqual(original);
});

test("resolveErrorType should return 400 for 'missing' or 'invalid'", () => {
  expect(resolveErrorType("missing field")).toBe(400);
  expect(resolveErrorType("invalid input")).toBe(400);
  expect(resolveErrorType("missING credentials")).toBe(400);
  expect(resolveErrorType("invalid password length")).toBe(400);
  expect(resolveErrorType("Invalid token")).toBe(400);
});

test("resolveErrorType should return 500 for other messages", () => {
  expect(resolveErrorType("server crashed")).toBe(500);
});

test("updateExistingCredential updates and encrypts relevant fields", () => {
  const oldCred: PasswordCredential = { service: "facebook", service_user_id: "rick_sanchez", password: "password123" };
  const newCred: PasswordCredential = {
    service: "facebook",
    service_user_id: "rick_sanchez",
    password: "pass000",
    notes: "my old facebook profile",
  };

  const updated = updateExistingCredential(newCred, oldCred, secret);
  expect(Object.keys(updated)).toContain("password");
  expect(Object.keys(updated)).toContain("notes");
  expect(Object.keys(updated)).toContain("service");
  expect(updated.password).not.toBe("pass000");
});

test("generateOTP returns 4-digit number string", () => {
  const otp = generateOTP();
  expect(otp).toHaveLength(4);
  expect(/^\d{4}$/.test(otp)).toBe(true);
});
