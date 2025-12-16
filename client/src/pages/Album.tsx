import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/lib/AppContext";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GoogleDriveImage } from "@/components/ui/GoogleDriveImage";

export default function Album() {
  const { albumPhotos, classes } = useApp();

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <div className="bg-yellow-50 py-12 mb-8">
         <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-display mb-4">활동 앨범</h1>
            <p className="text-gray-600">아이들의 행복한 순간들을 기록합니다.</p>
         </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albumPhotos.map((img, idx) => (
               <motion.div 
                  key={img.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm cursor-pointer"
               >
                  <GoogleDriveImage 
                     src={img.url} 
                     alt={img.title} 
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2">
                      {img.classId && (
                          <Badge variant="secondary" className="bg-white/80 backdrop-blur text-xs">
                              {classes.find(c => c.id === img.classId)?.name || '전체'}
                          </Badge>
                      )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                     <h3 className="text-white font-bold text-lg">{img.title}</h3>
                     <p className="text-white/80 text-xs">{img.date}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      <Footer />
    </div>
  );
}
