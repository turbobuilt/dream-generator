async function loadImage(src) {
    const img = document.createElement('img');
    img.src = src;
    await new Promise(resolve => img.onload = resolve);
    const canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [img.width, img.height];
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
  }