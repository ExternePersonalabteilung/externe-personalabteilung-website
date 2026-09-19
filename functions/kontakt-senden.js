import { connect } from "cloudflare:sockets";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const telefon = formData.get("telefon") || "";
    const anliegen = formData.get("anliegen") || "";
    const nachricht = formData.get("nachricht") || "";

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let socket = connect(
      {
        hostname: env.SMTP_HOST,
        port: Number(env.SMTP_PORT || 587),
      },
      {
        secureTransport: "starttls",
      }
    );

    await socket.opened;

    let reader = socket.readable.getReader();
    let writer = socket.writable.getWriter();

    async function readResponse() {
      const { value } = await reader.read();

      if (!value) {
        throw new Error("Keine Antwort vom SMTP-Server.");
      }

      return decoder.decode(value);
    }

    async function send(command) {
      await writer.write(
        encoder.encode(command + "\r\n")
      );

      return await readResponse();
    }

    // Begrüßung des SMTP-Servers
    await readResponse();

    // Verbindung anmelden
    await send("EHLO externe-personalabteilung.de");

    // STARTTLS anfordern
    const tlsResponse = await send("STARTTLS");

    if (!tlsResponse.startsWith("220")) {
      throw new Error("STARTTLS wurde vom SMTP-Server nicht akzeptiert.");
    }

    // Alte Stream-Locks lösen
    reader.releaseLock();
    writer.releaseLock();

    // Verbindung auf TLS hochstufen
    socket = socket.startTls();

    await socket.opened;

    reader = socket.readable.getReader();
    writer = socket.writable.getWriter();

    // Nach STARTTLS erneut EHLO senden
    await send("EHLO externe-personalabteilung.de");

    // Anmeldung
    await send("AUTH LOGIN");
    await send(btoa(env.SMTP_USER));
    await send(btoa(env.SMTP_PASSWORD));

    // Absender / Empfänger
    await send(`MAIL FROM:<${env.SMTP_USER}>`);
    await send(`RCPT TO:<${env.SMTP_USER}>`);
    await send("DATA");

    const subject = `Kontaktanfrage Website – ${anliegen || "Allgemein"}`;

    const mailText =
`From: Website <${env.SMTP_USER}>
To: ${env.SMTP_USER}
Reply-To: ${email}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Neue Kontaktanfrage über externe-personalabteilung.de

Name: ${name}
E-Mail: ${email}
Telefon: ${telefon}
Anliegen: ${anliegen}

Nachricht:
${nachricht}

`;

    await writer.write(
      encoder.encode(mailText + "\r\n.\r\n")
    );

    const dataResponse = await readResponse();

    if (!dataResponse.startsWith("250")) {
      throw new Error(
        "Der SMTP-Server hat die Nachricht nicht angenommen: " +
        dataResponse
      );
    }

    await send("QUIT");

    writer.releaseLock();
    reader.releaseLock();

    await socket.close();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Nachricht wurde erfolgreich gesendet.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Die Nachricht konnte nicht gesendet werden.",
        error: String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
  }
}