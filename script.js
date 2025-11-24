const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const scene = new THREE.Scene();
scene.background = null;

let fov = window.innerWidth > 768 ? 80 : 100;
const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});

renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.tonMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.querySelector(".model").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(5, 10, 7.5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1);
fillLight.position.set(-5, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
hemiLight.position.set(0, 25, 0);
scene.add(hemiLight);

let basicId;
function basicAnimate() {
    renderer.render(scene, camera);
    basicId = requestAnimationFrame(basicAnimate);
}
basicAnimate();

let model;
const loader = new THREE.GLTFLoader();
loader.load("assets/can.glb", function (gltf) {
    model = gltf.scene;
    model.traverse((node) => {
        if (node.isMesh) {
            if (node.material) {
                node.material.metalness = 0.3;
                node.material.roughness = 0.4;
                node.material.envMapIntensity = 1.5;
            }
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    scene.add(model);
    // model.rotation.z = Math.PI / 20; // حدود 11 درجه

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 1.3;

    model.scale.set(0, 0, 0);
    playInitialAnimation();

    cancelAnimationFrame(basicId);
    animate();
});

const floatAmplitude = 0.3;
const floatSpeed = 2;
const rotationSpeed = 2;
let isFloating = true;
let currentScroll = 0;

const stickyHeight = window.innerHeight;
const scannerSection = document.querySelector(".scanner");
const scannerPosition = scannerSection.offsetTop;
const scanContainer = document.querySelector(".scan-container");
// const scanSound = new Audio("assets/scan-sfx.mp3");
gsap.set(scanContainer, { scale: 0 });

function playInitialAnimation() {
    if (model) {
        gsap.to(model.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "power2.out",
        });
    }
    gsap.to(scanContainer, {
        scale: 1,
        duration: 1,
        ease: "power2.out",
    });
}

ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "top -10",
    onEnterBack: () => {
        if (model) {
            gsap.to(model.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1,
                ease: "power2.out",
            });
            isFloating = true;
        }
        gsap.to(scanContainer, {
            scale: 1,
            duration: 1,
            ease: "power2.out",
        });
    }
});

ScrollTrigger.create({
    trigger: ".scanner",
    start: "top top",
    end: `${stickyHeight}px`,
    pin: true,
    onEnter: () => {
        if (model) {
            // isFloating = false;

            gsap.to(model.rotation, {
                y: model.rotation.y + Math.PI * 2,
                duration: 2,
                ease: "power2.inOut"
            });

            gsap.to(model.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 2,
                ease: "power2.inOut"
            });

            gsap.to(scanContainer, {
                scale: 0,
                duration: 2,
                ease: "power2.inOut"
            });
        }
    },
    onLeaveBack: () => {
        gsap.set(scanContainer, { scale: 0 });
        gsap.to(scanContainer, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
        });
    },
});

lenis.on("scroll", (e) => {
    currentScroll = e.scroll;
});

function animate() {
    if (model) {
        if (isFloating) {
            const floatOffset =
                Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
            model.position.y = floatOffset;
        }

        const scrollProgress = Math.min(currentScroll / scannerPosition, 1);

        if (scrollProgress < 1) {
            model.rotation.x = scrollProgress * Math.PI * 2;
        }

        if (scrollProgress < 1) {
            model.rotation.y += 0.001 * rotationSpeed;
        }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

gsap.from(".type-id", {
    duration: 1,
    text: "",
    ease: "none"
});

gsap.from(".fade-in", {
    opacity: 0,
    y: 20,
    duration: 1,
    delay: 1
});

gsap.from(".barcode img", {
    opacity: 0,
    scale: 0.8,
    duration: 1,
    delay: 1.2
});
