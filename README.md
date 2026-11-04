# ioBroker.vis-2-widgets-ugso-spezial

UGSo Spezial adds animated SVG lines and summing nodes to ioBroker VIS 2. [German documentation](README.de.md)

## Installation

For testing, enable expert mode in ioBroker Admin and select **Install from URL** on the Adapters page. Enter the [version 0.1.30 archive URL](https://github.com/rockbaer2007/ioBroker.vis-2-widgets-ugso-spezial/tarball/v0.1.30) as a custom URL. Reload the VIS 2 editor and open **UGSo Spezial** in the widget palette.

## Widgets

- **SVG-Line** reads an ioBroker state and draws a straight, right-angle or waypoint route. Configure the arrowheads, colours, dash lengths and cycle duration. A positive value animates forward, a negative value reverses direction and zero stops the animation. Speed can be fixed or proportional to the absolute input value.
- **SVG LineBox** is a circular node. Select up to four input lines and two output lines. The node sums the input values and an optional correction state, then passes the total to the output lines. It can also write the total in the VIS runtime to an existing writable numeric state under `0_userdata.0`. A missing selected input blocks the total until it becomes available.

In the editor, drag a yellow endpoint handle to snap a line to a node or another line. A line with an arrowhead cannot use that endpoint for visual docking. LineBox input and output selection controls value routing independently of docking.

## Changelog

### 0.1.30

- Prepare adapter metadata and automated VIS 2 installation tests for the ioBroker catalogue.
- Restart VIS 2 after installing widget updates so it picks up the new bundle.

### 0.1.29

- Add the set icon and improve palette label contrast.

## License

MIT License. See [LICENSE](LICENSE).

Copyright (c) 2026 UGSo-Software <51380789+rockbaer2007@users.noreply.github.com>
