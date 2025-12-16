import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/lib/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { GoogleDriveImage } from "@/components/ui/GoogleDriveImage";

export default function Notices() {
  const { posts, classes } = useApp();
  
  // 공지사항 (notice 타입만)
  const notices = posts
    .filter((p) => p.type === "notice")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // 행사 안내 (event 타입만)
  const events = posts
    .filter((p) => p.type === "event")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // 식단표 (menu 타입만)
  const menus = posts
    .filter((p) => p.type === "menu")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <div className="bg-blue-50 py-12 mb-8">
         <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-display mb-4">알림마당</h1>
            <p className="text-gray-600">어린이집의 새로운 소식과 행사 일정을 확인하세요.</p>
         </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
         <Tabs defaultValue="notices" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12">
               <TabsTrigger value="notices">공지사항</TabsTrigger>
               <TabsTrigger value="events">행사안내</TabsTrigger>
               <TabsTrigger value="menus">식단표</TabsTrigger>
            </TabsList>

            <TabsContent value="notices">
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {notices.length > 0 ? (
                    <>
                  <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 text-sm font-bold text-gray-500 border-b border-gray-200">
                     <div className="col-span-1 text-center">번호</div>
                     <div className="col-span-2 text-center">분류</div>
                     <div className="col-span-6">제목</div>
                     <div className="col-span-2 text-center">작성자</div>
                     <div className="col-span-1 text-center">날짜</div>
                  </div>
                      {notices.map((notice, idx) => (
                     <div key={notice.id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className="hidden md:block col-span-1 text-center text-gray-400">{idx + 1}</div>
                        <div className="col-span-2 text-center mb-2 md:mb-0">
                           <span className={cn(
                              "inline-block px-2 py-1 rounded text-xs font-bold",
                                  "bg-blue-100 text-blue-600"
                           )}>
                                  공지
                           </span>
                        </div>
                        <div className="col-span-12 md:col-span-6 font-medium text-gray-700 group-hover:text-orange-600 transition-colors mb-2 md:mb-0">
                           {notice.title}
                        </div>
                        <div className="col-span-6 md:col-span-2 text-sm text-gray-500 md:text-center">{notice.author}</div>
                        <div className="col-span-6 md:col-span-1 text-sm text-gray-400 text-right md:text-center">{notice.date}</div>
                     </div>
                  ))}
                    </>
                  ) : (
                    <div className="p-12 text-center text-gray-400">
                      등록된 공지사항이 없습니다.
               </div>
                  )}
               </div>
            </TabsContent>

            <TabsContent value="events">
               {events.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                      const eventDate = new Date(event.date);
                      const month = eventDate.toLocaleDateString('ko-KR', { month: 'long' });
                      return (
                        <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex flex-col items-center justify-center shrink-0 text-orange-600">
                           <span className="text-xs font-bold">MONTH</span>
                             <span className="text-xl font-bold font-display">{month}</span>
                        </div>
                          <div className="flex-1">
                           <h3 className="font-bold text-lg text-gray-800 mb-2">{event.title}</h3>
                             <p className="text-sm text-gray-500 mb-2 line-clamp-2">{event.content}</p>
                             <p className="text-xs text-gray-400">{event.date}</p>
                             {event.classId && (
                               <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                 {classes.find(c => c.id === event.classId)?.name || '전체'}
                               </span>
                             )}
                          </div>
                        </div>
                      );
                    })}
                     </div>
               ) : (
                 <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
                   등록된 행사 안내가 없습니다.
               </div>
               )}
            </TabsContent>

            <TabsContent value="menus">
               {menus.length > 0 ? (
               <div className="space-y-6">
                    {menus.map((menu) => (
                        <div key={menu.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-xl text-gray-800 mb-2">{menu.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{menu.author}</span>
                                <span>•</span>
                                <span>{menu.date}</span>
                              </div>
                            </div>
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                              식단표
                            </span>
                          </div>
                          {menu.content && (
                            <p className="text-gray-600 mb-4">{menu.content}</p>
                          )}
                          {menu.images && menu.images[0] && (
                            <div className="mt-4">
                              <GoogleDriveImage
                                src={menu.images[0]}
                                alt={menu.title}
                                className="w-full h-auto rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                     </div>
                  ))}
                     </div>
               ) : (
                 <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
                   등록된 식단표가 없습니다.
               </div>
               )}
            </TabsContent>
         </Tabs>
      </div>

      <Footer />
    </div>
  );
}
