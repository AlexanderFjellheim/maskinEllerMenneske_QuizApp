# Maskin eller Menneske 

## This is an archive of the codebase and assets used to create the "Maskin eller Menneske" technology-exhibit displayed at the University Museum of Bergen from June to December 2024.

### Read more about the project: https://teklab.uib.no/artikler/maskin-eller-menneske/

#### My role in this project was to develop and find technical solutions to create an interactive experience per given specifications and prototypes from UIB MIX250 students group: 

<ul>
    <li>Tobias Strand</li>
    <li>Åshild Løvstakken</li>
    <li>Julie Sophie Teilstad Østby</li>
    <li>Kjersi Hereid Rasmussen</li>
    <li>Katrine Gaarden Sundsbak</li>
</ul>

**The final result** is a single-page-application written in vanilla javascript deployed to a Raspberry PI running chromium in kiosk-mode and a simple Flask server to control a custom strip of addressable RGB LEDs.
The PI takes input from the user via green and red arcade-like buttons corresponding to "Real" or "Fake" quiz answer inputs. The buttons were programmable and flashed to light up and send either "1" or "2" keystrokes.


##  How it was used.
I had created Systemd services for the Raspberry PI to run the build of the quiz and only display a chromium session with kiosk mode, where player scores are kept in browser storage and reset each day. There's also a custom-made strip of addressable LEDs powered by a seperate 5V PSU and controlled via an I2C signal pin on the GPIO. The animated color effects are initiated by sending requests to a local Flask server where I used a Adafruit_Neopixel library.

## Images
...

## Demo coming ..