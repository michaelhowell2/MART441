const blankImages = Array(12).fill('blank.png'); // Replace 'blank.png' with the path to your blank image

const actualImages = [];
const imageSet = ['img1.png', 'img2.png', 'img3.png', 'img4.png', 'img5.png', 'img6.png'];
for (let img of imageSet) {
  actualImages.push(img, img);
}

// Randomize the actual images array
for (let i = actualImages.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [actualImages[i], actualImages[j]] = [actualImages[j], actualImages[i]];
}



 