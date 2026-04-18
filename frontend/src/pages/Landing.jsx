import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen">
      <header className="container mx-auto px-6 py-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-5xl font-extrabold text-gray-800 mb-6"
        >
          Manage College Events <span className="text-indigo-600">Smarter</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
        >
          Your AI-powered assistant for scheduling, volunteering, and real-time event updates.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-indigo-700 transition">Join as Volunteer</Link>
          <Link to="/events" className="bg-white text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-50 transition">View Events</Link>
        </motion.div>
      </header>

      <section className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {[
          { title: "Smart Scheduling", desc: "Never miss an event with AI-curated timelines." },
          { title: "Volunteer Guide", desc: "Real-time duty assignments and instructions." },
          { title: "Instant Updates", desc: "Get notified about venue changes instantly." }
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Landing;
