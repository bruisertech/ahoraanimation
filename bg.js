document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('animated-background');
    if (!container) return; // Guard clause in case it's missing on a page

    const totalDoodles = 50; // Total number of shapes to generate

    const svgPaths = [
        // Heart
        "M 50,30 C 50,15 20,10 20,35 C 20,55 45,70 50,85 C 55,70 80,55 80,35 C 80,10 50,15 50,30 Z",
        // Arrow
        "M 20,80 Q 50,20 80,40 M 60,40 L 80,40 L 70,20",
        // Spiral
        "M 50,50 m 0,-5 a 5,5 0 1,0 0,10 a 10,10 0 1,0 0,-20 a 15,15 0 1,0 0,30 a 20,20 0 1,0 0,-40 a 25,25 0 1,0 0,50",
        // Smiley Face
        ["M 35,40 A 2,2 0 1,1 35.1,40", "M 65,40 A 2,2 0 1,1 65.1,40", "M 30,60 Q 50,80 70,60"],
        // Zigzag
        "M 15,30 L 30,70 L 45,30 L 60,70 L 75,30 L 90,70",
        // Freehand Circle
        "M 50,10 C 20,15 10,40 15,65 C 20,90 50,95 75,80 C 95,65 90,30 70,15 C 60,10 50,10 50,10",
        // Star
        "M 50,10 L 60,35 L 85,35 L 65,50 L 75,75 L 50,60 L 25,75 L 35,50 L 15,35 L 40,35 Z",
        // Triangle
        "M 50,15 L 85,80 L 15,80 Z",
        // Cloud
        "M 25,60 a 20,20 0 0,1 0,-40 a 20,20 0 0,1 15,-5 a 20,20 0 0,1 35,0 a 20,20 0 0,1 15,5 a 20,20 0 0,1 0,40 Z",
        // Lightning
        "M 55,10 L 25,50 L 50,50 L 40,90 L 75,40 L 50,40 Z",
        // Diamond
        "M 50,10 L 85,50 L 50,90 L 15,50 Z",
        // Crescent Moon
        "M 60,15 A 35,35 0 1,0 85,60 A 25,25 0 1,1 60,15 Z",
        // Infinity
        "M 25,40 C 10,40 10,60 25,60 C 40,60 60,40 75,40 C 90,40 90,60 75,60 C 60,60 40,40 25,40 Z"
    ];

    const colors = [
        { stroke: '#333333', opacity: 0.3 }, // Grey
        { stroke: '#D4AF37', opacity: 1.0 }  // Gold
    ];

    // Helper to get random number
    const random = (min, max) => Math.random() * (max - min) + min;

    const doodlesArray = [];

    // Calculate max scroll depth based on document body height to spread doodles appropriately
    const maxViewportCoverage = 300;

    for (let i = 0; i < totalDoodles; i++) {
        const shapeData = svgPaths[Math.floor(Math.random() * svgPaths.length)];
        const paths = Array.isArray(shapeData) ? shapeData : [shapeData];

        const colorObj = colors[Math.floor(Math.random() * colors.length)];

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('doodle');
        svg.setAttribute('viewBox', '0 0 100 100');

        const posX = random(0, 100);
        // Distribute doodles vertically from slightly above viewport to further down
        const posY = random(-20, maxViewportCoverage);
        const rot = random(0, 360);
        const scale = random(0.6, 1.2);

        const baseTransform = `rotate(${rot}deg) scale(${scale})`;

        svg.style.left = `${posX}vw`;
        svg.style.top = `${posY}vh`;
        svg.style.transform = baseTransform;
        svg.style.opacity = colorObj.opacity;

        const speed = random(0.1, 0.8);

        doodlesArray.push({
            element: svg,
            baseTransform: baseTransform,
            speed: speed
        });

        paths.forEach(d => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', d);
            path.style.stroke = colorObj.stroke;
            svg.appendChild(path);
        });

        const floatX = random(-30, 30);
        const floatY = random(-30, 30);
        const floatRot = random(-20, 20);

        const drawDuration = random(2, 4);
        const floatDuration = random(4, 8);
        const drawDelay = random(0, 2);
        const floatDelay = random(0, 3);

        svg.style.setProperty('--float-x', `${floatX}px`);
        svg.style.setProperty('--float-y', `${floatY}px`);
        svg.style.setProperty('--float-rot', `${floatRot}deg`);

        container.appendChild(svg);

        const svgPathsElements = svg.querySelectorAll('path');
        svgPathsElements.forEach(p => {
            const length = p.getTotalLength();
            p.style.setProperty('--path-length', length);
            p.style.setProperty('--draw-duration', `${drawDuration}s`);
            p.style.setProperty('--float-duration', `${floatDuration}s`);
            p.style.setProperty('--draw-delay', `${drawDelay}s`);
            p.style.setProperty('--float-delay', `${floatDelay}s`);
        });
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        doodlesArray.forEach(doodleObj => {
            const translateY = scrollY * doodleObj.speed * -1;
            doodleObj.element.style.transform = `translateY(${translateY}px) ${doodleObj.baseTransform}`;
        });
    });
});
