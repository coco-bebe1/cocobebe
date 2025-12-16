import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClassCardProps {
  id: string;
  name: string;
  age: string;
  description: string;
  color: string;
  Icon: any;
  onClick?: () => void;
}

export function ClassCard({ id, name, age, description, color, Icon, onClick }: ClassCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 border-2 transition-all cursor-pointer bg-white hover:shadow-lg",
        // Extract color theme (simple check)
        color.includes("yellow") ? "border-yellow-100 hover:border-yellow-300" :
        color.includes("orange") ? "border-orange-100 hover:border-orange-300" :
        color.includes("pink") ? "border-pink-100 hover:border-pink-300" :
        color.includes("blue") ? "border-blue-100 hover:border-blue-300" :
        "border-green-100 hover:border-green-300"
      )}
      onClick={onClick}
    >
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", color)}>
        {Icon && typeof Icon === 'function' ? (
        <Icon className="w-6 h-6" />
        ) : (
          <span className="text-2xl">📚</span>
        )}
      </div>
      
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-display font-bold text-xl text-gray-800">{name}</h3>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">{age}</span>
      </div>
      
      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
        자세히 보기 &rarr;
      </div>

      {/* Decorative background pattern */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 bg-current" />
    </motion.div>
  );
}
