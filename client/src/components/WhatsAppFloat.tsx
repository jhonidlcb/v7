
import { motion } from "framer-motion";
import whatsappIcon from "@assets/whatsapp_1758627462528.png";

export default function WhatsAppFloat() {
  const whatsappNumber = "+595985990046";
  const message = "¡Hola! Me interesa conocer más sobre sus servicios de desarrollo de software.";
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[80px] max-h-[80px]"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.button
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="whatsapp-float"
        style={{ width: '72px', height: '72px' }}
      >
        <img src={whatsappIcon} alt="WhatsApp" className="h-7 w-7 sm:h-8 sm:w-8 relative z-10 brightness-0 invert" />
        
        {/* Tooltip - Only show on desktop */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap hidden sm:block pointer-events-none">
          ¡Contáctanos por WhatsApp!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
      </motion.button>
    </motion.div>
  );
}
