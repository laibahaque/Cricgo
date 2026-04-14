import * as THREE from "three";

class MysteryBox {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.isOpening = false;
        this.opened = false;

        window.dispatchEvent(new Event('game-pause'));

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        this.camera.position.set(0, 0.4, 5.5);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(320, 320);

        this.createOverlay();
        this.createLights();
        this.createBox();
        this.animate();
    }

    createOverlay() {
        this.overlay = document.createElement("div");
        this.overlay.style.cssText = `
            position: fixed; inset: 0; cursor: pointer;
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(10px);
            display: flex; justify-content: center; align-items: center;
            flex-direction: column; z-index: 1000; overflow: hidden;
        `;

        this.confettiLayer = document.createElement("div");
        this.confettiLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
        this.overlay.appendChild(this.confettiLayer);

        this.boxWrap = document.createElement("div");
        this.boxWrap.style.cssText = "position:relative;width:320px;height:320px;";
        this.boxWrap.appendChild(this.renderer.domElement);
        this.overlay.appendChild(this.boxWrap);

        // ✅ Message is OUTSIDE boxWrap — sits below the box
        this.messageEl = document.createElement("div");
        this.messageEl.style.cssText = `
            margin-top: 18px;
            font-size: 26px;
            font-weight: 900;
            color: #ffdd55;
            text-align: center;
            text-shadow: 0 2px 10px rgba(255, 221, 85, 0.45);
            opacity: 0;
            transform: translateY(30px) scale(0.7);
            transition: none;
            pointer-events: none;
            letter-spacing: 0.5px;
        `;
        this.messageEl.innerHTML = `
            <div style="font-size:28px;font-weight:900;color:#ffdd55;letter-spacing:1px;text-shadow:0 2px 10px rgba(255,221,85,0.45);line-height:1.1;">Congrats</div>
            <div style="font-size:32px;font-weight:900;color:#ffdd55;letter-spacing:2px;text-shadow:0 2px 10px rgba(255,221,85,0.45);">You got +5</div>
        `;
        this.overlay.appendChild(this.messageEl);  // ← appended to overlay, NOT boxWrap

        this.hintEl = document.createElement("div");
        this.hintEl.style.cssText = `
            margin-top: 14px;
            font-size: 20px;
            font-weight: 800;
            color: #ffdd55;
            text-shadow: 0 0 16px rgba(255, 221, 85, 0.55);
            transition: opacity 0.4s ease;
        `;
        this.hintEl.textContent = "Click the box to open";
        this.overlay.appendChild(this.hintEl);

        this.continueEl = document.createElement("div");
        this.continueEl.style.cssText = `
            margin-top: 12px;
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        this.continueEl.textContent = "CLICK TO CONTINUE";
        this.overlay.appendChild(this.continueEl);

        document.body.appendChild(this.overlay);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.overlay.addEventListener("click", this.handleOverlayClick);
    }

    createLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.0));
        const dir = new THREE.DirectionalLight(0xffffff, 0.7);
        dir.position.set(4, 6, 4);
        this.scene.add(dir);
        const dir2 = new THREE.DirectionalLight(0xffeedd, 0.3);
        dir2.position.set(-4, 2, -2);
        this.scene.add(dir2);
    }

    createBox() {
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.05 });
        const redMat   = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3,  metalness: 0.1  });
        const bowMat   = new THREE.MeshStandardMaterial({ color: 0xe00000, roughness: 0.15, metalness: 0.2  });

        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Box body
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 2.2), whiteMat);
        body.position.y = -0.1;
        this.group.add(body);

        // Red ribbon strips on body
        const rbV = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.02, 2.22), redMat);
        rbV.position.y = -0.1;
        this.group.add(rbV);
        const rbH = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.32, 2.22), redMat);
        rbH.position.y = -0.1;
        this.group.add(rbH);

        // Lid group — pivots from back edge
        this.lidGroup = new THREE.Group();
        this.lidGroup.position.set(0, 1.0, -1.1);
        this.group.add(this.lidGroup);

        const lid = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.38, 2.28), whiteMat);
        lid.position.set(0, 0, 1.1);
        this.lidGroup.add(lid);

        // Ribbon strips on lid
        const lidRbV = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 2.3), redMat);
        lidRbV.position.set(0, 0, 1.1);
        this.lidGroup.add(lidRbV);
        const lidRbH = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 0.32), redMat);
        lidRbH.position.set(0, 0, 1.1);
        this.lidGroup.add(lidRbH);

        // Bow loops
        const makeLoop = (rx, ry, rz, px, py, pz) => {
            const t = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 10, 22), bowMat);
            t.rotation.set(rx, ry, rz);
            t.position.set(px, py, pz);
            this.lidGroup.add(t);
        };
        makeLoop(Math.PI / 2, 0,  Math.PI / 5,  -0.28, 0.28, 1.1);
        makeLoop(Math.PI / 2, 0, -Math.PI / 5,   0.28, 0.28, 1.1);

        // Bow center knot
        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), bowMat);
        knot.position.set(0, 0.22, 1.1);
        this.lidGroup.add(knot);

        // Scale-in animation
        this.group.scale.set(0, 0, 0);
        let s = 0;
        const appear = () => {
            s = Math.min(s + 0.045, 1);
            this.group.scale.set(s, s, s);
            if (s < 1) requestAnimationFrame(appear);
        };
        appear();
    }

    animate() {
        const loop = () => {
            requestAnimationFrame(loop);
            if (!this.isOpening && !this.opened) {
                this.group.rotation.y += 0.006;
            }
            this.renderer.render(this.scene, this.camera);
        };
        loop();
    }

    open() {
        if (this.isOpening || this.opened) return;
        this.isOpening = true;
        this.hintEl.style.opacity = "0";

        let openAngle = 0;
        const maxAngle = Math.PI / 1.6;

        const step = () => {
            openAngle += 0.045;
            this.lidGroup.rotation.x = -Math.min(openAngle, maxAngle);
            if (openAngle < maxAngle) {
                requestAnimationFrame(step);
            } else {
                this.showMessage();
                this.spawnConfetti();
            }
        };
        step();
    }

    handleOverlayClick() {
        if (this.opened) {
            this.closeOverlay();
        } else {
            this.open();
        }
    }

    closeOverlay() {
        if (this.overlay) {
            this.overlay.removeEventListener("click", this.handleOverlayClick);
            this.overlay.remove();
        }
        window.dispatchEvent(new Event('game-resume'));
        this.onComplete("extra_score");
    }

    showMessage() {
        this.opened = true;

        // ✅ Animates up from below into final position
        this.messageEl.style.transition = "none";
        this.messageEl.style.opacity    = "0";
        this.messageEl.style.transform  = "translateY(30px) scale(0.7)";
        this.messageEl.innerHTML = `
            <div style="font-size:28px;font-weight:900;color:#ffdd55;letter-spacing:1px;text-shadow:0 2px 10px rgba(255,221,85,0.4);line-height:1.1;">Congrats</div>
            <div style="font-size:32px;font-weight:900;color:#ffdd55;letter-spacing:2px;text-shadow:0 2px 10px rgba(255,221,85,0.4);">You got +5</div>
        `;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.messageEl.style.transition = "transform 0.7s cubic-bezier(0.22, 1.4, 0.36, 1), opacity 0.4s ease";
                this.messageEl.style.transform  = "translateY(0px) scale(1)";
                this.messageEl.style.opacity    = "1";
            });
        });

        this.hintEl.style.opacity = "0";
        setTimeout(() => {
            this.continueEl.style.opacity = "1";
        }, 900);
    }

    spawnConfetti() {
        const colors = ["#cc0000", "#ff4444", "#ffcc00", "#ffffff", "#ff88aa", "#ffaacc"];
        for (let i = 0; i < 55; i++) {
            const el = document.createElement("div");
            const size = 6 + Math.random() * 8;
            el.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size * (Math.random() > 0.5 ? 2.5 : 1)}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? "50%" : "1px"};
                left: ${30 + Math.random() * 40}%;
                top: ${30 + Math.random() * 20}%;
                opacity: 1;
                transform: rotate(${Math.random() * 360}deg);
            `;
            this.confettiLayer.appendChild(el);

            const tx  = (Math.random() - 0.5) * 320;
            const ty  = -(80 + Math.random() * 200);
            const rot = (Math.random() - 0.5) * 720;

            setTimeout(() => {
                el.style.transition = `transform ${0.9 + Math.random() * 0.8}s ease-out, opacity 0.4s ease 0.8s`;
                el.style.transform  = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
                el.style.opacity    = "0";
                setTimeout(() => el.remove(), 2000);
            }, Math.random() * 300);
        }
    }
}

export default MysteryBox;