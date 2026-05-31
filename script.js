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
