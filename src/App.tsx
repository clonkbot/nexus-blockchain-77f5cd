import { useEffect, useState, useRef } from 'react';
import './styles.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface Connection {
  from: number;
  to: number;
  opacity: number;
}

function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const connections: Connection[] = [];

      // Update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Find connections
        particles.forEach((other) => {
          if (p.id >= other.id) return;
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            connections.push({
              from: p.id,
              to: other.id,
              opacity: (1 - dist / 150) * 0.4,
            });
          }
        });
      });

      // Draw connections
      connections.forEach((conn) => {
        const from = particles[conn.from];
        const to = particles[conn.to];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = `rgba(0, 255, 213, ${conn.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 213, ${p.opacity})`;
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `rgba(0, 255, 213, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 255, 213, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" />;
}

function GlitchText({ children, className = '' }: { children: string; className?: string }) {
  return (
    <span className={`glitch-wrapper ${className}`}>
      <span className="glitch" data-text={children}>{children}</span>
    </span>
  );
}

function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`stat ${visible ? 'stat-visible' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`feature-card ${visible ? 'feature-visible' : ''}`}>
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <div className="feature-glow" />
    </div>
  );
}

function TerminalWindow() {
  const [lines, setLines] = useState<string[]>([]);
  const fullLines = [
    '> initializing NEXUS protocol...',
    '> connecting to agent mesh network',
    '> consensus: NEURAL_PROOF_OF_WORK',
    '> agents online: 47,892',
    '> transactions/sec: 125,000',
    '> status: OPERATIONAL',
  ];

  useEffect(() => {
    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < fullLines.length) {
        setLines(prev => [...prev, fullLines[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="terminal-dot red" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-title">nexus-cli v0.1.0</span>
      </div>
      <div className="terminal-body">
        {lines.map((line, i) => (
          <div key={i} className="terminal-line">
            {line}
            {i === lines.length - 1 && <span className="cursor" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="app">
      <NeuralBackground />

      <div className="noise-overlay" />
      <div className="scan-line" />

      <header className={`header ${loaded ? 'header-visible' : ''}`}>
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">NEXUS</span>
        </div>
        <nav className="nav">
          <a href="#protocol" className="nav-link">Protocol</a>
          <a href="#agents" className="nav-link">Agents</a>
          <a href="#docs" className="nav-link">Docs</a>
          <button className="btn-connect">
            <span className="btn-text">Launch App</span>
            <span className="btn-glow" />
          </button>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <div className="hero-content">
            <div className={`hero-badge ${loaded ? 'badge-visible' : ''}`}>
              <span className="pulse-dot" />
              MAINNET LIVE
            </div>

            <h1 className={`hero-title ${loaded ? 'title-visible' : ''}`}>
              <GlitchText>The Neural</GlitchText>
              <br />
              <span className="hero-title-accent">Blockchain</span>
              <br />
              <span className="hero-title-sub">for Autonomous AI</span>
            </h1>

            <p className={`hero-description ${loaded ? 'desc-visible' : ''}`}>
              Purpose-built infrastructure for AI agents to transact,
              coordinate, and evolve. Zero latency. Infinite scale.
              Machine-native consensus.
            </p>

            <div className={`hero-actions ${loaded ? 'actions-visible' : ''}`}>
              <button className="btn-primary">
                <span>Deploy Agent</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button className="btn-secondary">
                Read Whitepaper
              </button>
            </div>
          </div>

          <div className={`hero-visual ${loaded ? 'visual-visible' : ''}`}>
            <TerminalWindow />
          </div>
        </section>

        <section className="stats-section">
          <Stat value="$2.4B" label="Total Value Locked" delay={800} />
          <Stat value="125K" label="TPS Capacity" delay={1000} />
          <Stat value="47.8K" label="Active Agents" delay={1200} />
          <Stat value="0.001s" label="Finality" delay={1400} />
        </section>

        <section className="features-section">
          <div className="section-header">
            <span className="section-tag">CORE PROTOCOL</span>
            <h2 className="section-title">Engineered for Machine Intelligence</h2>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon="◉"
              title="Neural Consensus"
              description="Proof-of-Intelligence mechanism that validates transactions through distributed AI reasoning, achieving consensus in milliseconds."
              delay={600}
            />
            <FeatureCard
              icon="⬡"
              title="Agent Mesh Network"
              description="Peer-to-peer infrastructure allowing AI agents to discover, communicate, and coordinate without central orchestration."
              delay={800}
            />
            <FeatureCard
              icon="◇"
              title="Compute Sharding"
              description="Dynamic resource allocation that scales processing power based on agent demand, ensuring zero congestion."
              delay={1000}
            />
            <FeatureCard
              icon="△"
              title="Memory Markets"
              description="Decentralized marketplace for AI context and knowledge, enabling agents to trade and monetize learned experiences."
              delay={1200}
            />
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Build the Future?</h2>
            <p className="cta-description">
              Join thousands of developers building autonomous AI systems on NEXUS.
            </p>
            <div className="cta-input-group">
              <input
                type="email"
                placeholder="Enter your email"
                className="cta-input"
              />
              <button className="btn-primary">
                Get Early Access
              </button>
            </div>
          </div>
          <div className="cta-decoration">
            <div className="hex-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="hex" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="logo-icon">◈</span>
            <span className="logo-text">NEXUS</span>
          </div>
          <div className="footer-links">
            <a href="#github">GitHub</a>
            <a href="#discord">Discord</a>
            <a href="#twitter">Twitter</a>
            <a href="#docs">Documentation</a>
          </div>
        </div>
        <div className="footer-attribution">
          Requested by @mayursamr · Built by @clonkbot
        </div>
      </footer>
    </div>
  );
}

export default App;
