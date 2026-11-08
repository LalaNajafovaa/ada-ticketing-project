# ADA Hall Theatre - Ticket Selection

project for Web & Mobile I: an interactive front-end ticket selection page for a theatre.

Built with plain HTML, CSS and JavaScript. No backend, no build step.

## Run it

Open `index.html` in a browser. No server is needed.

## Features

- Venue map with 2 zones, 6 sections and 304 seats, generated from data
- 4 price categories: Premium 70 AZN, Standard 55 AZN, Value 40 AZN, Gallery 30 AZN
- Clicking a seat only inspects it and shows section, row, seat, category, price and status
- Four seat states: available, inspected, in cart, unavailable
- ADD TO CART adds the inspected seat; the same seat cannot be added twice; unavailable seats cannot be added
- Cart with item prices, total, remove buttons and a clear button
- Removing a ticket updates the seat on the map immediately
- Cart is saved in localStorage and restored with matching seat states after a refresh
- Zoom In, Zoom Out, Move Up, Move Down, Move Left, Move Right and Reset / Center buttons
- Bonus: mouse wheel zoom and click-drag panning
- Responsive layout for desktop, tablet and phone

## Venue

| Zone | Sections | Rows |
| --- | --- | --- |
| Orchestra | Orchestra Left, Orchestra Right | A-J, 10 seats per row |
| Raised gallery | Gallery Left, Center-Left, Center-Right, Right | K-N, 5 or 8 seats per row |

Rows A-C are Premium, D-G Standard, H-J Value and K-N Gallery. 28 seats are marked unavailable from a fixed list in `venue-data.js`.

## How it works

- `venue-data.js` describes the venue: tiers, sections, zones and unavailable seats
- `app.js` builds a seat object for every seat and draws one `<button>` per seat from that data
- The cart is a single array of seat ids; the map and the cart panel are both drawn from it
- Only seat ids are saved in localStorage; names and prices are rebuilt from the venue data on load
- The map is one element moved and scaled with a CSS transform

## Files

- `index.html` page structure
- `style.css` layout and styling
- `venue-data.js` venue data
- `app.js` seat generation, states, cart, storage and navigation

## Known limitations

- At the default zoom the seats are small on phones, so zoom in to pick a seat
- Seat availability is a fixed list, not live data
