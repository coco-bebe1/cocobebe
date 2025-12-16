import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClassCard } from "@/components/ui/ClassCard";
import { CLASSES } from "@/lib/mockData";
import heroImage from "@assets/generated_images/warm_sunny_kindergarten_classroom_background.png";
import { ArrowRight, Bell, Calendar, MapPin, ExternalLink, Baby } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/AppContext";
import { useEffect, useRef } from "react";
import { GoogleDriveImage } from "@/components/ui/GoogleDriveImage";

export default function Home() {
  const { siteSettings, currentUser, classes, posts, albumPhotos } = useApp();
  const [location] = useLocation();
  const classSectionRef = useRef<HTMLDivElement | null>(null);
  const classData = classes && classes.length > 0 ? classes : CLASSES;
  const noticePosts = posts
    .filter((p) => p.type === "notice" || p.type === "event")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // 최근 활동 사진을 날짜 기준 최신순으로 정렬
  const recentAlbumPhotos = albumPhotos
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
  
  const filteredClasses =
    currentUser?.role === "parent" && currentUser.child?.classId
      ? classData.filter((cls) => cls.id === currentUser.child?.classId)
      : classData;

  useEffect(() => {
    if (location === "/classes" && classSectionRef.current) {
      classSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Kindergarten Classroom" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              아이들이 날마다 행복해지는 곳,<br />
              <span className="text-orange-200">코코베베어린이집</span>
            </h1>
            <p className="text-lg md:text-xl font-medium mb-8 text-white/90 max-w-2xl mx-auto drop-shadow-md">
              따뜻한 사랑과 배려 속에서 아이들의 꿈이 자라납니다.
            </p>
            
          </motion.div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full leading-none z-20">
          <svg className="relative block w-full h-[60px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
          </svg>
        </div>
      </section>

      {/* Intro Summary */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <span className="text-orange-500 font-bold tracking-wider uppercase text-sm mb-2 block">About Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 font-display">
              코코베베는 어떤 곳인가요?
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              코코베베어린이집은 아이들의 눈높이에서 생각하고, 
              부모님의 마음으로 보살피는 행복한 배움터입니다.
              자연 친화적인 환경과 아이 중심의 교육 과정으로 
              건강한 몸과 마음을 키워갑니다.
            </p>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section ref={classSectionRef} className="py-20 bg-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-display">우리 반을 소개합니다</h2>
            <p className="text-gray-500">연령별 맞춤 교육으로 성장하는 코코베베 어린이들</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredClasses.map((cls) => {
              // Ensure Icon is a valid React component
              let Icon = Baby;
              if (cls.icon) {
                // Check if icon is a function (React component)
                if (typeof cls.icon === 'function') {
                  Icon = cls.icon;
                } else if (cls.icon && typeof cls.icon === 'object' && 'default' in cls.icon) {
                  Icon = cls.icon.default;
                }
              }
              return (
              <Link key={cls.id} href={`/classes/${cls.id}`} className="block h-full">
                <ClassCard
                  id={cls.id}
                  name={cls.name}
                  age={cls.age}
                  description={cls.description}
                  color={cls.color}
                    Icon={Icon}
                />
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notices & Album */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Notices */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
                  <Bell className="text-orange-500" /> 공지사항
                </h2>
                <Link href="/notices" className="text-sm text-gray-500 hover:text-orange-500 font-medium">
                  더보기 +
                </Link>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {noticePosts.map((notice, idx) => (
                  <div key={notice.id} className={cn(
                    "p-4 flex items-center justify-between group cursor-pointer hover:bg-orange-50 transition-colors",
                    idx !== noticePosts.length - 1 && "border-b border-gray-100"
                  )}>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded font-bold",
                        notice.type === 'event' ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {notice.type === 'event' ? '행사' : '공지'}
                      </span>
                      <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors line-clamp-1">
                        {notice.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{notice.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Album */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
                  <Calendar className="text-orange-500" /> 최근 활동
                </h2>
                <Link href="/album" className="text-sm text-gray-500 hover:text-orange-500 font-medium">
                  더보기 +
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {recentAlbumPhotos.length > 0 ? (
                  recentAlbumPhotos.map((img) => (
                  <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer">
                      <GoogleDriveImage 
                      src={img.url} 
                      alt={img.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-sm font-bold">{img.title}</span>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-gray-400">
                    등록된 활동 사진이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <Footer />
    </div>
  );
}
