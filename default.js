class Animation {
  constructor(canvasId, xmlFile, fps = 40) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.frames = [];
    this.frame = 0;
    this.fps = fps;
    this.frameDuration = 1000 / fps;
    this.lastTime = 0;
    this.img = new Image();
    this.loadXML(xmlFile);
  }

  loadXML(xmlFile) {
    fetch(xmlFile)
      .then(res => res.text())
      .then(str => (new DOMParser()).parseFromString(str, "text/xml"))
      .then(xml => {
        const subTextures = xml.getElementsByTagName('SubTexture');
        for (let i = 0; i < subTextures.length; i++) {
          const t = subTextures[i];
          this.frames.push({
            x: parseInt(t.getAttribute('x')),
            y: parseInt(t.getAttribute('y')),
            w: parseInt(t.getAttribute('width')),
            h: parseInt(t.getAttribute('height'))
          });
        }
        this.img.src = xml.documentElement.getAttribute('imagePath');
        this.img.onload = () => requestAnimationFrame(this.loop.bind(this));
      })
      .catch(err => console.error("Failed to load XML:", xmlFile, err));
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = timestamp - this.lastTime;

    if (delta >= this.frameDuration) {
      this.frame = (this.frame + 1) % this.frames.length;
      this.lastTime = timestamp;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const f = this.frames[this.frame];
    if (f) {
      const scale = Math.min(this.canvas.width / f.w, this.canvas.height / f.h);
      const dw = f.w * scale;
      const dh = f.h * scale;
      const dx = (this.canvas.width - dw) / 2;
      const dy = (this.canvas.height - dh) / 2;
      this.ctx.drawImage(this.img, f.x, f.y, f.w, f.h, dx, dy, dw, dh);
    }

    requestAnimationFrame(this.loop.bind(this));
  }
}


