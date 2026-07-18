import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

/* ─── Tiny network visualization ──────────────────────────────────── */

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  label: string;
}

function HeroNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = 520;
    const H = 360;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const labels = [
      "TCP/IP", "Routing", "OSI Model", "HTTP",
      "DNS", "Algorithms", "Data Structures", "Networking",
    ];

    if (dotsRef.current.length === 0) {
      dotsRef.current = labels.map((label) => ({
        x: 60 + Math.random() * (W - 120),
        y: 50 + Math.random() * (H - 100),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        label,
      }));
    }

    const dots = dotsRef.current;
    const connectionDist = 180;

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Edges
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = 1 - dist / connectionDist;
            ctx!.strokeStyle = `rgba(37, 99, 235, ${alpha * 0.15})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.stroke();
          }
        }
      }

      // Nodes
      for (const dot of dots) {
        // Card background
        const tw = ctx!.measureText(dot.label).width + 20;
        const th = 28;
        ctx!.fillStyle = "#FFFFFF";
        ctx!.strokeStyle = "#E8E8E5";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.roundRect(dot.x - tw / 2, dot.y - th / 2, tw, th, 6);
        ctx!.fill();
        ctx!.stroke();

        // Label
        ctx!.fillStyle = "#1A1A1A";
        ctx!.font = "500 11px Inter, system-ui, sans-serif";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(dot.label, dot.x, dot.y);
      }

      // Move
      for (const dot of dots) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 50 || dot.x > W - 50) dot.vx *= -1;
        if (dot.y < 30 || dot.y > H - 30) dot.vy *= -1;
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} className="block mx-auto" />;
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-base font-semibold tracking-tight text-text-primary no-underline">
            SnapMind
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-[13px] text-text-secondary hover:text-text-primary no-underline hidden sm:inline">
              How it works
            </a>
            <Link to="/app/explore" className="text-[13px] text-text-secondary hover:text-text-primary no-underline hidden sm:inline">
              Explore
            </Link>
            <Link to="/login" className="text-[13px] text-text-secondary hover:text-text-primary no-underline">
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-[13px] font-medium bg-text-primary text-white px-4 py-1.5 rounded-md hover:opacity-90 no-underline"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-5 text-text-primary">
          Your knowledge,
          <br />
          connected.
        </h1>
        <p className="text-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
          Capture notes, screenshots, diagrams, and ideas.
          <br className="hidden sm:inline" />
          SnapMind finds the connections between them.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-text-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 no-underline"
          >
            Start building your knowledge
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary no-underline px-4 py-2.5"
          >
            See how it works →
          </a>
        </div>

        {/* Network visual */}
        <div className="mt-16">
          <HeroNetwork />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <h2 className="text-2xl font-semibold text-center mb-16 tracking-tight">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                step: "01",
                title: "Capture",
                desc: "Upload anything you want to remember — notes, screenshots, diagrams, textbook pages.",
              },
              {
                step: "02",
                title: "Connect",
                desc: "SnapMind reads your images and finds relationships between what you've captured.",
              },
              {
                step: "03",
                title: "Recall",
                desc: "Search your knowledge and follow the connections to rediscover what you know.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center md:text-left">
                <span className="text-[13px] font-mono text-accent mb-3 block">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-semibold text-center mb-4 tracking-tight">
          A workspace for your knowledge
        </h2>
        <p className="text-sm text-text-secondary text-center mb-12 max-w-md mx-auto">
          Upload images, search by concept, explore connections, and visualize your knowledge graph.
        </p>

        {/* Mockup */}
        <div className="border border-border rounded-xl overflow-hidden bg-surface shadow-sm">
          <div className="flex">
            {/* Sidebar mock */}
            <div className="w-48 border-r border-border p-4 hidden md:block bg-surface">
              <p className="text-[13px] font-semibold text-text-primary mb-4">SnapMind</p>
              <div className="space-y-1">
                {["⌂ Home", "⌕ Search", "↗ Explore", "◎ Graph"].map((item) => (
                  <div
                    key={item}
                    className={`text-[12px] px-2 py-1 rounded ${
                      item.includes("Home")
                        ? "bg-accent-light text-accent font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Content mock */}
            <div className="flex-1 p-6">
              <div className="mb-4">
                <div className="h-8 bg-bg-secondary rounded-md w-48 mb-1" />
                <div className="h-4 bg-bg-tertiary rounded w-64" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-bg-secondary rounded-md border border-border" />
                ))}
              </div>
              <div className="flex gap-2">
                <div className="h-3 bg-bg-tertiary rounded w-20" />
                <div className="h-3 bg-bg-tertiary rounded w-16" />
                <div className="h-3 bg-bg-tertiary rounded w-24" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">
            Start building your knowledge network.
          </h2>
          <p className="text-sm text-text-secondary mb-8">
            Capture what you learn. Let SnapMind connect the dots.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-text-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 no-underline"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-[12px] text-text-tertiary">SnapMind</span>
          <span className="text-[12px] text-text-tertiary">Local-first knowledge management</span>
        </div>
      </footer>
    </div>
  );
}
