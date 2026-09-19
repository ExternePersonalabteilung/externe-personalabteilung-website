<?php
/* Nimmt das Kontaktformular entgegen und sendet es an das Titan-Postfach.
   Liegt neben kontakt.html im Web-Verzeichnis. Läuft auf Domain Factory ohne
   weitere Einrichtung. Empfängeradresse in der nächsten Zeile anpassbar. */
$empfaenger = 'info@externe-personalabteilung.de';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'fehler' => 'Nur POST erlaubt.']);
  exit;
}

/* Honeypot: Von Menschen bleibt dieses Feld leer, Spam-Skripte füllen es aus. */
if (!empty($_POST['website'])) {
  echo json_encode(['ok' => true]);
  exit;
}

function feld($name, $max = 2000) {
  $v = isset($_POST[$name]) ? trim((string) $_POST[$name]) : '';
  $v = str_replace(["\r", "\0"], '', $v);
  return mb_substr($v, 0, $max);
}

$name     = feld('name', 120);
$email    = feld('email', 160);
$telefon  = feld('telefon', 60);
$anliegen = feld('anliegen', 120);
$text     = feld('nachricht', 5000);

if ($name === '' || $text === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'fehler' => 'Bitte Name, gültige E-Mail-Adresse und Nachricht angeben.']);
  exit;
}

/* Kopfzeilen-Einschleusung verhindern: Zeilenumbrüche sind oben entfernt. */
$betreff = '=?UTF-8?B?' . base64_encode('Kontaktanfrage: ' . $anliegen . ' – ' . $name) . '?=';

$koerper = "Neue Nachricht über das Kontaktformular\n\n"
  . "Name: $name\n"
  . "E-Mail: $email\n"
  . ($telefon !== '' ? "Telefon: $telefon\n" : '')
  . "Anliegen: $anliegen\n"
  . "Gesendet: " . date('d.m.Y H:i') . "\n\n"
  . "Nachricht:\n$text\n";

$kopf = [
  'From: Kontaktformular <' . $empfaenger . '>',
  'Reply-To: ' . $email,
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
  'MIME-Version: 1.0',
];

$gesendet = @mail($empfaenger, $betreff, $koerper, implode("\r\n", $kopf), '-f' . $empfaenger);

if ($gesendet) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'fehler' => 'Versand fehlgeschlagen.']);
}
