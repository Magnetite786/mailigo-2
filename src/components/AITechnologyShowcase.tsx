import { motion } from "framer-motion";

export function AITechnologyShowcase() {
  const aiTechnologies = [
    {
      name: "Gemini AI",
      image: "/src/assets/gemini.png",
      gradient: "from-purple-400/20 to-indigo-400/20"
    },
    {
      name: "ChatGPT",
      image: "/src/assets/chatgpt.png",
      gradient: "from-emerald-400/20 to-teal-400/20"
    },
    {
      name: "Claude AI",
      image: "/src/assets/claude.png",
      gradient: "from-orange-400/20 to-amber-400/20"
    },
    {
      name: "TensorFlow",
      image: "/src/assets/tensorflow.png",
      gradient: "from-blue-400/20 to-sky-400/20"
    },
    {
      name: "Midjourney",
      image: "/src/assets/midjourney.png",
      gradient: "from-pink-400/20 to-rose-400/20"
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Powered by Advanced AI Technologies
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform leverages cutting-edge AI models to deliver smarter email marketing solutions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-3 md:grid-cols-5 gap-6 items-center justify-items-center">
            {aiTechnologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`w-full flex flex-col items-center rounded-lg p-4 bg-gradient-to-br ${tech.gradient} border border-gray-100`}
              >
                <div className="h-16 w-16 relative flex items-center justify-center mb-3">
                  <img 
                    src={tech.image} 
                    alt={tech.name} 
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-800">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 