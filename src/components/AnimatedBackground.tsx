import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Left side decorative elements */}
      <div className="absolute left-0 inset-y-0 w-64">
        {/* Animated gradient blur */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Vertical sound waves */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`left-wave-${i}`}
            className="absolute bottom-1/4 h-32 w-1 rounded-full bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500"
            style={{ left: `${20 + i * 15}px` }}
            animate={{
              height: [100, 180 - i * 20, 100],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating music notes */}
        {["🎵", "🎼", "♪", "♫"].map((note, i) => (
          <motion.div
            key={`note-${i}`}
            className="absolute text-3xl text-indigo-600"
            style={{
              left: `${40 + i * 30}px`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-5, 5, -5],
              rotate: [0, 10, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {note}
          </motion.div>
        ))}
      </div>

      {/* Right side decorative elements */}
      <div className="absolute right-0 inset-y-0 w-64">
        {/* Animated gradient blur */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-l from-indigo-500/20 via-purple-500/20 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Pulsing circles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"
            style={{
              right: `${20 + i * 40}px`,
              top: `${30 + i * 20}%`,
              width: `${80 + i * 20}px`,
              height: `${80 + i * 20}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Voice wave animation */}
        <div className="absolute right-8 top-1/3">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`wave-${i}`}
              className="absolute w-1 rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500"
              style={{ right: `${i * 6}px` }}
              animate={{
                height: [
                  20 + Math.random() * 20,
                  50 + Math.random() * 40,
                  20 + Math.random() * 20,
                ],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Floating icons */}
        {["🎤", "🎧", "🌐", "🎙️"].map((icon, i) => (
          <motion.div
            key={`icon-${i}`}
            className="absolute text-4xl opacity-20"
            style={{
              right: `${30 + i * 40}px`,
              top: `${60 + i * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              rotate: [-5, 5, -5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {icon}
          </motion.div>
        ))}
      </div>

      {/* Background subtle waves */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),rgba(168,85,247,0.05),rgba(236,72,153,0.025))]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
