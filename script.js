// --- Force Top on Reload ---
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    // Ensure we always start at the top
    window.scrollTo(0, 0);

    // --- 1. Canvas and Image Sequence Logic ---
    const canvas = document.getElementById('sequence-canvas');
    if (!canvas) return; // Guard clause

    const ctx = canvas.getContext('2d');

    // Frame configuration
    const frameCount = 32;
    const images = [];
    const obj = { frame: 0 }; // Object for GSAP to animate the 'frame' property

    // Generate file names from the new images/ folder
    const currentFrame = (index) => `images/frame_${String(index).padStart(5, '0')}.webp`;

    // Function to render an image on the canvas with cover-like scaling
    function render(img) {
        if (!img || !img.complete) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate scale for 'object-fit: cover'
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);

        let drawnWidth = img.width * scale;
        let drawnHeight = img.height * scale;

        // On mobile (portrait), apply a progressive vertical stretch so the paper opens wider,
        // pushing the top and bottom borders towards the edges of the screen.
        if (canvas.height > canvas.width) {
            const progress = obj.frame / (frameCount - 1);
            // Gradually stretch up to 2.6x to push the 35% thick borders off-screen
            const maxStretch = 2.6;
            const stretchFactor = 1 + (maxStretch - 1) * progress;
            drawnHeight *= stretchFactor;
        }

        const x = (canvas.width / 2) - (drawnWidth / 2);
        const y = (canvas.height / 2) - (drawnHeight / 2);

        ctx.drawImage(img, x, y, drawnWidth, drawnHeight);
    }

    // Resize canvas to match window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Re-render current frame
        const currentImg = images[Math.round(obj.frame)];
        if (currentImg) {
            render(currentImg);
        }
    }

    // Responsive listener
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial call

    // Preload images
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);

        // Draw first image immediately once loaded
        if (i === 1) {
            img.onload = () => {
                if (obj.frame === 0) {
                    render(img);
                }
            };
        }
    }

    // --- 2. GSAP & ScrollTrigger Logic ---
    gsap.registerPlugin(ScrollTrigger);

    // Animation of the image sequence
    const tl = gsap.to(obj, {
        frame: frameCount - 1, // From 0 to 31
        snap: 'frame', // Ensure integer values
        ease: 'none',
        duration: 1.2, // Fast duration
        onUpdate: () => {
            const index = Math.round(obj.frame);
            if (images[index]) {
                render(images[index]);
            }
        },
        onComplete: () => {
            // Once the opening animation ends, we need to split the canvas visually
            // to slide the top half up and the bottom half down naturally.
            // We can do this by cloning the canvas into two pieces.

            const topCanvas = document.createElement('canvas');
            const bottomCanvas = document.createElement('canvas');

            topCanvas.width = canvas.width;
            topCanvas.height = canvas.height;
            bottomCanvas.width = canvas.width;
            bottomCanvas.height = canvas.height;

            const topCtx = topCanvas.getContext('2d');
            const bottomCtx = bottomCanvas.getContext('2d');

            // Draw top half
            topCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height / 2, 0, 0, canvas.width, canvas.height / 2);

            // Draw bottom half
            bottomCtx.drawImage(canvas, 0, canvas.height / 2, canvas.width, canvas.height / 2, 0, canvas.height / 2, canvas.width, canvas.height / 2);

            // Style the clones
            topCanvas.style.position = 'fixed';
            topCanvas.style.top = '0';
            topCanvas.style.left = '0';
            topCanvas.style.zIndex = '3';
            topCanvas.style.pointerEvents = 'none';
            topCanvas.style.width = canvas.clientWidth + 'px';
            topCanvas.style.height = canvas.clientHeight + 'px';

            bottomCanvas.style.position = 'fixed';
            bottomCanvas.style.top = '0';
            bottomCanvas.style.left = '0';
            bottomCanvas.style.zIndex = '3';
            bottomCanvas.style.pointerEvents = 'none';
            bottomCanvas.style.width = canvas.clientWidth + 'px';
            bottomCanvas.style.height = canvas.clientHeight + 'px';

            document.body.appendChild(topCanvas);
            document.body.appendChild(bottomCanvas);

            // Hide the original canvas immediately
            canvas.style.display = 'none';

            // Animate them out
            gsap.to(topCanvas, {
                y: -canvas.height / 2 - 100, // Slide up
                duration: 0.8,
                ease: 'power2.inOut',
                onComplete: () => topCanvas.remove()
            });

            gsap.to(bottomCanvas, {
                y: canvas.height / 2 + 100, // Slide down
                duration: 0.8,
                ease: 'power2.inOut',
                onComplete: () => bottomCanvas.remove()
            });
        },
        paused: true // Start paused
    });

    let animationHasPlayed = false;

    // ScrollTrigger to trigger the opening animation ONCE
    ScrollTrigger.create({
        trigger: 'body',
        start: 'top -5', // Trigger slightly after scrolling down
        onEnter: () => {
            if (!animationHasPlayed) {
                // Play animation to open
                tl.play();
                animationHasPlayed = true;

                // Hide the hint (finger) permanently
                const hint = document.getElementById('scroll-hint');
                if (hint) {
                    gsap.to(hint, { autoAlpha: 0, duration: 0.5 });
                }
            }
        }
        // Removing onLeaveBack so the paper STAYS OPEN and users can scroll normally
    });

    // --- 3. Back to Top Button Logic ---
    const backToTopBtn = document.getElementById('back-to-top');

    // Show button when scrolling down, hide when near top
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) { // Show after 500px of scroll
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    // Scroll to top smoothly on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// --- 4. Petals Effect for index.html Special Section ---
document.addEventListener('DOMContentLoaded', () => {
    const petalsContainer = document.getElementById('main-petals-container');
    if (!petalsContainer) return;

    // Use IntersectionObserver to only generate petals when the section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!window.petalsInterval) {
                    startMainPetals();
                }
            } else {
                if (window.petalsInterval) {
                    clearInterval(window.petalsInterval);
                    window.petalsInterval = null;
                }
            }
        });
    }, { threshold: 0.1 });

    const specialContainer = document.getElementById('special-image-container');
    if (specialContainer) {
        observer.observe(specialContainer);
    }

    function startMainPetals() {
        // Initial burst
        for (let i = 0; i < 15; i++) {
            createMainPetal();
        }

        // Continuous falling
        window.petalsInterval = setInterval(createMainPetal, 800);
    }

    function createMainPetal() {
        const petal = document.createElement('div');
        petal.classList.add('main-petal');

        // Randomize properties
        const size = Math.random() * 15 + 10; // 10px to 25px
        const startLeft = Math.random() * 100; // 0% to 100% of container width
        const animationDuration = Math.random() * 5 + 7; // 7s to 12s for slow elegant fall
        const animationDelay = Math.random() * 2; // 0s to 2s delay
        const colorVariant = Math.random() > 0.5 ? '#d11e3b' : '#a8152d'; // Slight color variation

        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.2}px`;
        petal.style.left = `${startLeft}%`;
        petal.style.backgroundColor = colorVariant;

        // Animate from top of the container, falling downwards and out of it
        // The container needs overflow:visible for this to work
        const fallDistance = window.innerHeight * 0.8; // Fall roughly 80vh down

        const keyframes = [
            { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 0.8 },
            { transform: `translate3d(${Math.random() * 60 - 30}px, ${fallDistance / 2}px, 0) rotate(${Math.random() * 360}deg)`, opacity: 0.8 },
            { transform: `translate3d(${Math.random() * 100 - 50}px, ${fallDistance}px, 0) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ];

        const options = {
            duration: animationDuration * 1000,
            delay: animationDelay * 1000,
            easing: 'ease-in-out',
            fill: 'forwards'
        };

        const animation = petal.animate(keyframes, options);

        petalsContainer.appendChild(petal);

        // Remove element after animation finishes
        animation.onfinish = () => {
            if(petal.parentNode) petal.remove();
        };
    }
});
