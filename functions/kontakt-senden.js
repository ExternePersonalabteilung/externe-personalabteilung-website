import { connect } from "cloudflare:sockets";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const telefon = formData.get("telefon") || "";
    const nachricht = formData.get("nachricht") || "";

    const socket = connect(
      {
        hostname: env.SMTP_HOST,
        port: Number(env.SMTP_PORT || 465),
      },
      {
        secureTransport: "on",
      }
    );

    await socket.opened;

    const reader = socket.readable.getReader();
    const writer = socket.writable.getWriter();

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    async function readResponse() {
      const { value } = await reader.read();
      return value ? decoder.decode(value) : "";
    }

    async function send(command) {
      await writer.write(encoder.encode(command + "\r\n"));
      return await readResponse();
    }

    await readResponse();

    await send("EHLO externe-personalabteilung.de");

    await send("AUTH LOGIN");
    await send(btoa(env.SMTP_USER));
    await send(btoa(env.SMTP_PASSWORD));

    await send(`MAIL FROM:<${env.SMTP_USER}>`);
    await send(`RCPT TO:<${env.SMTP_USER}>`);
    await send("DATA");

    const mailText =
`From: Website <${env.SMTP_USER}>
To: ${env.SMTP_USER}
Reply-To: ${email}
Subject: Neue Kontaktanfrage über externe-personalabteilung.de
Content-Type: text/plain; charset=UTF-8

Neue Kontaktanfrage

Name: ${name}
E-Mail: ${email}
Telefon: ${telefon}

Nachricht:
${nachricht}
`;

    await writer.write(encoder.encode(mailText + "\r\n.\r\n"));

    await readResponse();

    await send("QUIT");

    await writer.close();
    reader.releaseLock();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Nachricht wurde erfolgreich gesendet."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Die Nachricht konnte nicht gesendet werden.",
        error: String(error)
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        }
      }
    );
  }
}