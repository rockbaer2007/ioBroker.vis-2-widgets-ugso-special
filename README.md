# UGSo Spezial für ioBroker VIS 2

Erster Teststand mit SVG-Line, SVG LineBox, SVG LineBox Math, Wert-Verbindung, Wert-Konverter und Wert-Berechnung. Die Widgets lesen ioBroker-Datenpunkte. Die Vorschau berechnet und zeigt Ergebnisse lokal an.

## Installation über GitHub

In ioBroker Admin unter **Adapter** den Expertenmodus einschalten und **Von URL installieren** öffnen. Als benutzerdefinierte URL eintragen:

```text
https://github.com/rockbaer2007/ioBroker.vis-2-widgets-ugso-spezial/tarball/v0.1.6
```

Anschließend den VIS-2-Editor neu laden und **UGSo Spezial** in der Widget-Auswahl öffnen.

## Umfang des Teststands

Unter **Darstellung** lassen sich Pfeilspitzen am Anfang und am Ende getrennt einschalten. Sie übernehmen die Linienfarbe.

Wert-Verbindungen sind standardmäßig nur im Editor sichtbar. Unter **Darstellung → In Runtime anzeigen** lässt sich die Linie auch für die Runtime einschalten.

Im rechten Eigenschaftenbereich gibt es Gruppen für Datenquelle, Linienführung, Darstellung, Animation, Konvertierung und Berechnung. Linien unterstützen gerade und rechtwinklige Verläufe mit frei einstellbaren Endpunkten innerhalb des Widgets. Beim Verlauf **Über Zwischenpunkt** kommen zwei Koordinaten für den Knick hinzu. Die Berechnung unterstützt Addition, Subtraktion, Multiplikation und Division. Der Konverter verarbeitet Zahlen, Text und Schaltwerte. Unter **Linienführung** lässt sich ein zweiter Zwischenpunkt mit eigenen X- und Y-Koordinaten einschalten. Andockpunkte, widgetübergreifende Weitergabe von Rechenergebnissen und Dashboard-Einbettung sind für einen Folgestand vorgesehen.
