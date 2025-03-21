// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    // Setup background and foreground data
    const bgData = bgImg.data;
    const fgData = fgImg.data;
    const bgWidth = bgImg.width;
    const bgHeight = bgImg.height;
    const fgWidth = fgImg.width;
    const fgHeight = fgImg.height;

    const fgX = fgPos.x;
    const fgY = fgPos.y;

    // Loop over every pixel in the foreground image
    for (let y = 0; y < fgHeight; y++) {
        for (let x = 0; x < fgWidth; x++) {
            // Calculate the pixel position in the foreground and background
            const fgIndex = (y * fgWidth + x) * 4;
            const bgXPos = fgX + x;
            const bgYPos = fgY + y;

            // If the foreground pixel is outside the bounds of the background, skip it
            if (bgXPos < 0 || bgYPos < 0 || bgXPos >= bgWidth || bgYPos >= bgHeight) {
                continue;
            }

            const bgIndex = (bgYPos * bgWidth + bgXPos) * 4;

            // Get the foreground pixel rgba values
            const fgR = fgData[fgIndex];
            const fgG = fgData[fgIndex + 1];
            const fgB = fgData[fgIndex + 2];
            let fgA = fgData[fgIndex + 3];

            // Get the background pixel rgba values
            const bgR = bgData[bgIndex];
            const bgG = bgData[bgIndex + 1];
            const bgB = bgData[bgIndex + 2];
            let bgA = bgData[bgIndex + 3];

            // Normalize alpha values (should be between 0 and 1), and apply fgOpac to the foreground pixel
            fgA = (fgA / 255) * fgOpac;
            bgA = (bgA / 255);

            // Calculate resulting alpha
            const outA = (fgA + (1 - fgA) * bgA);

            // Avoid division by 0
            if (outA <= 0) {
                bgData[bgIndex] = 0;
                bgData[bgIndex + 1] = 0;
                bgData[bgIndex + 2] = 0;
                bgData[bgIndex + 3] = 0;

                continue;
            }

            // Calculate resulting rgb values
            const outR = ((fgA * fgR) + ((1 - fgA) * bgA * bgR)) / outA;
            const outG = ((fgA * fgG) + ((1 - fgA) * bgA * bgG)) / outA;
            const outB = ((fgA * fgB) + ((1 - fgA) * bgA * bgB)) / outA;

            // Set the background pixel with the composite color
            bgData[bgIndex] = outR;
            bgData[bgIndex + 1] = outG;
            bgData[bgIndex + 2] = outB;
            bgData[bgIndex + 3] = outA * 255;
        }
    }
}
