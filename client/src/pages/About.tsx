import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Heart, Shield, Smile, Star, MapPin, Phone, Image as ImageIcon, CalendarClock } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { GoogleDriveImage } from "@/components/ui/GoogleDriveImage";

export default function About() {
  const { siteSettings } = useApp();
  const history = siteSettings.history || [];
  const philosophy = siteSettings.philosophy && siteSettings.philosophy.length > 0
    ? siteSettings.philosophy
    : [
        { title: "안전", desc: "몸과 마음이 안전한 환경에서 생활합니다." },
        { title: "배려", desc: "서로를 존중하고 사랑하는 마음을 배웁니다." },
        { title: "성장", desc: "스스로 할 수 있는 힘과 자신감을 키웁니다." },
        { title: "창의", desc: "자유로운 상상으로 세상을 탐색합니다." },
      ];
  const facilityImages = siteSettings.facilityImages || [];
  const signature = siteSettings.greetingSignature || "코코베베어린이집 박윤희 원장";

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <div className="bg-orange-50 py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-display mb-4">어린이집 소개</h1>
           <p className="text-gray-600">코코베베어린이집의 따뜻한 이야기를 전해드립니다.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <Tabs defaultValue="greeting" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-12 h-auto bg-white p-1 rounded-xl border border-orange-100 shadow-sm">
            <TabsTrigger value="greeting" className="py-3 text-base data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">원장 인사말</TabsTrigger>
            <TabsTrigger value="philosophy" className="py-3 text-base data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">교육철학</TabsTrigger>
            <TabsTrigger value="facility" className="py-3 text-base data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">시설안내</TabsTrigger>
            <TabsTrigger value="history" className="py-3 text-base data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">연혁</TabsTrigger>
            <TabsTrigger value="location" className="py-3 text-base data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">오시는 길</TabsTrigger>
          </TabsList>

          <TabsContent value="greeting" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
               <div className="w-full md:w-1/3 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden relative">
                  {siteSettings.greetingImageUrl ? (
                    <GoogleDriveImage 
                      src={siteSettings.greetingImageUrl} 
                      alt="원장 인사말" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                       <span className="text-center">원장님 사진<br/>(업로드해주세요)</span>
                  </div>
                  )}
               </div>
               <div className="w-full md:w-2/3">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-display mb-6">
                     {siteSettings.greetingTitle}
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                     <p>{siteSettings.greetingMessage}</p>
                     <p>{siteSettings.aboutDescription}</p>
                     <p className="pt-4 font-bold text-gray-800">{signature}</p>
                  </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="philosophy" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {philosophy.map((item, idx) => (
                   <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                     <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 bg-orange-50 text-orange-500">
                        <Star className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 font-display">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                   </div>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="facility" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {(facilityImages.length > 0 ? facilityImages : [ { title: "시설 사진", url: "", desc: "시설 사진을 등록해주세요." }]).map((img, i) => (
                  <div key={`${img.title}-${i}`} className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group">
                     {img.url ? (
                       <GoogleDriveImage 
                         src={img.url} 
                         alt={img.title} 
                         className="w-full h-full object-cover"
                       />
                     ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                          <span className="font-medium">시설 사진 등록 필요</span>
                      </div>
                     )}
                      <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                        <h4 className="font-bold">{img.title}</h4>
                        <p className="text-sm opacity-90">{img.desc || "아이들을 위한 쾌적한 공간입니다."}</p>
                      </div>
                   </div>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <p className="text-sm text-orange-500 font-semibold uppercase tracking-wide">Cocobebe Timeline</p>
                  <h3 className="text-2xl font-bold text-gray-800">함께 걸어온 길</h3>
                  <p className="text-sm text-gray-500 mt-1">아이들과 함께 쌓아온 성장의 발자취</p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  <CalendarClock className="w-4 h-4" /> {history.length}개의 기록
                </span>
              </div>

              {history.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  등록된 연혁이 없습니다. 관리자에서 추가해주세요.
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-8 top-2 bottom-2 w-px bg-gradient-to-b from-orange-200 via-orange-100 to-orange-300" />
                  <div className="space-y-6">
                    {history.map((item, idx) => (
                      <motion.div
                        key={`${item.year}-${idx}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative pl-16"
                      >
                        <div className="absolute left-4 top-2 w-8 h-8 rounded-full bg-white border-2 border-orange-100 shadow-sm flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-pink-400" />
                        </div>
                        <div className="bg-gradient-to-r from-orange-50/80 via-white to-white border border-orange-100 rounded-xl p-4 shadow-[0_8px_20px_rgba(255,145,77,0.08)]">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full border border-orange-200">
                              {item.year}
                            </span>
                            <span className="text-xs text-gray-400">STEP {String(idx + 1).padStart(2, "0")}</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{item.title}</p>
                          {item.desc && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.desc}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="location" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                
                
                <div className="p-4 grid md:grid-cols-2 gap-8">
                   <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">코코베베어린이집</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-3">
                           <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                           <span>{siteSettings.address}</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                           <span>{siteSettings.phone}</span>
                        </li>
                      </ul>
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}
