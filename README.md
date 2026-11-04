# UGSo Spezial für ioBroker VIS 2

In der Widget-Auswahl stehen **SVG-Line** und **SVG LineBox** zur Verfügung. Beide können ioBroker-Datenpunkte lesen. Berechnungen, Konvertierungen und Wertübergaben können in Blockly erfolgen; das Ergebnis wird über einen Datenpunkt angezeigt.

Die früheren Widgets SVG LineBox Math, Wert-Verbindung, Wert-Konverter und Wert-Berechnung bleiben für bestehende Projekte verfügbar und werden in der Widget-Auswahl ausgeblendet.

## Installation über GitHub

In ioBroker Admin unter **Adapter** den Expertenmodus einschalten und **Von URL installieren** öffnen. Als benutzerdefinierte URL eintragen:

```text
https://github.com/rockbaer2007/ioBroker.vis-2-widgets-ugso-spezial/tarball/v0.1.17
```

Anschließend den VIS-2-Editor neu laden und **UGSo Spezial** in der Widget-Auswahl öffnen.

## Umfang des Teststands

Unter **Darstellung** lassen sich Pfeilspitzen am Anfang und am Ende getrennt einschalten. Die Pfeilgröße ist einstellbar. Die Pfeilspitzen übernehmen die Linienfarbe und liegen über dem bewegten Strichmuster. Bei SVG-Line legt **Animation → Bewegte Farbe** die zweite Farbe für das bewegte Strichmuster fest. Die Länge der bewegten Farbe und die Länge der sichtbaren Grundfarbe dazwischen lassen sich separat einstellen. **Animation → Animation testen** erzwingt die Vorschau im Editor. Ohne Datenpunkt läuft die eingeschaltete Animation vorwärts. Mit Datenpunkt bestimmen dessen Wert und Vorzeichen, ob und in welche Richtung sie läuft.

Wert-Verbindungen sind standardmäßig nur im Editor sichtbar. Unter **Darstellung → In Runtime anzeigen** lässt sich die Linie auch für die Runtime einschalten.

Linien unterstützen gerade und rechtwinklige Verläufe mit frei einstellbaren Endpunkten innerhalb des Widgets. Beim Verlauf **Über Zwischenpunkt** lässt sich ein zweiter Zwischenpunkt mit eigenen X- und Y-Koordinaten einschalten.

Wähle die Linie im Editor aus und ziehe einen gelben Ring am Start oder Ende auf oder nahe an ein Widget derselben Seite. Der Punkt rastet ein und folgt dem Widget. Ziehe den Ring auf eine freie Stelle innerhalb des Linienwidgets, um ihn zu lösen. Bei anderen UGSo-Linien rastet der Ring am Start, am Ende oder an einem roten Zwischenpunkt ein. Der Anschluss folgt dem Zwischenpunkt, wenn du dessen Koordinaten änderst. In der Runtime sind die Ringe und roten Markierungen ausgeblendet.
