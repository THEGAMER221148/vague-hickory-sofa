export default class ImageLabel {
    constructor(source, x, y, width, height) {
        this.src = source;
        this.img = new Image();
        this.img.src = this.src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}