import { useEffect } from 'react';
import gsap from 'gsap';

export function useMagneticCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.id = 'magnetic-cursor';
    cursor.style.position = 'fixed';
    cursor.style.top = '0';
    cursor.style.left = '0';
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(0, 242, 254, 0.5)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.mixBlendMode = 'screen';
    cursor.style.boxShadow = '0 0 20px rgba(0, 242, 254, 0.8)';
    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Smooth lerp loop using GSAP ticker
    const updateCursor = () => {
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.15,
        ease: "power2.out"
      });
    };

    gsap.ticker.add(updateCursor);

    // Magnetic elements logic
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach((el) => {
      const magnet = el as HTMLElement;
      
      magnet.addEventListener('mousemove', (e) => {
        const rect = magnet.getBoundingClientRect();
        const h = rect.width / 2;
        const v = rect.height / 2;
        
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - v;
        
        // Move element slightly
        gsap.to(magnet, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.4,
          ease: "power2.out"
        });
        
        // Expand cursor
        gsap.to(cursor, {
          scale: 3,
          backgroundColor: 'rgba(138, 43, 226, 0.3)',
          duration: 0.3
        });
      });
      
      magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
        
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: 'rgba(0, 242, 254, 0.5)',
          duration: 0.3
        });
      });
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      gsap.ticker.remove(updateCursor);
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor);
      }
    };
  }, []);
}
