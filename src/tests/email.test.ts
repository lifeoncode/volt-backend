import { sendEmail } from "../util/helper";
import nodemailer from "nodemailer";

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ response: "250 OK" }),
  }),
}));

test("sendEmail should return true on success", async () => {
  const result = await sendEmail("test@example.com", "1234");
  expect(result).toBe(true);
});

test("sendEmail should return false on failure", async () => {
  (nodemailer.createTransport as jest.Mock).mockReturnValueOnce({
    sendMail: jest.fn().mockRejectedValue(new Error("failed")),
  });

  const result = await sendEmail("test@example.com", "1234");
  expect(result).toBe(false);
});
