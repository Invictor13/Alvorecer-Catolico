let particlesMaterial = null;

    function initThreeAmbient(canvasId = 'ambient-canvas', isSplash = false) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);

      const geometry = new THREE.BufferGeometry();
      const baseCount = document.documentElement.classList.contains('dark') ? 200 : 120;
      const particlesCount = isSplash ? baseCount * 2 : baseCount;
      const posArray = new Float32Array(particlesCount * 3);

      for(let i=0; i<particlesCount*3; i++) { posArray[i] = (Math.random() - 0.5) * 12; }
      geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.04,
        color: isSplash ? 0xfbbf24 : 0x2563eb, // Gold for splash, blue for ambient
        transparent: true,
        opacity: isSplash ? 0.7 : 0.5
      });

      if (!isSplash) {
        particlesMaterial = mat;
      }

      const particlesMesh = new THREE.Points(geometry, mat);
      scene.add(particlesMesh);

      function animate() {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.0008;
        particlesMesh.rotation.x += 0.0004;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        if (!canvas.clientWidth) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      });
    }

    function updateParticleColor(hexColor) {
      if(particlesMaterial) {
        // Transição suave de cor da partícula usando Tweening manual
        const targetColor = new THREE.Color(hexColor);
        const currentColor = particlesMaterial.color;
        let step = 0;
        const interval = setInterval(() => {
          step += 0.05;
          currentColor.lerp(targetColor, step);
          if(step >= 1) clearInterval(interval);
        }, 30);
      }
    }
export { initThreeAmbient, updateParticleColor };
