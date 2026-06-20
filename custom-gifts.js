document.addEventListener('DOMContentLoaded', () => {
    const giftSection = document.getElementById('gift-section');
    const petalsContainer = document.getElementById('petals-container');

    // Make the gift section visible and start petals immediately
    giftSection.classList.add('visible');
    startPetals();

    function startPetals() {
        const totalPetals = 50; // Adjust for density

        for (let i = 0; i < totalPetals; i++) {
            createPetal();
        }

        // Continually create new ones to replace those that fall out
        setInterval(createPetal, 400);
    }

    function createPetal() {
        const petal = document.createElement('div');
        petal.classList.add('petal');

        // Randomize properties
        const size = Math.random() * 15 + 10; // 10px to 25px
        const startLeft = Math.random() * 100; // 0% to 100vw
        const animationDuration = Math.random() * 5 + 5; // 5s to 10s
        const animationDelay = Math.random() * 5; // 0s to 5s delay
        // Gold and Beige variations
        const colorVariant = Math.random() > 0.5 ? '#d4af37' : '#f5f5dc';

        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.2}px`; // slightly taller than wide
        petal.style.left = `${startLeft}vw`;
        petal.style.backgroundColor = colorVariant;

        // Setup unique animation for each petal using Web Animations API
        const keyframes = [
            { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 0.8 },
            { transform: `translate3d(${Math.random() * 100 - 50}px, 50vh, 0) rotate(${Math.random() * 360}deg)`, opacity: 0.8 },
            { transform: `translate3d(${Math.random() * 100 - 50}px, 110vh, 0) rotate(${Math.random() * 720}deg)`, opacity: 0 }
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
            petal.remove();
        };
    }
});