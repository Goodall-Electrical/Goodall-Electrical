import { describe, it, expect, vi } from "vitest";
import { createEmailSender, type Mailer } from "../../src/lib/email";

describe("createEmailSender", () => {
  it("sends an email through the provided mailer", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "abc" });
    const mailer: Mailer = { sendMail };
    const send = createEmailSender({
      mailer,
      from: "no-reply@goodall.example",
      to: "office@goodall.example",
    });
    await send({ subject: "Hello", text: "Body" });
    expect(sendMail).toHaveBeenCalledWith({
      from: "no-reply@goodall.example",
      to: "office@goodall.example",
      subject: "Hello",
      text: "Body",
    });
  });

  it("supports html bodies", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "abc" });
    const send = createEmailSender({
      mailer: { sendMail },
      from: "no-reply@goodall.example",
      to: "office@goodall.example",
    });
    await send({ subject: "Hi", text: "plain", html: "<b>plain</b>" });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ html: "<b>plain</b>" }));
  });

  it("rejects when the mailer rejects", async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error("smtp down"));
    const send = createEmailSender({
      mailer: { sendMail },
      from: "a@x",
      to: "b@x",
    });
    await expect(send({ subject: "x", text: "y" })).rejects.toThrow("smtp down");
  });
});
