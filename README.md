# BrewBarista — Café Management Website

BrewBarista is a front-end café website project built with HTML, CSS, and JavaScript. This repository preserves the original multi-page project and its brown-and-cream café styling.

## Pages

- `index.html` — home page and customer/café-owner entry points
- `login.html` — login form interface
- `customer.html` — customer table-booking form
- `owner.html` — café-owner registration form
- `Aboutus.html` — About Us page (content is still a placeholder)
- `Invest.html` — Investor Relations page (content is still a placeholder)
- `brew.html` — alternate landing page

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript

## Run locally

1. Download or clone this repository.
2. Keep the HTML, CSS, JavaScript, and image files together in the same folder.
3. Open `index.html` in a browser.

No build step is required. The landing page loads Google Fonts over the internet; the rest of the front end is served from local files.

## Current scope and limitations

This is currently a front-end prototype. The forms perform basic validation and show confirmation messages, but they do **not** save bookings or registrations to a database. The login page does not authenticate real users. Real login, persistent booking/registration storage, and security require a backend and can be added later.

## Project status

The original page structure and visual style have been retained. Current small improvements include browser-required form fields, better PIN-code input handling, and removal of a click alert that interrupted role-button navigation. Future features can be added incrementally without redesigning the project.
