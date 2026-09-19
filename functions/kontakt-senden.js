import { connect } from "cloudflare:sockets";

export async function onRequestPost(context) {
  const { request, env } = context;

  let socket;

  try {
    // Formular einlesen
    const formData = await request.formData();

    const name = clean(formData.get("name"));
    const email = clean(formData.get("email"));
    const telefon = clean(formData.get("telefon"));
    const anliegen = clean(formData.get("anliegen"));
    const nachricht = cleanMultiline(formData.get("nachricht"));

    // Kleine Plausibilitätsprüfung
    if (!name || !email || !nachricht) {
      return jsonResponse(
        false,
        "Bitte füllen Sie alle Pflichtfelder aus.",
        400
      );
    }

    if (!isValidEmail(email)) {
      return jsonResponse(
        false,
        "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        400
      );
    }

    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
      throw new Error("SMTP-Konfiguration ist unvollständig.");
    }

    // Direkte SSL/TLS-Verbindung auf Port 465
    socket = connect(
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

    // SMTP-Antwort vollständig lesen
    async function readResponse() {
      let response = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        response += decoder.decode(value, { stream: true });

        const lines = response
          .split(/\r?\n/)
          .filter((line) => line.length > 0);

        if (
          lines.length &&
          /^\d{3} /.test(lines[lines.length - 1])
        ) {
          break;
        }
      }

      return response;
    }

    async function send(command, expectedCodes = []) {
      await writer.write(
        encoder.encode(command + "\r\n")
      );

      const response = await readResponse();

      if (expectedCodes.length) {
        const code = response.substring(0, 3);

        if (!expectedCodes.includes(code)) {
          throw new Error(
            `SMTP-Fehler nach "${command.split(" ")[0]}": ${response}`
          );
        }
      }

      return response;
    }

    // Begrüßung
    const greeting = await readResponse();

    if (!greeting.startsWith("220")) {
      throw new Error(
        "SMTP-Server hat die Verbindung nicht korrekt angenommen: " +
          greeting
      );
    }

    // SMTP starten
    await send(
      "EHLO externe-personalabteilung.de",
      ["250"]
    );

    // Anmeldung
    await send("AUTH LOGIN", ["334"]);
    await send(toBase64(env.SMTP_USER), ["334"]);
    await send(toBase64(env.SMTP_PASSWORD), ["235"]);

    // Absender und Empfänger
    await send(
      `MAIL FROM:<${env.SMTP_USER}>`,
      ["250"]
    );

    await send(
      `RCPT TO:<${env.SMTP_USER}>`,
      ["250", "251"]
    );

    await send("DATA", ["354"]);

    // E-Mail-Inhalt
    const mailBody = [
      `From: Website <${env.SMTP_USER}>`,
      `To: ${env.SMTP_USER}`,
      `Reply-To: ${email}`,
      `Subject: Neue Kontaktanfrage ueber externe-personalabteilung.de`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      `Neue Kontaktanfrage über externe-personalabteilung.de`,
      ``,
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Telefon: ${telefon || "-"}`,
      `Anliegen: ${anliegen || "-"}`,
      ``,
      `Nachricht:`,
      `${nachricht}`,
      ``,
      `---`,
      `Diese Nachricht wurde über das Kontaktformular der Website gesendet.`,
      ``
    ].join("\r\n");

    // Punkte am Zeilenanfang für SMTP maskieren
    const safeMailBody = mailBody.replace(
      /(^|\r\n)\./g,
      "$1.."
    );

    await writer.write(
      encoder.encode(safeMailBody + "\r\n.\r\n")
    );

    const sendResult = await readResponse();

    if (!sendResult.startsWith("250")) {
      throw new Error(
        "Der Mailserver hat die Nachricht nicht angenommen: " +
          sendResult
      );
    }

    // Verbindung sauber beenden
    await send("QUIT", ["221"]);

    writer.releaseLock();
    reader.releaseLock();

    await socket.close();

    return jsonResponse(
      true,
      "Vielen Dank! Ihre Nachricht ist angekommen. Ich melde mich in Kürze.",
      200
    );

  } catch (error) {
    try {
      if (socket) {
        await socket.close();
      }
    } catch (_) {}

    return new Response(
      JSON.stringify({
        success: false,
        message:
          "Die Nachricht konnte gerade nicht gesendet werden.",
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


// Hilfsfunktionen

function clean(value) {
  return String(value || "")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function cleanMultiline(value) {
  return String(value || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(String(value));
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function jsonResponse(success, message, status) {
  return new Response(
    JSON.stringify({
      success,
      message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );
}