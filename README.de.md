# UGSo Special für ioBroker VIS 2

Das npm-Paket heißt jetzt `iobroker.vis-2-widgets-ugso-special`.
Exportiere vorhandene VIS-2-Projekte vor dem Paketwechsel als Sicherung.
Installiere das neue Paket, starte VIS 2 neu und prüfe das Projekt,
bevor du das bisherige Paket entfernst. Die Widget-Template-IDs und der interne
Federationsname bleiben für vorhandene Projekte erhalten.

In der Widget-Auswahl stehen **SVG-Line** und **SVG LineBox** zur Verfügung. SVG-Line liest einen ioBroker-Datenpunkt. SVG LineBox ist ein runder Dockpunkt mit einstellbarem Durchmesser in Pixeln.

Wähle die Linien in der LineBox unter **Ein- und Ausgänge** aus. Die Auswahl steuert die Wertübergabe auch bei Linien mit Pfeil. Das Andocken dient der Positionierung. Bis zu vier Eingangslinien liefern Zahlenwerte. Ein optionaler numerischer **Korrekturwert** wird addiert, negative Werte werden entsprechend abgezogen. Die Summe erscheint im Tooltip. Bis zu zwei Ausgangslinien übernehmen dieselbe Summe. Bei eingeschalteter Animation läuft sie bei positiven Werten vorwärts, bei negativen rückwärts und stoppt bei null oder fehlender Summe. Bestehende LineBoxen brauchen eine Auswahl ihrer Eingänge.

Als **Summen-Datenpunkt** kannst du einen vorhandenen, beschreibbaren Zahlendatenpunkt unter `0_userdata.0` auswählen. Die VIS-Runtime schreibt die Summe dorthin. Wähle für die Korrektur und für den Ausgang verschiedene Datenpunkte. Fehlt ein gewählter Eingangswert, wird keine Teilsumme ausgegeben.

Seit 0.1.18 enthält das Paket nur diese beiden Widgets. Ersetze die vier früheren Widget-Typen in vorhandenen Projekten vor dem Update oder verwende für diese Projekte weiter 0.1.17.

Die freie X-Position des Linienendes reicht bei **Gerade** und **Senkrecht, dann waagerecht** bis 100 %, bei anderen Verläufen bis 95 %. Unter **Animation → Animationsgeschwindigkeit** stehen **Fest** und **Nach Eingangswert** zur Auswahl. Bei **Fest** gilt die eingestellte Zyklusdauer. Bei **Nach Eingangswert** steuert der Betrag des Datenwerts das Tempo. Beim Referenzwert (standardmäßig 50) gilt die eingestellte Zyklusdauer. Die Zyklusdauer bleibt zwischen 0,2 und 20 Sekunden.

## Installation über GitHub

In ioBroker Admin unter **Adapter** den Expertenmodus einschalten und **Von URL installieren** öffnen. Als benutzerdefinierte URL eintragen:

```text
https://github.com/rockbaer2007/ioBroker.vis-2-widgets-ugso-special/tarball/v0.1.32
```

Anschließend den VIS-2-Editor neu laden und **UGSo Special** in der Widget-Auswahl öffnen.

## Umfang des Teststands

Unter **Darstellung** lassen sich Pfeilspitzen am Anfang und am Ende getrennt einschalten. Die Pfeilgröße ist einstellbar. Die Pfeilspitzen übernehmen die Linienfarbe und liegen über dem bewegten Strichmuster. Bei SVG-Line legt **Animation → Bewegte Farbe** die zweite Farbe für das bewegte Strichmuster fest. Die Länge der bewegten Farbe und die Länge der sichtbaren Grundfarbe dazwischen lassen sich separat einstellen. **Animation → Animation testen** erzwingt die Vorschau im Editor. Ohne Datenpunkt läuft die eingeschaltete Animation vorwärts. Mit Datenpunkt bestimmen dessen Wert und Vorzeichen, ob und in welche Richtung sie läuft.

Die Pfeilspitze sitzt am Linienendpunkt. Der Strich und die Animation enden an der Basis des Pfeils. Das Ende ist dann als Dockpunkt deaktiviert. Eine gespeicherte Verbindung wird beim Abschalten des Pfeils wieder aktiv.

Linien unterstützen gerade und rechtwinklige Verläufe mit frei einstellbaren Endpunkten innerhalb des Widgets. Beim Verlauf **Über Zwischenpunkt** lässt sich ein zweiter Zwischenpunkt mit eigenen X- und Y-Koordinaten einschalten.

Wähle die Linie im Editor aus und ziehe einen gelben Ring am Start oder Ende auf oder nahe an ein Widget derselben Seite. Der Punkt rastet ein und folgt dem Widget. Ziehe den Ring auf eine freie Stelle innerhalb des Linienwidgets, um ihn zu lösen. Bei anderen UGSo-Linien rastet der Ring am Start, am Ende oder an einem roten Zwischenpunkt ein. Der Anschluss folgt dem Zwischenpunkt, wenn du dessen Koordinaten änderst. In der Runtime sind die Ringe und roten Markierungen ausgeblendet.
