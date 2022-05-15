AFRAME.registerComponent('tune-renderer', {
    init: function () {
        let renderer = this.el.renderer;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 2.0;
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
