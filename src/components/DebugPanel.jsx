import { useEffect, useState, useRef } from "react";

function DebugPanel() {
  const [fps, setFps] = useState("0.00");
  const [elapsed, setElapsed] = useState("0.00");
  const [simCpu, setSimCpu] = useState("0.00");
  const [simMem, setSimMem] = useState("0.00");

  const startTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());

  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Update simulated CPU / memory values
      setSimCpu((10 + Math.random() * 40).toFixed(2));
      setSimMem((100 + Math.random() * 400).toFixed(2));
    }, 1000);

    function loop(now) {
      frameCountRef.current++;
      const elapsedMs = now - startTimeRef.current;
      setElapsed((elapsedMs / 1000).toFixed(2));

      if (now - lastFpsUpdateRef.current >= 1000) {
        const deltaSec = (now - lastFpsUpdateRef.current) / 1000;
        const currentFps = frameCountRef.current / deltaSec;
        setFps(currentFps.toFixed(2));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "5px",
        padding: "0.5rem 1rem",
        background: "rgba(0, 0, 0, 0.7)",
        color: "lime",
        fontSize: "0.9rem",
        fontFamily: "monospace",
        borderRadius: "4px",
        zIndex: 1000
      }}
    >
      <div>FPS: {fps}</div>
      <div>Elapsed: {elapsed}s</div>
      <div>CPU: {simCpu}%</div>
      <div>Memory: {simMem} MB</div>
    </div>
  );
}

export default DebugPanel;