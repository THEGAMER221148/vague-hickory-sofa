import ImageLabel from "./ImageLabel.js";
import Platform from "./platform.js";

export const GRAVITY = 0.001;

export const platforms = [
    new Platform(-500, 100, 500, 300, "rgb(0, 255, 0)"),
    new Platform(600, 100, 700, 200, "rgb(0, 255, 0)"),
    new Platform(800, 0, 900, 100, "rgb(0, 255, 0)"),
    new Platform(1100, -50, 1200, 50, "rgb(0, 255, 0)"),
    new Platform(1000, -170, 1100, -150, "rgb(0, 255, 0)"),
    new Platform(700, -220, 800, -200, "rgb(0, 255, 0)"),

    new Platform(500, -300, 600, -280, "rgb(0, 177, 38)"),
    new Platform(0, -1000, 400, -280, "rgb(0, 177, 38)"),
    new Platform(400, -400, 500, -280, "rgb(0, 177, 38)"),
    new Platform(400, -500, 500, -480, "rgb(0, 177, 38)"),
    new Platform(400, -600, 500, -580, "rgb(0, 177, 38)"),
    new Platform(400, -700, 510, -680, "rgb(0, 177, 38)"),
    new Platform(400, -800, 520, -780, "rgb(0, 177, 38)"),
    new Platform(400, -900, 530, -880, "rgb(0, 177, 38)"),
    new Platform(400, -1000, 540, -980, "rgb(0, 177, 38)"),
    new Platform(0, -1100, 200, -980, "rgb(0, 177, 38)"),

    new Platform(-2000, 100, -500, 300, "rgb(128, 128, 128)"),
    new Platform(-1000, -1000000, -950, 0, "rgb(128, 128, 128)"),
    new Platform(-950, -1000000, 0, -999950, "rgb(128, 128, 128)"),
    new Platform(-1200, -100000, -1150, 0, "rgb(128, 128, 128)"),
    new Platform(-1400, -10000, -1350, 0, "rgb(128, 128, 128)"),
    new Platform(-1600, -1000, -1550, 0, "rgb(128, 128, 128)"),
    new Platform(-1800, -100, -1750, 0, "rgb(128, 128, 128)"),
    new Platform(-2000, -10, -1950, 0, "rgb(128, 128, 128)"),

    new Platform(-4000, 100, -2000, 300, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-4000, -1000, -3000, -900, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-3000, -5000, -2950, -900, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-2750, -5000, -2700, -900, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-3500, -2000, -3250, -1750, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-4000, -3000, -3750, -2750, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-3500, -4000, -3250, -3750, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-4000, -5000, -3750, -4750, "rgb(255, 255, 0)", 0.01, 0.9)
];

export const images = [
    new ImageLabel("./images/Vague Hickory Sofa.png", -800, -1000200, 200, 200)
];
