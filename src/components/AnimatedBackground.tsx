import { motion } from "framer-motion";

interface FloatingShape {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  shape: 'circle' | 'triangle' | 'line';
  color: string;
}

const AnimatedBackground = () => {
  // Generate fewer floating shapes for better performance
  const shapes: FloatingShape[] = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 50 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 20,
    delay: Math.random() * 3,
    shape: ['circle', 'triangle', 'line'][Math.floor(Math.random() * 3)] as 'circle' | 'triangle' | 'line',
    color: Math.random() > 0.5 ? 'rgba(0, 181, 173, 0.15)' : 'rgba(26, 54, 93, 0.1)',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Animated Gradient Mesh */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(26, 54, 93, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0, 181, 173, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(245, 246, 250, 0.1) 0%, transparent 70%)
          `,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating Micro-Shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute will-change-transform"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            y: [-30, -80],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {shape.shape === 'circle' && (
            <div
              className="rounded-full"
              style={{
                width: shape.size,
                height: shape.size,
                background: shape.color,
              }}
            />
          )}
          {shape.shape === 'triangle' && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${shape.size / 2}px solid transparent`,
                borderRight: `${shape.size / 2}px solid transparent`,
                borderBottom: `${shape.size}px solid ${shape.color}`,
              }}
            />
          )}
          {shape.shape === 'line' && (
            <div
              style={{
                width: shape.size,
                height: 2,
                background: shape.color,
              }}
            />
          )}
        </motion.div>
      ))}

      {/* Gradient Glow Effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 181, 173, 0.18) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Additional Pulsing Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 181, 173, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(26, 54, 93, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;