// Get DOM elements
const voltageSlider = document.getElementById('voltage');
const amperageSlider = document.getElementById('amperage');
const voltageValue = document.getElementById('voltage-value');
const voltageUnit = document.getElementById('voltage-unit');
const amperageValue = document.getElementById('amperage-value');
const powerValue = document.getElementById('power-value');
const exampleText = document.getElementById('example-text');
const wireSpec = document.getElementById('wire-spec');
const wireNote = document.getElementById('wire-note');
const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');

// Initialize canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class to represent electrons
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = -10;
        this.y = canvas.height / 2 + (Math.random() - 0.5) * 60;
        this.baseSize = 3 + Math.random() * 3;
        this.size = this.baseSize;
        this.speedOffset = Math.random() * 0.5;
        this.wobbleOffset = Math.random() * Math.PI * 2;
    }

    update(voltage, amperage) {
        // Speed based on voltage (pressure) - logarithmic scaling for large range
        const voltageNormalized = Math.min(voltage / 1000000, 1);
        const baseSpeed = Math.pow(voltageNormalized, 0.5) * 12 + 1;
        this.x += baseSpeed + this.speedOffset;

        // Wobble effect
        this.wobbleOffset += 0.1;
        const wobbleAmount = 2 + Math.pow(voltageNormalized, 0.5) * 4;
        this.y += Math.sin(this.wobbleOffset) * wobbleAmount * 0.1;

        // Size pulsing effect based on power
        const pulse = Math.sin(Date.now() * 0.005 + this.wobbleOffset) * 0.3 + 1;
        this.size = this.baseSize * pulse;

        // Reset if off screen
        if (this.x > canvas.width + 10) {
            this.reset();
        }

        // Keep particles within bounds
        if (this.y < 20) this.y = 20;
        if (this.y > canvas.height - 20) this.y = canvas.height - 20;
    }

    draw() {
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, 'rgba(255, 255, 100, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Particle system
let particles = [];
let voltage = parseFloat(voltageSlider.value);
let amperage = parseFloat(amperageSlider.value);

function initParticles() {
    particles = [];
    // Number of particles based on amperage with logarithmic scaling
    const amperageNormalized = Math.min(amperage / 1000, 1);
    const particleCount = Math.max(5, Math.floor(Math.pow(amperageNormalized, 0.6) * 100 + 5));
    for (let i = 0; i < particleCount; i++) {
        const particle = new Particle();
        // Spread particles across the canvas initially
        particle.x = (canvas.width / particleCount) * i;
        particles.push(particle);
    }
}

// Animation loop
function animate() {
    // Clear canvas with trailing effect for motion blur
    ctx.fillStyle = 'rgba(45, 55, 72, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update(voltage, amperage);
        particle.draw();
    });

    // Draw flow lines for visual effect
    if (voltage > 0) {
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const offset = Date.now() * 0.05 + i * 100;
            const y = canvas.height / 2 + Math.sin(offset * 0.01) * 20;
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < canvas.width; x += 10) {
                const wave = Math.sin((x + offset) * 0.02) * 5;
                ctx.lineTo(x, y + wave);
            }
            ctx.stroke();
        }
    }

    requestAnimationFrame(animate);
}

// Update function
function updateValues() {
    voltage = parseFloat(voltageSlider.value);
    amperage = parseFloat(amperageSlider.value);
    
    // Update display values with unit conversion
    if (voltage >= 1000) {
        voltageValue.textContent = (voltage / 1000).toFixed(1);
        voltageUnit.textContent = 'kV';
    } else {
        voltageValue.textContent = Math.round(voltage);
        voltageUnit.textContent = 'V';
    }
    amperageValue.textContent = amperage;
    
    // Calculate and display power
    const power = (voltage * amperage).toFixed(1);
    powerValue.textContent = power;
    
    // Update power example based on wattage
    updatePowerExample(parseFloat(power));
    
    // Update wire gauge recommendation
    updateWireGauge(amperage, voltage);
    
    // Update gauge widths
    const voltagePercent = (voltage / 1000000) * 100;
    const amperagePercent = (amperage / 1000) * 100;
    
    // Update particle count based on amperage
    const amperageNormalized = Math.min(amperage / 1000, 1);
    const targetParticleCount = Math.max(5, Math.floor(Math.pow(amperageNormalized, 0.6) * 100 + 5));
    if (particles.length !== targetParticleCount) {
        initParticles();
    }
}

