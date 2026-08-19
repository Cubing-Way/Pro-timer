function setVisualizerScale(scale, right, bottom, vis) {
      let wrapper = null;
    if (vis.id === "scrambleVis") {
        wrapper = document.querySelector(".panel-cube");
        // Set transform scale
        wrapper.style.transformOrigin = "bottom right"; // Important!
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.position = "absolute";
        wrapper.style.right = `${right}px`;
        wrapper.style.bottom = `${bottom}px`;

        // Optional: update wrapper layout size to avoid clipping
        const canvas = document.getElementById("scrambleVis");
        const originalWidth = canvas.width || 600;  // fallback to default csTimer size
        const originalHeight = canvas.height || 400;
        
        wrapper.style.width = originalWidth * scale + "px";
        wrapper.style.height = originalHeight * scale + "px";
    } else {
        bottom += 50;
        wrapper = document.querySelector(".panel-cube2");
        // Set transform scale
        wrapper.style.transformOrigin = "bottom center"; // Important!
        wrapper.style.transform = `scale(${scale})`;

        wrapper.style.right = `${right}px`;
        wrapper.style.bottom = `${bottom}px`;
                // Optional: update wrapper layout size to avoid clipping
        const canvas = document.getElementById("scrambleVis");
        const originalWidth = canvas.width || 600;  // fallback to default csTimer size
        const originalHeight = canvas.height || 400;
        
        wrapper.style.width = originalWidth * scale + "px";
        wrapper.style.height = originalHeight * scale + "px";
    }

}

export { setVisualizerScale };