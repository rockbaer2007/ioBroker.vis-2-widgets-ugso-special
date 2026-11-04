# UGSo Spezial für ioBroker VIS 2

Erster Teststand mit SVG-Line, SVG LineBox, SVG LineBox Math, Wert-Verbindung, Wert-Konverter und Wert-Berechnung. Die Widgets lesen ioBroker-Datenpunkte. Die Vorschau berechnet und zeigt Ergebnisse lokal an.

## Installation über GitHub

In ioBroker Admin unter **Adapter** den Expertenmodus einschalten und **Von URL installieren** öffnen. Als benutzerdefinierte URL eintragen:

```text
https://github.com/rockbaer2007/ioBroker.vis-2-widgets-ugso-spezial/tarball/v0.1.12
```

Anschließend den VIS-2-Editor neu laden und **UGSo Spezial** in der Widget-Auswahl öffnen.

## Umfang des Teststands

Unter **Darstellung** lassen sich Pfeilspitzen am Anfang und am Ende getrennt einschalten. Die Pfeilgröße ist einstellbar. Die Pfeilspitzen übernehmen die Linienfarbe und liegen über dem bewegten Strichmuster. Bei SVG-Line legt **Animation → Bewegte Farbe** die zweite Farbe für das bewegte Strichmuster fest. Die Länge der bewegten Farbe und die Länge der sichtbaren Grundfarbe dazwischen lassen sich separat einstellen. **Animation → Animation testen** erzwingt die Vorschau im Editor. Ohne Datenpunkt läuft die eingeschaltete Animation vorwärts. Mit Datenpunkt bestimmen dessen Wert und Vorzeichen, ob und in welche Richtung sie läuft.

Wert-Verbindungen sind standardmäßig nur im Editor sichtbar. Unter **Darstellung → In Runtime anzeigen** lässt sich die Linie auch für die Runtime einschalten.

Im rechten Eigenschaftenbereich gibt es Gruppen für Datenquelle, Linienführung, Darstellung, Animation, Konvertierung und Berechnung. Linien unterstützen gerade und rechtwinklige Verläufe mit frei einstellbaren Endpunkten innerhalb des Widgets. Beim Verlauf **Über Zwischenpunkt** kommen zwei Koordinaten für den Knick hinzu. Die Berechnung unterstützt Addition, Subtraktion, Multiplikation und Division. Der Konverter verarbeitet Zahlen, Text und Schaltwerte. Unter **Linienführung** lässt sich ein zweiter Zwischenpunkt mit eigenen X- und Y-Koordinaten einschalten. Widgetübergreifende Weitergabe von Rechenergebnissen und Dashboard-Einbettung sind für einen Folgestand vorgesehen.

Unter **Dockpunkte** lassen sich Start und Ende separat mit einem Widget derselben Seite verbinden. X und Y werden in Prozent der Zielgröße angegeben. 50 % / 50 % liegt in der Mitte. Ein leerer Zieleintrag verwendet den freien Punkt aus **Linienführung**. Grün markiert den Start und Orange das Ende im Editor.
