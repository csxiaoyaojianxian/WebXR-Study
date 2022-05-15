AFRAME.registerComponent("tune-renderer", {
    init: function () {
        let renderer = this.el.renderer;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 2.0;
    }
});

AFRAME.registerComponent("modify-materials", {
    init: function () {
        this.el.addEventListener("model-loaded", () => {
            const obj = this.el.getObject3D("mesh");
            obj.traverse(node => {
                if (node.isMesh) {
                    node.material.opacity = 255;
                }
            });
        });
    }
});

function on_switch() {
    const clips = [
        'CatWalk',
        'Samba',
        'Belly',
    ]
    let bot = document.querySelector('#bot');
    let mixer = bot.getAttribute("animation-mixer");
    let clipIndex = clips.indexOf(mixer.clip);
    let nextClipIndex = (clipIndex + 1) % clips.length;
    bot.setAttribute("animation-mixer", "clip: " + clips[nextClipIndex]);
}

document
    .querySelector(".switch-button")
    .addEventListener("click", on_switch);
