# ADA Hall Theatre - Ticket Selection

Student project for Web & Mobile I: an interactive front-end ticket selection page for a theatre.

Built with plain HTML, CSS and JavaScript. No backend.

## Venue

An auditorium with a stage, two side entrances and 304 seats:

| Zone | Sections | Rows |
| --- | --- | --- |
| Orchestra | Orchestra Left, Orchestra Right | A-J, 10 seats per row |
| Raised gallery | Gallery Left, Center-Left, Center-Right, Right | K-N, 5 or 8 seats per row |

## Price categories

| Category | Rows | Price |
| --- | --- | --- |
| Premium | A-C | 70 AZN |
| Standard | D-G | 55 AZN |
| Value | H-J | 40 AZN |
| Gallery | K-N | 30 AZN |

## Data model

`venue-data.js` holds the whole venue as data: price tiers, sections (with their rows and seats per row), how sections are arranged in zones, and a fixed list of unavailable seats. Seat ids look like `ORL-C5` (section, row, seat number).

## Plan

- Pick a seat on the map, inspect its details and price, then add it to the cart
- Zoom and move controls for the map
- Cart is saved in localStorage
