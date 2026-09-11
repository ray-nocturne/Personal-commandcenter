import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, stars, raf;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.floor((w * h) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        s: Math.random() * 0.015 + 0.003,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.82 ? "177,140,255" : "79,224,255",
      }));
    }

    function tick(t) {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((st) => {
        const alpha = 0.15 + Math.abs(Math.sin(t * st.s + st.phase)) * 0.45;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${st.hue},${alpha})`;
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="stars" />
      <div className="grid-overlay" />
      <div className="scanline" />
    </>
  );
}
