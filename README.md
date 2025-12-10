# Voltage & Amperage Visualizer

An interactive educational tool to help visualize and understand electrical concepts like voltage, amperage, and power through real-time animations and practical examples.

## Features

- **Interactive Controls**: Adjust voltage (0-1000kV) and amperage (0-1000A) with smooth sliders
- **Live Particle Animation**: Watch electrons flow through a wire - speed increases with voltage, quantity increases with amperage
- **Real-time Power Calculation**: Automatically calculates watts (V × A) as you adjust the sliders
- **Wire Specifications**: Get recommendations for:
  - Wire gauge (AWG) based on amperage
  - Required insulation rating based on voltage
  - Typical applications for that wire size
- **Educational Analogies**: Water pressure comparisons to help understand electrical concepts

## How to Use

Open `index.html` in any modern web browser

## Understanding the Display

### Voltage (V)
- Represents electrical pressure
- Higher voltage = electrons move faster through the wire
- Automatically switches from V to kV at 1000V

### Amperage (A)
- Represents current flow rate
- Higher amperage = more electrons flowing
- Determines the number of animated particles

### Power (Watts)
- Total energy output = Voltage × Amperage
- Shows real-world examples of what that power could run
- Ranges from small LEDs to major power plants

### Wire Requirements
- **Conductor Size**: Based on amperage to prevent overheating
- **Insulation Rating**: Based on voltage to prevent arcing/breakdown
- Shows standard AWG sizes and typical applications

## Technical Details

- Pure HTML, CSS, and JavaScript - no dependencies
- Canvas-based particle animation system
- Responsive design that works on desktop and mobile
- Logarithmic scaling for smooth visualization across extreme ranges


---

Created as an educational visualization tool for understanding electricity fundamentals.
