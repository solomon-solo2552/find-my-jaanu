import confetti from "canvas-confetti";

/**
 *  Fire a festive burst of confetti from the center of the screen.
 * Used when the user gets a match.
 */

export function fireConfetti() {
    const colors = ["#ec4899", "#f472b6", "#fbcfe8", "#facc15", "#fde047"];

    // Center burst
    confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors,
        scalar: 1.1,
    });

    // Left corner burst
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors,
        });
    }, 150);

    // Right corner burst
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors,
        });
    }, 300);
}

/**
 *  Gentle single burst - used for smaller celebrations.
 */

export function fireSmallConfetti() {
    confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ec4899", "#f472b6", "#facc15"],
        scalar: 0.9,
    });
}