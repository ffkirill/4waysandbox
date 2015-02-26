let names = {
            '1': ['Snowflake', 'Snowflake'],
            '2': ['Sidebody Donut', 'Side Flake Donut'],
            '3': ['Side Flake Opal', 'Turf'],
            '4': ['Monopod', 'Monopod'],
            '5': ['Opal', 'Opal'],
            '6': ['Stardian', 'Stardian'],
            '7': ['Sidebuddies', 'Sidebuddies'],
            '8': ['Canadian Tree', 'Canadian Tree'],
            '9': ['Cat + Accordian',  'Cat + Accordian'],
            '10': ['Diamond',  'Bunyip'],
            '11': ['Photon',  'Photon'],
            '12': ['Bundy',  'Bundy'],
            '13': ['Offset',  'Spinner'],
            '14': ['Bipole',  'Bipole'],
            '15': ['Caterpillar', 'Caterpillar'],
            '16': ['Compressed Accordian', 'Box'],
            '17': ['Danish Tee', 'Murphy'],
            '18': ['Zircon', 'Zircon'],
            '19': ['Ritz', 'Icepick'],
            '20': ['Piver', 'Viper'],
            '21': ['Zig Zag', 'Marquis'],
            '22': ['Tee', 'Chinese Tee'],
            'a': ['Unipod'],
            'b': ['Stairstep Diamond'],
            'c': ['Murphy Flake'],
            'd': ['Yuan'],
            'e': ['Meeker'],
            'f': ['Open Accordian'],
            'g': ['Catacord'],
            'h': ['Bow'],
            'j': ['Donut'],
            'k': ['Hook'],
            'l': ['Adder'],
            'm': ['Star'],
            'n': ['Crank'],
            'o': ['Satellite'],
            'p': ['Sidebody'],
            'q': ['Phalanx']
        }, colors = {
            red: [255, 0, 0],
            green: [0, 255, 0],
            blue: [0, 0, 255],
            yellow: [255, 255, 0]
        },
        colorThreshold = 100,
        imgAddWidth = 50,
        imgAddHeight = 40;


function loadImage(img, src) {
    return new Promise(function(resolve, reject) {
        img.onload = function () {
            img.onload = false;
            resolve();
        };
        img.src = src;
    });
}

function colorLooksLike(color, referenceColor) {
    for (let i = 0; i < 3; ++i) {
        if (Math.abs(color[i] - referenceColor[i]) > colorThreshold) {
            return false;
        }
    }
    return true;
}

function getReferenceColorName(color) {
    for (let name in colors) {
        if (!colors.hasOwnProperty(name)) continue;
        if (colorLooksLike(color, colors[name])) return name;
    }
}


export class BlockItem {
    constructor(src) {
        this.srcImg = new Image();
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.srcWidth = 0;
        this.srcHeight = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.src = src;
        this.fromColor = null;
        this.angle = 0;
        this.onRotate = (angle)=>{};
        this.onSwapColors = function(colorFrom, colorTo){};
    }

    setupCanvasSize(addWidth, addHeight) {
        let canvas = this.canvas;
        this.srcWidth = this.srcImg.width;
        this.srcHeight = this.srcImg.height;
        this.offsetX = this.srcWidth / 2;
        this.offsetY = this.srcHeight / 2;
        canvas.style.width = canvas.width = this.srcWidth + addWidth;
        canvas.style.height = canvas.height = this.srcHeight + addHeight;
        this.ctx = canvas.getContext('2d');
    }

    createOffScreenCanvas() {
        let offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.style.width = offScreenCanvas.width = this.srcWidth;
        offScreenCanvas.style.height = offScreenCanvas.height = this.srcHeight;
        let offScreenCtx = offScreenCanvas.getContext('2d');
        return {canvas:offScreenCanvas, ctx: offScreenCtx};
    }

    async drawOffScreenCanvas(canvasData) {
        let angle = this.angle;
        await loadImage(this.srcImg,
            canvasData.canvas.toDataURL('image/png', 1));
        this.reset();
        await this.rotate(angle);
    }

