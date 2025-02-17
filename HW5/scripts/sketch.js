// Create an array for the blank images (12 total)
const blankArray = new Array(12).fill('imgs/cover.png'); // cover image added pic to the "blank"

// Images for the array
const petImages = [
  'imgs/image1.png',
  'imgs/image2.png',
  'imgs/image3.png',
  'imgs/image4.png',
  'imgs/image5.png',
  'imgs/image6.png'
];

let actualArray = [];

//Push the images for 12 total
petImages.forEach(img => {
  actualArray.push(img);
  actualArray.push(img);
});

// Randomize the actualArray using sort() and Math.random()
actualArray.sort(() => Math.random() - 0.5);

// Function to initialize and display the game board
function initGame() {
  const board = document.getElementById('gameBoard');
  
  // Create and display 12 image elements (all blank initially)
  for (let i = 0; i < blankArray.length; i++) {
    const imgElement = document.createElement('img');
    imgElement.src = blankArray[i];
    imgElement.id = 'img' + i;
    
    // Add click event listener to reveal the actual image when clicked
    imgElement.addEventListener('click', function() {
      revealImage(i);
    });
    
    // Attactch the image to game board like aftereffects parenting
    board.appendChild(imgElement);
  }
}

// Function to reveal the actual image when a blank image is clicked
function revealImage(index) {
  document.getElementById('img' + index).src = actualArray[index];
}

