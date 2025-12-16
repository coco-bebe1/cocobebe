import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link, useRoute } from "wouter";
import { Clock, Calendar, FileText, Image as ImageIcon, MessageCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/AppContext";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleDriveImage } from "@/components/ui/GoogleDriveImage";

export default function ClassPage() {
  const [match, params] = useRoute("/classes/:id");
  const { currentUser, posts, classes, teachers, registeredChildren } = useApp();
  const [activeTab, setActiveTab] = useState<"notices" | "photos" | "announcements">("notices");
  const classId = params?.id;
  const classData = classes.find((c) => c.id === classId);
  const teacherNameById = (id?: string) =>
    teachers.find((t) => t.id === id)?.name || id || "담임 미정";

  // 반 목록 페이지 (ID가 없을 때)
  if (!classId) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        
        <div className="bg-orange-50 py-12 mb-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-display mb-4">반 소개</h1>
            <p className="text-gray-600">우리반을 소개합니다</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Link key={cls.id} href={`/classes/${cls.id}`} className="block">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer h-full">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white shadow-md", cls.color.split(' ')[1])}>
                    <span className="text-xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 font-display">{cls.name}</h3>
                  <p className="text-orange-600 font-medium mb-3">{cls.age}</p>
                  <p className="text-gray-600 text-sm mb-4">{cls.description}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <span className="font-medium">담임:</span> {teacherNameById(cls.teacher)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-xl font-bold text-gray-400">반 정보를 찾을 수 없습니다.</p>
        <Link href="/classes" className="text-orange-500 hover:underline">반 목록으로 돌아가기</Link>
      </div>
    );
  }

  // 권한 확인: 관리자, 담임 선생님, 또는 해당 반의 학부모
  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher' && teachers.find(t => t.id === currentUser.id)?.classId === classId;
  const isParentOfClass = currentUser?.role === 'parent' && currentUser.child?.classId === classId;
  const isAuthorized = isAdmin || isTeacher || isParentOfClass;

  // 현재 사용자의 아이 정보 찾기 (학부모인 경우)
  const userChild = currentUser?.role === 'parent' && currentUser.child
    ? registeredChildren.find(c => 
        c.name === currentUser.child?.name && 
        c.birthDate === currentUser.child?.birthDate &&
        c.classId === classId
      )
    : null;
  const userParentId = currentUser?.role === 'parent' ? currentUser.id : null;

  // 알림장 필터링: 각 아이의 학부모, 담임 선생님, 관리자만 볼 수 있음
  const notices = posts.filter(p => {
    if (p.classId !== classId || p.type !== 'board') return false;
    // 관리자나 담임 선생님은 모든 알림장 볼 수 있음
    if (isAdmin || isTeacher) return true;
    // 학부모인 경우: parentId가 없거나 자신의 parentId와 일치하는 것만
    if (isParentOfClass) {
      return !p.parentId || p.parentId === userParentId;
    }
    return false;
  });

  // 활동사진 필터링: 반의 모든 학부모, 담임 선생님, 관리자가 볼 수 있음
  const activityPhotos = posts.filter(p => {
    if (p.classId !== classId || p.type !== 'album') return false;
    return isAuthorized;
  });

  // 공지사항 필터링: 반의 모든 학부모, 담임 선생님, 관리자가 볼 수 있음
  const classNotices = posts.filter(p => {
    if (p.classId !== classId || p.type !== 'notice') return false;
    return isAuthorized;
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* Header */}
      <div className={cn("py-16", classData.color.split(' ')[0].replace('bg-', 'bg-opacity-20 bg-'))}>
         <div className="container mx-auto px-4 text-center">
            <div className={cn("w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 bg-white shadow-md", classData.color.split(' ')[1])}>
               <span className="text-3xl">📚</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-display mb-2">{classData.name}</h1>
            <p className="text-xl text-gray-600 font-medium">{classData.age}</p>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">{classData.description}</p>
         </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Sidebar: Teacher & Info */}
         <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-6 bg-orange-400 rounded-full" /> 담임교사 소개
               </h3>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                     {(() => {
                        const teacher = teachers.find(t => t.id === classData.teacher);
                        if (teacher?.photoUrl) {
                           return <GoogleDriveImage src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" />;
                        }
                        return <span className="text-xs text-gray-400">사진</span>;
                     })()}
                  </div>
                  <div>
                     <p className="font-bold text-lg text-gray-800">{teacherNameById(classData.teacher)}</p>
                     <p className="text-sm text-gray-500">"사랑으로 지도하겠습니다"</p>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-6 bg-green-400 rounded-full" /> 이번주 교육계획안
               </h3>
               <div className="aspect-[3/4] bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                  <div className="text-center text-gray-400">
                     <FileText className="w-8 h-8 mx-auto mb-2" />
                     <p className="text-sm">주간계획안 미리보기</p>
                  </div>
               </div>
               <button className="w-full mt-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  다운로드
               </button>
            </div>
         </div>

         {/* Main Content: Schedule & Board Preview */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-xl mb-6 text-gray-800 font-display flex items-center gap-2">
                  <Clock className="text-orange-500" /> 하루 일과표
               </h3>
               <div className="space-y-4">
                  {classData.schedule.map((item, idx) => (
                     <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-orange-50/50 transition-colors">
                        <div className="w-20 font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded text-center text-sm">
                           {item.time}
                        </div>
                        <div className="text-gray-700 font-medium">
                           {item.activity}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-sm border border-orange-100">
               <h3 className="font-bold text-xl mb-2 text-gray-800 font-display flex items-center justify-between">
                  우리 반 이야기
                  {isAuthorized && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">학부모 인증됨</span>}
               </h3>
               <p className="text-gray-500 mb-6">학부모님과 선생님이 소통하는 공간입니다.</p>
               
               {isAuthorized ? (
                  <div className="space-y-4">
                     <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                           <TabsTrigger value="notices" className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4" />
                              알림장 ({notices.length})
                           </TabsTrigger>
                           <TabsTrigger value="photos" className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              활동사진 ({activityPhotos.length})
                           </TabsTrigger>
                           <TabsTrigger value="announcements" className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              공지사항 ({classNotices.length})
                           </TabsTrigger>
                        </TabsList>

                        {/* 알림장 탭 */}
                        <TabsContent value="notices" className="space-y-4">
                           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                              {notices.length > 0 ? (
                                 notices.map((post) => (
                                    <div key={post.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                       <div className="flex justify-between items-start mb-1">
                                          <span className="font-bold text-gray-800">{post.title}</span>
                                          <span className="text-xs text-gray-400">{post.date}</span>
                                       </div>
                                       <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                                       {post.images && post.images.length > 0 && (
                                          <div className="mt-2 grid grid-cols-2 gap-2">
                                             {post.images.map((img, idx) => (
                                                <GoogleDriveImage 
                                                   key={idx} 
                                                   src={img} 
                                                   alt={`${post.title} 이미지 ${idx + 1}`}
                                                   className="w-full h-32 object-cover rounded-lg"
                                                />
                                             ))}
                                          </div>
                                       )}
                                       <p className="text-xs text-orange-500 mt-2 font-medium">{post.author}</p>
                                    </div>
                                 ))
                              ) : (
                                 <div className="p-8 text-center text-gray-400 text-sm">
                                    등록된 알림장이 없습니다.
                                 </div>
                              )}
                           </div>
                        </TabsContent>

                        {/* 활동사진 탭 */}
                        <TabsContent value="photos" className="space-y-4">
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {activityPhotos.length > 0 ? (
                                 activityPhotos.map((post) => (
                                    <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                       {post.images && post.images[0] && (
                                          <GoogleDriveImage 
                                             src={post.images[0]} 
                                             alt={post.title}
                                             className="w-full h-48 object-cover"
                                          />
                                       )}
                                       <div className="p-4">
                                          <h3 className="font-bold text-gray-800 mb-1">{post.title}</h3>
                                          <p className="text-xs text-gray-500 mb-2">{post.date}</p>
                                          <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                                          <p className="text-xs text-orange-500 mt-2 font-medium">{post.author}</p>
                                       </div>
                                    </div>
                                 ))
                              ) : (
                                 <div className="col-span-full p-8 text-center text-gray-400 text-sm">
                                    등록된 활동사진이 없습니다.
                                 </div>
                              )}
                           </div>
                        </TabsContent>

                        {/* 공지사항 탭 */}
                        <TabsContent value="announcements" className="space-y-4">
                           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                              {classNotices.length > 0 ? (
                                 classNotices.map((post) => (
                                    <div key={post.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                       <div className="flex justify-between items-start mb-1">
                                          <span className="font-bold text-gray-800">{post.title}</span>
                                          <span className="text-xs text-gray-400">{post.date}</span>
                                       </div>
                                       <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                                       {post.images && post.images.length > 0 && (
                                          <div className="mt-2 grid grid-cols-2 gap-2">
                                             {post.images.map((img, idx) => (
                                                <GoogleDriveImage 
                                                   key={idx} 
                                                   src={img} 
                                                   alt={`${post.title} 이미지 ${idx + 1}`}
                                                   className="w-full h-32 object-cover rounded-lg"
                                                />
                                             ))}
                                          </div>
                                       )}
                                       <p className="text-xs text-orange-500 mt-2 font-medium">{post.author}</p>
                                    </div>
                                 ))
                              ) : (
                                 <div className="p-8 text-center text-gray-400 text-sm">
                                    등록된 공지사항이 없습니다.
                                 </div>
                              )}
                           </div>
                        </TabsContent>
                     </Tabs>
                  </div>
               ) : (
                  <div className="text-center py-8 bg-white/50 rounded-xl border border-gray-100">
                     <Lock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                     <p className="font-bold text-gray-600 mb-1">비공개 게시판입니다.</p>
                     <p className="text-sm text-gray-500 mb-6">로그인한 학부모님만 열람할 수 있습니다.</p>
                     <Link 
                       href="/login"
                       className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
                     >
                       로그인 하러 가기
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </div>

      <Footer />
    </div>
  );
}
