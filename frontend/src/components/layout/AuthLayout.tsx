import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Left side - Brand imagery */}
      <div className="hidden md:flex md:w-3/5 bg-primary p-8 text-white flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <MessageSquare size={32} />
          <span className="text-2xl font-bold">WebChat</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col gap-8"
        >
          <h1 className="text-4xl font-bold text-white">
          Your Digital Brain on Rocket Fuel! 🚀
          </h1>
          <p className="text-xl text-white/80">
            Crawl websites, query content with AI, and build your knowledge base - all in one place.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">🌐 Website Crawling</h3>
              <p className="text-white/80">Turn the entire internet into your personal library—snatch content from any site, index it, and make it bow to your command.</p>
            </div>
            <div className="bg-white/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">🤖 AI-Powered Queries</h3>
              <p className="text-white/80">Ask anything. Get genius-level answers. Watch your content spill its secrets like a chatty robot sidekick.

</p>
            </div>
            <div className="bg-white/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">🧠 Cybernetic Brain Upgrade!</h3>
              <p className="text-white/80">Organize chaos. Dominate information. Access everything at warp speed—like a librarian on espresso shots.</p>
            </div>
            <div className="bg-white/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">🔒 Secure & Private</h3>
              <p className="text-white/80">Your data’s locked down tighter than a secret villain lair.</p>
            </div>
          </div>
        </motion.div>
        
        <br></br>
        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5, delay: 0.6 }}
  className="text-sm text-white/60"
>
  👉 Get WebChat Now – Before Your Competition Does! 👈
</motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-sm text-white/60"
        >
          Made with ❤️ by Aryan!.
        </motion.div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;