// Function to provide real-world power examples
function updatePowerExample(watts) {
    let example = '';
    
    if (watts < 1) {
        example = 'almost nothing';
    } else if (watts < 5) {
        example = 'a small LED light';
    } else if (watts < 15) {
        example = 'a smartphone charger';
    } else if (watts < 50) {
        example = 'a laptop charging';
    } else if (watts < 100) {
        example = 'a large TV or gaming console';
    } else if (watts < 300) {
        example = 'a desktop computer with monitor';
    } else if (watts < 800) {
        example = 'a microwave oven';
    } else if (watts < 1500) {
        example = 'a space heater or hair dryer';
    } else if (watts < 3000) {
        example = 'a window air conditioner';
    } else if (watts < 5000) {
        example = 'an electric water heater';
    } else if (watts < 10000) {
        example = 'an electric car charger (Level 2)';
    } else if (watts < 20000) {
        example = 'a small house with AC running';
    } else if (watts < 50000) {
        example = 'a large home with all appliances';
    } else if (watts < 100000) {
        example = 'a small commercial building';
    } else if (watts < 500000) {
        example = 'a large office building';
    } else if (watts < 1000000) {
        example = 'a small factory';
    } else if (watts < 10000000) {
        example = 'an industrial manufacturing plant';
    } else if (watts < 100000000) {
        example = 'a small power substation';
    } else if (watts < 1000000000) {
        example = 'a regional electrical grid';
    } else {
        example = 'a major power plant';
    }
    
    exampleText.textContent = example;
}

// Function to recommend wire gauge based on amperage
function updateWireGauge(amps, volts) {
    let gauge = '';
    let note = '';
    
    // Determine conductor size based on amperage
    if (amps < 5) {
        gauge = '18 AWG (1.0mm diameter)';
        note = 'Low power devices, doorbells';
    } else if (amps < 15) {
        gauge = '14 AWG (1.6mm diameter)';
        note = 'Standard household circuits';
    } else if (amps < 20) {
        gauge = '12 AWG (2.1mm diameter)';
        note = 'Kitchen appliances, AC units';
    } else if (amps < 30) {
        gauge = '10 AWG (2.6mm diameter)';
        note = 'Electric water heaters, dryers';
    } else if (amps < 55) {
        gauge = '6 AWG (4.1mm diameter)';
        note = 'Electric ranges, large AC systems';
    } else if (amps < 70) {
        gauge = '4 AWG (5.2mm diameter)';
        note = 'Sub-panels, EV chargers';
    } else if (amps < 95) {
        gauge = '2 AWG (6.5mm diameter)';
        note = 'Main service feeds';
    } else if (amps < 125) {
        gauge = '1 AWG (7.3mm diameter)';
        note = 'Large residential service';
    } else if (amps < 150) {
        gauge = '1/0 AWG (8.3mm diameter)';
        note = 'Heavy duty service';
    } else if (amps < 175) {
        gauge = '2/0 AWG (9.3mm diameter)';
        note = 'Commercial building feeders';
    } else if (amps < 200) {
        gauge = '3/0 AWG (10.4mm diameter)';
        note = 'Large commercial service';
    } else if (amps < 260) {
        gauge = '4/0 AWG (11.7mm diameter)';
        note = 'Industrial feeders';
    } else if (amps < 350) {
        gauge = '250 MCM (12.7mm diameter)';
        note = 'Small industrial mains';
    } else if (amps < 500) {
        gauge = '500 MCM (17.9mm diameter)';
        note = 'Industrial power distribution';
    } else if (amps < 750) {
        gauge = '750 MCM (22.0mm diameter)';
        note = 'Large industrial feeders';
    } else {
        gauge = '1000+ MCM (25.4mm+ diameter)';
        note = 'Utility-scale transmission cables';
    }
    
    // Add voltage-based insulation requirements
    let insulationNote = '';
    if (volts < 300) {
        insulationNote = ' with standard 600V insulation';
    } else if (volts < 1000) {
        insulationNote = ' with 1kV rated insulation';
    } else if (volts < 5000) {
        insulationNote = ' with medium voltage (5kV) insulation';
    } else if (volts < 15000) {
        insulationNote = ' with 15kV shielded cable';
    } else if (volts < 35000) {
        insulationNote = ' with 35kV shielded cable';
    } else if (volts < 69000) {
        insulationNote = ' with 69kV transmission cable';
    } else if (volts < 138000) {
        insulationNote = ' with 138kV transmission line';
    } else if (volts < 230000) {
        insulationNote = ' with 230kV transmission line';
    } else if (volts < 500000) {
        insulationNote = ' with 500kV high voltage transmission';
    } else {
        insulationNote = ' with ultra-high voltage (750kV+) transmission';
    }
    
    wireSpec.textContent = gauge + insulationNote;
    wireNote.textContent = note;
}

// Event listeners
voltageSlider.addEventListener('input', updateValues);
amperageSlider.addEventListener('input', updateValues);

// Initialize
initParticles();
updateValues();
animate();

// Add visual feedback on slider interaction
[voltageSlider, amperageSlider].forEach(slider => {
    slider.addEventListener('mousedown', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    slider.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });
    
    slider.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});
