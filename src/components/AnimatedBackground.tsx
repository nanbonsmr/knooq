import { memo } from 'react';

const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute top-1/4 left-[10%] w-32 h-32 rounded-full bg-primary/10 blur-xl animate-float" />
      <div className="absolute top-1/3 right-[15%] w-24 h-24 rounded-full bg-accent/15 blur-lg animate-float-delayed" />
      <div className="absolute bottom-1/4 left-[20%] w-40 h-40 rounded-full bg-primary/8 blur-2xl animate-float-slow" />
      <div className="absolute bottom-1/3 right-[10%] w-28 h-28 rounded-full bg-accent/10 blur-xl animate-float-delayed-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
    </div>
  );
});

export default AnimatedBackground;
