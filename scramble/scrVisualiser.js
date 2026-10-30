// Scales the scramble picture's box and places it: the desktop one in the bottom-right corner, the phone one above the button
function setVisualizerScale(scale, right, bottom, vis) {
      let wrapper = null;
    if (vis.id === "scrambleVis") {
        // Desktop picture: shrink from the bottom-right corner so it stays pinned there
        wrapper = document.querySelector(".panel-cube");
        // Set transform scale
        wrapper.style.transformOrigin = "bottom right"; // Important!
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.position = "absolute";
        wrapper.style.right = `${right}px`;
        wrapper.style.bottom = `${bottom}px`;

        // Size the box to the scaled picture; #scrambleVis isn't a canvas, so this always uses the 600 x 400 fallback
        const canvas = document.getElementById("scrambleVis");
        const originalWidth = canvas.width || 600;  // fallback to default csTimer size
        const originalHeight = canvas.height || 400;

        wrapper.style.width = originalWidth * scale + "px";
        wrapper.style.height = originalHeight * scale + "px";
    } else {
        // Phone picture: 50px higher, shrinking from the bottom center
        bottom += 50;
        wrapper = document.querySelector(".panel-cube2");
        // Set transform scale
        wrapper.style.transformOrigin = "bottom center"; // Important!
        wrapper.style.transform = `scale(${scale})`;

        wrapper.style.right = `${right}px`;
        wrapper.style.bottom = `${bottom}px`;
        // Size the box to the scaled picture, with the same 600 x 400 fallback
        const canvas = document.getElementById("scrambleVis");
        const originalWidth = canvas.width || 600;  // fallback to default csTimer size
        const originalHeight = canvas.height || 400;

        wrapper.style.width = originalWidth * scale + "px";
        wrapper.style.height = originalHeight * scale + "px";
    }

}

export { setVisualizerScale };