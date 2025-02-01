function choosePath(choice) {
    let storyText = document.getElementById("story");//get text...
    let storyImage = document.getElementById("story-image"); // get images...

    //kept having conflicts with capital letters probably would have been easier to just change them but I learned something!...
    choice = choice.trim().toLowerCase();

    /* 
innerHTML changes the text inside <p id="story">.
Without this, clicking buttons wouldn't update the story. I couln't get the text to switch so I looked up what would work. innerHTML!
*/

    if (choice === "smash") {
        storyText.innerHTML = "💥 You SMASH the alarm clock! It's utterly destroyed. Sweet VICTORY!!!";
        storyImage.src = "imgs/Clock.jpg"; //copy paste Emoji!
    } else if (choice === "bummer") {
        storyText.innerHTML = "😩 You sigh, roll out of bed, and drag yourself to work like a NORMIE... WOMP WOMP!";
        storyImage.src = "imgs/Work.jpeg";//copy paste Emoji!
    } else if (choice === "wtf") {
        storyText.innerHTML = "🦄 You close your eyes, concentrate, and summon the legendary Unicorn SUNKISSER, OBLITERATOR OF TOADS!";
        storyImage.src = "imgs/Unicorn.jpeg";//copy paste Emoji!
    } else {
        console.log("Invalid choice:", choice); // Debugging log Oopsies
    }
}
