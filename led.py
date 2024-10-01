from flask import Flask, jsonify
import time
from neopixel import *
from rpi_ws281x import *
import argparse

app = Flask(__name__)

# LED strip configuration:
LED_COUNT      = 230      # Number of LED pixels.
LED_PIN        = 10      # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA        = 10      # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 65      # Set to 0 for darkest and 255 for brightest
LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL    = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

# Create NeoPixel object with appropriate configuration.
strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
# Intialize the library (must be called once before other functions).
strip.begin()

offColor = Color(0, 0, 0)
correctColor = Color(0, 255, 0)
wrongColor = Color(255, 0, 0)
scoreColor = Color(0, 0, 255)

scoreLength = 1

print("Strip num pixels: ", strip.numPixels())

def correct_animation_ease():
    for t in range(1,255, 5):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, Color(0, t, 0))
        strip.show()
        time.sleep(35/1000)
        
    print("completed correct")
    for td in range(255,-1, -5):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, Color(0, td, 0))
        strip.show()
        time.sleep(10/1000)

    return jsonify({'message': 'Correct animation played.'})


def wrong_animation_ease():
    for t in range(1,255, 5):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, Color(t, 0, 0))
        strip.show()
        time.sleep(35/1000)

    print("completed wrong")
    for td in range(255,-1, -5):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, Color(td, 0, 0))
        strip.show()
        time.sleep(10/1000)

    return jsonify({'message': 'Wrong animation played.'})

@app.route('/clear')
def clear_strip():
    try:
        for t in range(255,-1,-5):
            for i in range(scoreLength):
                strip.setPixelColor(i, Color(0, 0, t))
            strip.show()
            time.sleep(25/1000)

        return jsonify({'message': 'Clear animation played.'})
    
    except Exception as e:
        return str(e)


@app.route('/correct')
def correct_animation():
    try:
        return correct_animation_ease()
    
    except Exception as e:
        return str(e)


@app.route('/wrong')
def wrong_animation():
    try:
        return wrong_animation_ease()
    
    except Exception as e:
        return str(e)


@app.route('/progress/<int:percentage>')
def progress_animation(percentage):
    try:
        num_leds_lit = int(LED_COUNT * percentage / 100)
        num_leds_lit = min(LED_COUNT, max(0, num_leds_lit))
        global scoreLength
        scoreLength = num_leds_lit
        print(num_leds_lit, percentage)
        for i in range(num_leds_lit):
            strip.setPixelColor(i, scoreColor)
            strip.show()
            time.sleep(3/num_leds_lit)

        return jsonify({'message': f'Progress animation played for {percentage}% progress.'})
    
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    app.run(host='localhost', port=5000)