    reset() {
        this.setupCanvasSize(0, 0);
        this.angle = 0;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.offsetX, this.offsetY);
    }

    async swapColors(from, to) {
        let offScreenCanvasData = this.createOffScreenCanvas();
        offScreenCanvasData.ctx.drawImage(this.srcImg, 0, 0,
            this.srcWidth, this.srcHeight);
        let imageData = offScreenCanvasData.ctx.getImageData(0, 0,
            this.srcWidth, this.srcHeight);
        let data = imageData.data;
        let colorA = colors[from],
            colorB = colors[to];
        for (let i = 0; i < data.length; i += 4) {
            if (colorLooksLike([data[i], data[i + 1], data[i + 2]],
                    colorA)) {
                data[i] = colorB[0];
                data[i + 1] = colorB[1];
                data[i + 2] = colorB[2];
            } else if (colorLooksLike([data[i], data[i + 1], data[i + 2]],
                    colorB)) {
                data[i] = colorA[0];
                data[i + 1] = colorA[1];
                data[i + 2] = colorA[2];
            }
        }
        offScreenCanvasData.ctx.putImageData(imageData, 0, 0);
        await this.drawOffScreenCanvas(offScreenCanvasData);
        this.fromColor = null;
    }

    async rotate(angle) {
        this.angle = (this.angle + angle) % 360;
        await new Promise((resolve, reject) => {
            window.requestAnimationFrame(() => {
                this.ctx.clearRect(-this.offsetX, -this.offsetY,
                    this.srcWidth, this.srcHeight);
                this.ctx.rotate(angle * Math.PI / 180);
                this.ctx.drawImage(this.srcImg, -this.offsetX, -this.offsetY,
                this.srcWidth, this.srcHeight);
                resolve();
            });
        })
    }

    async mirror() {
        let offScreenCanvasData = this.createOffScreenCanvas();
        offScreenCanvasData.ctx.translate(this.srcWidth, 0);
        offScreenCanvasData.ctx.scale(-1, 1);
        offScreenCanvasData.ctx.drawImage(this.srcImg, 0, 0,
            this.srcWidth, this.srcHeight);
        await this.drawOffScreenCanvas(offScreenCanvasData);
    }

    async render(parent) {
        //Initial image
        await loadImage(this.srcImg, this.src);
        this.setupCanvasSize(imgAddWidth, imgAddHeight);
        this.ctx.drawImage(this.srcImg, imgAddWidth / 2, imgAddHeight / 2,
            this.srcWidth, this.srcHeight);

        //Processed image
        await loadImage(this.srcImg, this.canvas.toDataURL('image/png', 1));
        this.setupCanvasSize(0, 0);
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.drawImage(this.srcImg, -this.offsetX, -this.offsetY,
            this.srcWidth, this.srcHeight);
        //Mouse wheel
        this.canvas.addEventListener('mousewheel', (event) => {
            this.onMouseWheel(event);
        }, false);
        //Mouse click
        this.canvas.addEventListener('click', (event) => {
            this.onClick(event);
        }, false);
        this.canvas.classList.add('block-display-item');
        parent.appendChild(this.canvas);
    }

    onMouseWheel(event) {
        let angle = (-event.deltaY % 360) / 4;
        this.onRotate(angle);
        event.preventDefault();
    }

    onClick(event) {
        let ctx = this.ctx
          , style = window.getComputedStyle(this.canvas, null)
          , data = ctx.getImageData(event.pageX
            - this.canvas.offsetLeft
            - Number(style.paddingLeft.replace('px', '')),
            event.pageY
            - this.canvas.offsetTop
            - Number(style.paddingTop.replace('px', '')), 1, 1).data;
        let pickedColor = getReferenceColorName(data);
        if (pickedColor) {
            if (this.fromColor !== null) {
                this.onSwapColors(this.fromColor, pickedColor);
            } else {
                this.fromColor = pickedColor;
            }
        }
    }
}

export class Block {
    constructor(num) {
        this.items = [];
        this.angle = 0;
        this.swaps = [];
        this.mirror = false;
        this.block = num;
        this.el = null;
    }

    addHeader() {
        let num = this.block;
        let header = document.createElement('h4');
        let mirrorLink = document.createElement('a');
        header.appendChild(document.createTextNode(
            `${num.toUpperCase()}.${names[num][0]}`));
        header.classList.add('block-header');
        mirrorLink.appendChild(document.createTextNode('M'));
        mirrorLink.href = '#';
        mirrorLink.addEventListener('click', (event) => {
            this.onMirror();
            event.preventDefault();
        }, false);
        header.appendChild(mirrorLink);
        this.el.appendChild(header);
    }

    addFooter() {
        let num = this.block;
        let footer = document.createElement('h4');
        footer.appendChild(document.createTextNode(names[num][1]));
        footer.classList.add('block-footer');
        this.el.appendChild(footer);
    }

    addItem(src) {
        let item = new BlockItem(src);
        item.onRotate = (angle) => {this.onRotate(angle)};
        item.onSwapColors = (from, to) => {this.onSwapColors(from, to)};
        this.items.push(item);
        return item;
    }

    async render(parent) {
        this.el = document.createElement('div');
        this.el.classList.add('block-display');
        this.addHeader();
        this.addItem(`img/${this.block}.png`);
        if (this.block.match('\\d+')) {
            this.addItem(`img/${this.block}i.png`);
            this.addItem(`img/${this.block}f.png`);
        }
        for (let item of this.items) {
            await item.render(this.el);
        }
        if (this.items.length > 1)
            this.addFooter();
        parent.appendChild(this.el);
    }

    onMirror() {
        this.mirror = !this.mirror;
        for (let item of this.items) item.mirror();
    }

    onRotate(angle) {
        this.angle = (this.angle + angle) % 360;
        for (let item of this.items) item.rotate(angle);
    }

    onSwapColors(from, to) {
        for (let item of this.items) item.swapColors(from, to);
        this.swaps.push([from, to]);
    }
}

window.onload = () => {
    let sandbox = document.getElementById('sandbox');
    let block = new Block('1');
    document.getElementById('go-btn').addEventListener('click', async (event) => {
        let blocks = document.getElementById('sequence').value.split('-');
        event.preventDefault();
        for (let num of blocks) {
            block = new Block(num.toLowerCase().trim());
            await block.render(sandbox);
        }
    }, false);
    document.getElementById('clear-btn').addEventListener('click', (event) => {
        event.preventDefault();
        while (sandbox.hasChildNodes()) {
            sandbox.removeChild(sandbox.lastChild);
        }
    }, false);
};