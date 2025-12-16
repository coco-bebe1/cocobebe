import { Link, useLocation } from "wouter";
import { Users, Bell, Image, LogOut, Plus, Trash2, CheckCircle, XCircle, Save, Upload, Home as HomeIcon, Edit, Baby, Lock, UtensilsCrossed, Menu } from "lucide-react";
import { cn, convertGoogleDriveUrl } from "@/lib/utils";
import { GoogleDriveImage } from "@/components/ui/GoogleDriveImage";
import { useState, useEffect } from "react";
import { useApp, Post, RegisteredChild } from "@/lib/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
     logout, 
     users, updateUserStatus, deleteUser, registerUser,
     posts, deletePost, addPost, updatePost,
     albumPhotos, deleteAlbumPhoto, addAlbumPhoto,
     currentUser, updateUserProfile, updateUserPassword,
     registeredChildren, addRegisteredChild, deleteRegisteredChild, updateRegisteredChild,
     classes, addClass, updateClass, deleteClass,
     teachers, addTeacher, updateTeacher, deleteTeacher,
     siteSettings, updateSiteSettings
  } = useApp();
  const [location, setLocation] = useLocation();

  // Post Management State
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState("notice");
  const [newPostClassId, setNewPostClassId] = useState("all");
  const [newPostParentId, setNewPostParentId] = useState("all"); // 알림장의 경우 특정 학부모 선택
  const [newPostImageUrl, setNewPostImageUrl] = useState(""); // New: Image URL for post
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // Album Upload State
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState(""); 
  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  
  // Google Drive link converter helper (utils의 함수 사용)
  const convertGoogleDriveLink = (url: string): string => {
    return convertGoogleDriveUrl(url);
  };
  
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  // Child Registration State
  const [newChildName, setNewChildName] = useState("");
  const [newChildBirthDate, setNewChildBirthDate] = useState("");
  const [newChildClassId, setNewChildClassId] = useState("");
  const [isChildDialogOpen, setIsChildDialogOpen] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);

  // Teacher Management State
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherUsername, setNewTeacherUsername] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [newTeacherPhone, setNewTeacherPhone] = useState("");
  const [newTeacherClassId, setNewTeacherClassId] = useState("");
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);

  // Nutritionist Management State
  const [editingNutritionistId, setEditingNutritionistId] = useState<string | null>(null);
  const [newNutritionistName, setNewNutritionistName] = useState("");
  const [newNutritionistUsername, setNewNutritionistUsername] = useState("");
  const [newNutritionistPassword, setNewNutritionistPassword] = useState("");
  const [newNutritionistPhone, setNewNutritionistPhone] = useState("");
  const [isNutritionistDialogOpen, setIsNutritionistDialogOpen] = useState(false);
  
   // Class Management State
   const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
   const [editingClassId, setEditingClassId] = useState<string | null>(null);
   const [newClassName, setNewClassName] = useState("");
   const [newClassAge, setNewClassAge] = useState("");
   const [newClassTeacherId, setNewClassTeacherId] = useState("");
   const [newClassColor, setNewClassColor] = useState("#F97316");
   const [newClassDescription, setNewClassDescription] = useState("");

  // Admin Profile State
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordCheck, setAdminPasswordCheck] = useState("");
  const [isAdminPasswordDialogOpen, setIsAdminPasswordDialogOpen] = useState(false);
   const [isAdminProfileDialogOpen, setIsAdminProfileDialogOpen] = useState(false);
   const [adminName, setAdminName] = useState(currentUser?.name || "");
   const [adminUsername, setAdminUsername] = useState(currentUser?.username || "");
   const [adminPhone, setAdminPhone] = useState(currentUser?.phone || "");
   const [aboutImage, setAboutImage] = useState(siteSettings.greetingImageUrl);

  // About / History Management
  const [aboutDescription, setAboutDescription] = useState(siteSettings.aboutDescription);
  const [historyYear, setHistoryYear] = useState("");
  const [historyTitle, setHistoryTitle] = useState("");
  const [historyDesc, setHistoryDesc] = useState("");
  const [historyItems, setHistoryItems] = useState(siteSettings.history || []);
  const [aboutSignature, setAboutSignature] = useState(siteSettings.greetingSignature || "코코베베어린이집 박윤희 원장");
  const [philosophyItems, setPhilosophyItems] = useState(siteSettings.philosophy || []);
  const [philTitle, setPhilTitle] = useState("");
  const [philDesc, setPhilDesc] = useState("");
  const [facilityItems, setFacilityItems] = useState(siteSettings.facilityImages || []);
  const [facilityTitle, setFacilityTitle] = useState("");
  const [facilityUrl, setFacilityUrl] = useState("");
  const [facilityDesc, setFacilityDesc] = useState("");
  const [locAddress, setLocAddress] = useState(siteSettings.address);
  const [locPhone, setLocPhone] = useState(siteSettings.phone);
  const [locMap, setLocMap] = useState(siteSettings.mapLink);

   useEffect(() => {
      // Keep admin edit fields in sync when currentUser changes
      setAdminName(currentUser?.name || "");
      setAdminUsername(currentUser?.username || "");
      setAdminPhone(currentUser?.phone || "");
   }, [currentUser]);

  useEffect(() => {
    setAboutDescription(siteSettings.aboutDescription);
    setHistoryItems(siteSettings.history || []);
    setPhilosophyItems(siteSettings.philosophy || []);
    setFacilityItems(siteSettings.facilityImages || []);
    setAboutSignature(siteSettings.greetingSignature || "코코베베어린이집 박윤희 원장");
    setLocAddress(siteSettings.address);
    setLocPhone(siteSettings.phone);
    setLocMap(siteSettings.mapLink);
  }, [siteSettings]);

  // Reset form when dialog closes
  useEffect(() => {
     if (!isPostDialogOpen) {
        setEditingPostId(null);
        setNewPostTitle("");
        setNewPostContent("");
        setNewPostType("notice");
        setNewPostClassId("all");
        setNewPostImageUrl("");
     }
  }, [isPostDialogOpen]);

  useEffect(() => {
     if (!isChildDialogOpen) {
        setEditingChildId(null);
        setNewChildName("");
        setNewChildBirthDate("");
        setNewChildClassId("");
     }
  }, [isChildDialogOpen]);

  useEffect(() => {
     if (!isAlbumDialogOpen) {
        setNewPhotoTitle("");
        setNewPhotoUrl("");
        setPreviewImageUrl("");
     }
  }, [isAlbumDialogOpen]);

  const handleDeleteUser = (id: string) => {
     if (confirm("정말 삭제하시겠습니까?")) {
        deleteUser(id);
        toast({ description: "회원이 삭제되었습니다." });
     }
  };

  const handleResetPassword = (userId: string) => {
     const next = prompt("새 비밀번호를 입력하세요 (기본값 1234)", "1234");
     if (!next) return;
     updateUserPassword(userId, next);
     toast({ title: "비밀번호 변경", description: "비밀번호가 업데이트되었습니다." });
  };

  const handleDeletePost = async (id: number) => {
     if (confirm("게시글을 삭제하시겠습니까?")) {
        try {
          await deletePost(id);
          toast({ description: "게시글이 삭제되었습니다." });
        } catch (error: any) {
          toast({ 
            variant: "destructive", 
            title: "삭제 실패", 
            description: error.message || "서버에서 삭제하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
          });
        }
     }
  };

  const handleSavePost = async () => {
      if (!newPostTitle || !newPostContent) {
          toast({ variant: "destructive", description: "제목과 내용을 입력해주세요." });
          return;
      }

      // 구글 드라이브 링크인 경우 변환
      const finalImageUrl = newPostImageUrl && newPostImageUrl.includes('drive.google.com')
        ? convertGoogleDriveLink(newPostImageUrl)
        : newPostImageUrl;

      const postData = {
          title: newPostTitle,
          content: newPostContent,
          type: newPostType as any,
          author: "관리자",
          classId: newPostClassId === "all" ? undefined : newPostClassId,
          parentId: newPostType === "board" && newPostParentId !== "all" ? newPostParentId : undefined,
          images: finalImageUrl ? [finalImageUrl] : undefined,
      };

      try {
        if (editingPostId) {
            await updatePost(editingPostId, postData);
            toast({ title: "게시글 수정 완료", description: "변경사항이 저장되었습니다." });
        } else {
            await addPost(postData);
            toast({ title: "게시글 등록 완료", description: "새로운 게시글이 저장되었습니다." });
        }
        setIsPostDialogOpen(false);
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "저장 실패", 
          description: error.message || "서버에 저장하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
        });
      }
  };

  const handleEditPost = (post: Post) => {
      setEditingPostId(post.id);
      setNewPostTitle(post.title);
      setNewPostContent(post.content);
      setNewPostType(post.type);
      setNewPostClassId(post.classId || "all");
      setNewPostParentId(post.parentId || "all");
      setNewPostImageUrl(post.images?.[0] || "");
      setIsPostDialogOpen(true);
  };

  const handleAddPhoto = async () => {
      if (!newPhotoTitle || !newPhotoUrl) {
          toast({ variant: "destructive", description: "제목과 이미지 URL을 입력해주세요." });
          return;
      }
      // 구글 드라이브 링크인 경우 변환된 URL 사용
      const finalUrl = newPhotoUrl.includes('drive.google.com') 
        ? convertGoogleDriveLink(newPhotoUrl) 
        : newPhotoUrl;
      
      try {
        await addAlbumPhoto({
            title: newPhotoTitle,
            url: finalUrl,
        });
        setIsAlbumDialogOpen(false);
        setNewPhotoTitle("");
        setNewPhotoUrl("");
        setPreviewImageUrl("");
        toast({ title: "사진 업로드 완료", description: "변경사항이 저장되었습니다." });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "업로드 실패", 
          description: error.message || "서버에 저장하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
        });
      }
  };

  const handleAddChild = () => {
      if (!newChildName || !newChildBirthDate || !newChildClassId) {
          toast({ variant: "destructive", description: "모든 필드를 입력해주세요." });
          return;
      }
      
      if (editingChildId) {
          // Update existing child
          updateRegisteredChild(editingChildId, {
              name: newChildName,
              birthDate: newChildBirthDate,
              classId: newChildClassId,
          });
          toast({ title: "아이 정보 수정 완료", description: "변경사항이 저장되었습니다." });
      } else {
          // Add new child
          addRegisteredChild({
              name: newChildName,
              birthDate: newChildBirthDate,
              classId: newChildClassId,
          });
          toast({ title: "아이 등록 완료", description: "변경사항이 저장되었습니다." });
      }
      
      setIsChildDialogOpen(false);
      setEditingChildId(null);
      setNewChildName("");
      setNewChildBirthDate("");
      setNewChildClassId("");
  };

  const handleEditChild = (child: RegisteredChild) => {
      setEditingChildId(child.id);
      setNewChildName(child.name);
      setNewChildBirthDate(child.birthDate);
      setNewChildClassId(child.classId);
      setIsChildDialogOpen(true);
  };

  const handleDeleteChild = (id: string) => {
      if (confirm("정말 삭제하시겠습니까?")) {
          deleteRegisteredChild(id);
          toast({ description: "아이가 삭제되었습니다." });
      }
  };

  const handleSaveTeacher = async () => {
    if (!newTeacherName || !newTeacherUsername || !newTeacherPassword || !newTeacherClassId) {
      toast({ variant: "destructive", description: "모든 필드를 입력해주세요." });
      return;
    }

    const teacherData = {
      name: newTeacherName,
      username: newTeacherUsername,
      password: newTeacherPassword,
      phone: newTeacherPhone,
      classId: newTeacherClassId,
      approved: true
    };

    if (editingTeacherId) {
      await updateTeacher(editingTeacherId, teacherData);
      toast({ title: "선생님 수정 완료", description: "변경사항이 저장되었습니다." });
    } else {
      await addTeacher(teacherData);
      toast({ title: "선생님 등록 완료", description: "변경사항이 저장되었습니다." });
    }

    setIsTeacherDialogOpen(false);
    setEditingTeacherId(null);
    setNewTeacherName("");
    setNewTeacherUsername("");
    setNewTeacherPassword("");
    setNewTeacherPhone("");
    setNewTeacherClassId("");
  };

  const handleEditTeacher = (teacher: any) => {
    setEditingTeacherId(teacher.id);
    setNewTeacherName(teacher.name);
    setNewTeacherUsername(teacher.username);
    setNewTeacherPassword(teacher.password);
    setNewTeacherPhone(teacher.phone || "");
    setNewTeacherClassId(teacher.classId);
    setIsTeacherDialogOpen(true);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteTeacher(id);
        toast({ description: "선생님이 삭제되었습니다." });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "삭제 실패", 
          description: error.message || "서버에서 삭제하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
        });
      }
    }
  };

  const handleSaveNutritionist = async () => {
    if (!newNutritionistName || !newNutritionistUsername || !newNutritionistPassword) {
      toast({ variant: "destructive", description: "이름, 아이디, 비밀번호를 입력해주세요." });
      return;
    }

    const nutritionistData = {
      name: newNutritionistName,
      username: newNutritionistUsername,
      password: newNutritionistPassword,
      role: 'nutritionist' as const,
      phone: newNutritionistPhone,
      approved: true
    };

    if (editingNutritionistId) {
      // Update existing nutritionist
      const existingUser = users.find(u => u.id === editingNutritionistId);
      if (existingUser) {
        await updateUserProfile({
          ...existingUser,
          name: newNutritionistName,
          username: newNutritionistUsername,
          password: newNutritionistPassword,
          phone: newNutritionistPhone,
        });
        toast({ title: "영양사 수정 완료", description: "변경사항이 저장되었습니다." });
      }
    } else {
      // Add new nutritionist
      const newUser = await registerUser(nutritionistData);
      // Immediately approve the new nutritionist
      await updateUserStatus(newUser.id, true);
      toast({ title: "영양사 등록 완료", description: "변경사항이 저장되었습니다." });
    }

    setIsNutritionistDialogOpen(false);
    setEditingNutritionistId(null);
    setNewNutritionistName("");
    setNewNutritionistUsername("");
    setNewNutritionistPassword("");
    setNewNutritionistPhone("");
  };

  const handleEditNutritionist = (nutritionist: any) => {
    setEditingNutritionistId(nutritionist.id);
    setNewNutritionistName(nutritionist.name);
    setNewNutritionistUsername(nutritionist.username);
    setNewNutritionistPassword(nutritionist.password);
    setNewNutritionistPhone(nutritionist.phone || "");
    setIsNutritionistDialogOpen(true);
  };

  const handleDeleteNutritionist = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteUser(id);
      toast({ description: "영양사가 삭제되었습니다." });
    }
  };

  const handleChangeAdminPassword = () => {
    if (!adminPassword || !adminPasswordCheck) {
      toast({ variant: "destructive", description: "새 비밀번호를 입력해주세요." });
      return;
    }
    if (adminPassword !== adminPasswordCheck) {
      toast({ variant: "destructive", description: "비밀번호가 일치하지 않습니다." });
      return;
    }
    if (adminPassword.length < 4) {
      toast({ variant: "destructive", description: "비밀번호는 4자 이상이어야 합니다." });
      return;
    }

    // 관리자 비밀번호 변경 - updateUserPassword와 updateUserProfile 모두 사용하여 저장 보장
    if (currentUser?.id) {
      updateUserPassword(currentUser.id, adminPassword);
      updateUserProfile({ password: adminPassword });
    }
    setIsAdminPasswordDialogOpen(false);
    setAdminPassword("");
    setAdminPasswordCheck("");
    toast({ title: "비밀번호가 변경되었습니다.", description: "변경사항이 저장되었습니다." });
  };

   const handleSaveAdminProfile = () => {
      if (!adminName) { toast({ variant: 'destructive', description: '이름을 입력해주세요.' }); return; }
      updateUserProfile({ name: adminName, username: adminUsername, phone: adminPhone });
      setIsAdminProfileDialogOpen(false);
      toast({ title: '프로필이 저장되었습니다.', description: "변경사항이 저장되었습니다." });
   };

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: Users },
    { id: "members", label: "회원 관리", icon: Users },
    { id: "children", label: "아이 관리", icon: Baby },
    { id: "classes", label: "반 관리", icon: Users },
    { id: "teachers", label: "선생님 관리", icon: Users },
    { id: "nutritionists", label: "영양사 관리", icon: UtensilsCrossed },
    { id: "board", label: "게시판 관리", icon: Bell },
    { id: "album", label: "앨범 관리", icon: Image },
    { id: "about", label: "소개 관리", icon: Bell },
    { id: "account", label: "계정 설정", icon: Lock },
  ];

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="h-full flex flex-col min-h-0">
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <h2 className="font-display text-xl font-bold text-orange-600">관리자 페이지</h2>
        <p className="text-xs text-gray-400">코코베베어린이집</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              onItemClick?.();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === item.id 
                ? "bg-orange-50 text-orange-600" 
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2 flex-shrink-0 bg-white">
        <Link href="/">
          <a className="flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors px-4 py-2 rounded-lg">
            <HomeIcon className="w-4 h-4" />
            <span className="text-sm font-medium">홈페이지로 이동</span>
          </a>
        </Link>
        <button 
          onClick={() => { logout(); setLocation("/"); }}
          className="w-full flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors px-4 py-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">로그아웃</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row">
       {/* Desktop Sidebar */}
       <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen">
          <SidebarContent />
       </div>

       {/* Main Content */}
       <div className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen">
          <header className="flex justify-between items-center mb-6 md:mb-8 flex-wrap gap-4">
             <div className="flex items-center gap-3">
               <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                 <SheetTrigger asChild>
                   <Button variant="ghost" size="icon" className="md:hidden">
                     <Menu className="w-5 h-5" />
                   </Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="w-[280px] p-0 flex flex-col h-full overflow-hidden">
                   <SheetHeader className="sr-only">
                     <SheetTitle>메뉴</SheetTitle>
                   </SheetHeader>
                   <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
                 </SheetContent>
               </Sheet>
               <h1 className="text-xl md:text-2xl font-bold text-gray-800 font-display">
                  {activeTab === 'dashboard' && '대시보드'}
                  {activeTab === 'members' && '회원 관리'}
                  {activeTab === 'children' && '아이 관리'}
                  {activeTab === 'classes' && '반 관리'}
                  {activeTab === 'teachers' && '선생님 관리'}
                  {activeTab === 'nutritionists' && '영양사 관리'}
                  {activeTab === 'board' && '게시판 관리'}
                  {activeTab === 'album' && '앨범 관리'}
                  {activeTab === 'about' && '어린이집 소개 관리'}
                  {activeTab === 'account' && '계정 설정'}
               </h1>
             </div>
             <div className="flex items-center gap-2 md:gap-4">
                <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">관리자(Admin)님 환영합니다.</span>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200" />
             </div>
          </header>

          {/* Dashboard Widgets */}
          {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                   { label: "전체 회원", value: `${users.length}명`, color: "bg-blue-500" },
                   { label: "등록된 아이", value: `${registeredChildren.length}명`, color: "bg-pink-500" },
                   { label: "전체 게시글", value: `${posts.length}건`, color: "bg-orange-500" },
                   { label: "최근 활동 사진", value: `${albumPhotos.length}장`, color: "bg-green-500" },
                ].map((stat, idx) => (
                   <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                      <div className={`h-1 w-full mt-4 rounded-full opacity-20 ${stat.color}`} />
                   </div>
                ))}
             </div>
          )}

          {/* Members Management */}
          {activeTab === 'members' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="overflow-x-auto">
                  <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>이름</TableHead>
                         <TableHead>아이디</TableHead>
                         <TableHead>자녀 정보</TableHead>
                         <TableHead>연락처</TableHead>
                         <TableHead>상태</TableHead>
                         <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {users.filter(u => u.role !== 'admin').map((user) => (
                         <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>
                               {user.child ? (
                                  <div className="flex flex-col">
                                     <span className="font-bold">{user.child.name} ({user.child.age}세)</span>
                                     <span className="text-xs text-gray-500">{classes.find(c => c.id === user.child?.classId)?.name}</span>
                                  </div>
                               ) : <span className="text-gray-400">-</span>}
                            </TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>
                               {user.approved ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">승인됨</Badge>
                               ) : (
                                  <Button size="sm" onClick={() => updateUserStatus(user.id, true)} className="bg-orange-500 hover:bg-orange-600 text-white h-8">
                                     승인하기
                                  </Button>
                               )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResetPassword(user.id)}
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  비번변경
                                </Button>
                               <Button size="icon" variant="ghost" onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                               </Button>
                              </div>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
             </div>
          )}

          {/* Children Management */}
          {activeTab === 'children' && (
             <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <h3 className="text-base md:text-lg font-bold text-gray-800">등록된 아이 목록</h3>
                   <Dialog open={isChildDialogOpen} onOpenChange={setIsChildDialogOpen}>
                      <DialogTrigger asChild>
                         <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Plus className="w-4 h-4 mr-2" /> 아이 등록
                         </Button>
                      </DialogTrigger>
                      <DialogContent>
                         <DialogHeader>
                            <DialogTitle>{editingChildId ? "아이 정보 수정" : "새 아이 등록"}</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                            <div>
                               <label className="text-sm font-medium mb-1 block">이름</label>
                               <Input placeholder="아이 이름" value={newChildName} onChange={e => setNewChildName(e.target.value)} />
                            </div>
                            <div>
                               <label className="text-sm font-medium mb-1 block">생년월일</label>
                               <Input type="date" value={newChildBirthDate} onChange={e => setNewChildBirthDate(e.target.value)} />
                            </div>
                            <div>
                               <label className="text-sm font-medium mb-1 block">반 선택</label>
                               <Select onValueChange={setNewChildClassId} value={newChildClassId}>
                                  <SelectTrigger><SelectValue placeholder="반을 선택하세요" /></SelectTrigger>
                                  <SelectContent>
                                     {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.age})</SelectItem>)}
                                  </SelectContent>
                               </Select>
                            </div>
                            <p className="text-xs text-gray-500">* 학부모가 회원가입 시 아이 이름과 생년월일이 일치하면 자동으로 매칭됩니다.</p>
                         </div>
                         <DialogFooter>
                            <Button onClick={handleAddChild} className="bg-orange-500 hover:bg-orange-600 text-white">
                               {editingChildId ? "수정하기" : "등록하기"}
                            </Button>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                   <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                     <Table>
                      <TableHeader>
                         <TableRow>
                            <TableHead>이름</TableHead>
                            <TableHead>생년월일</TableHead>
                            <TableHead>나이</TableHead>
                            <TableHead>반</TableHead>
                            <TableHead>학부모</TableHead>
                            <TableHead className="text-right">관리</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {registeredChildren.map((child) => {
                            const birthYear = new Date(child.birthDate).getFullYear();
                            const currentYear = new Date().getFullYear();
                            const age = currentYear - birthYear;
                            const parent = users.find(u => u.id === child.parentId && u.role === 'parent');
                            return (
                               <TableRow key={child.id}>
                                  <TableCell className="font-medium">{child.name}</TableCell>
                                  <TableCell>{child.birthDate}</TableCell>
                                  <TableCell>{age}세</TableCell>
                                  <TableCell>
                                     <Badge variant="secondary">{classes.find(c => c.id === child.classId)?.name}</Badge>
                                  </TableCell>
                                  <TableCell>
                                     {parent ? (
                                        <div className="flex flex-col">
                                           <span className="font-medium">{parent.name}</span>
                                           <span className="text-xs text-gray-500">{parent.username}</span>
                                        </div>
                                     ) : (
                                        <span className="text-gray-400">미가입</span>
                                     )}
                                  </TableCell>
                                  <TableCell className="text-right space-x-2 flex justify-end">
                                     <Button size="icon" variant="ghost" onClick={() => handleEditChild(child)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                        <Edit className="w-4 h-4" />
                                     </Button>
                                     <Button size="icon" variant="ghost" onClick={() => handleDeleteChild(child.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                     </Button>
                                  </TableCell>
                               </TableRow>
                            );
                         })}
                         {registeredChildren.length === 0 && (
                            <TableRow>
                               <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                                  등록된 아이가 없습니다. 아이를 등록해주세요.
                               </TableCell>
                            </TableRow>
                         )}
                      </TableBody>
                     </Table>
                   </div>
                </div>
             </div>
          )}

          {/* Classes Management */}
          {activeTab === 'classes' && (
             <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <h3 className="text-base md:text-lg font-bold text-gray-800">반 관리</h3>
                   <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
                      <DialogTrigger asChild>
                         <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Plus className="w-4 h-4 mr-2" /> 새 반 등록
                         </Button>
                      </DialogTrigger>
                      <DialogContent>
                         <DialogHeader>
                            <DialogTitle>{editingClassId ? "반 수정" : "새 반 등록"}</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                            <div>
                               <label className="text-sm font-medium mb-1 block">반 이름</label>
                               <Input placeholder="예: 믿음1반" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
                            </div>
                            <div>
                               <label className="text-sm font-medium mb-1 block">연령</label>
                               <Input placeholder="예: 1세" value={newClassAge} onChange={e => setNewClassAge(e.target.value)} />
                            </div>
                            <div>
                               <label className="text-sm font-medium mb-1 block">담당 선생님</label>
                               <Select value={newClassTeacherId} onValueChange={setNewClassTeacherId}>
                                  <SelectTrigger><SelectValue placeholder="선생님 선택" /></SelectTrigger>
                                  <SelectContent>
                                     {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                  </SelectContent>
                               </Select>
                            </div>
                            <div>
                               <label className="text-sm font-medium mb-1 block">색상 (표시용)</label>
                               <Input type="color" value={newClassColor} onChange={e => setNewClassColor(e.target.value)} />
                            </div>
                            <div>
                               <label className="text-sm font-medium mb-1 block">설명</label>
                               <Textarea placeholder="반 설명" value={newClassDescription} onChange={e => setNewClassDescription(e.target.value)} className="h-24" />
                            </div>
                         </div>
                         <DialogFooter>
                            <Button onClick={async () => {
                               if (!newClassName) { toast({ variant: 'destructive', description: '반 이름을 입력해주세요.' }); return; }
                               const cls = { name: newClassName, age: newClassAge || '', teacher: newClassTeacherId || '', color: newClassColor, description: newClassDescription, schedule: [] };
                               if (editingClassId) { await updateClass(editingClassId, cls); toast({ title: '반 수정 완료', description: "변경사항이 저장되었습니다." }); }
                               else { await addClass(cls); toast({ title: '반 등록 완료', description: "변경사항이 저장되었습니다." }); }
                               setIsClassDialogOpen(false);
                               setEditingClassId(null);
                               setNewClassName(''); setNewClassAge(''); setNewClassTeacherId(''); setNewClassColor('#F97316'); setNewClassDescription('');
                            }} className="bg-orange-500 hover:bg-orange-600 text-white">
                               {editingClassId ? '수정하기' : '등록하기'}
                            </Button>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                   <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                     <Table>
                      <TableHeader>
                         <TableRow>
                            <TableHead>이름</TableHead>
                            <TableHead>연령</TableHead>
                            <TableHead>담당 선생님</TableHead>
                            <TableHead>색상</TableHead>
                            <TableHead className="text-right">관리</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {classes.map((c) => (
                            <TableRow key={c.id}>
                               <TableCell className="font-medium">{c.name}</TableCell>
                               <TableCell>{c.age}</TableCell>
                               <TableCell>{teachers.find(t => t.id === c.teacher)?.name || '-'}</TableCell>
                               <TableCell><div className="w-6 h-6 rounded" style={{ background: c.color }} /></TableCell>
                               <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                     <Button size="icon" variant="ghost" onClick={() => {
                                        setEditingClassId(c.id);
                                        setNewClassName(c.name); setNewClassAge(c.age); setNewClassTeacherId(c.teacher); setNewClassColor(c.color); setNewClassDescription(c.description);
                                        setIsClassDialogOpen(true);
                                     }} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                        <Edit className="w-4 h-4" />
                                     </Button>
                                     <Button size="icon" variant="ghost" onClick={async () => { 
                                       if (confirm('정말 삭제하시겠습니까?')) {
                                         try {
                                           await deleteClass(c.id);
                                           toast({ description: '반이 삭제되었습니다.' });
                                         } catch (error: any) {
                                           toast({ 
                                             variant: "destructive", 
                                             title: "삭제 실패", 
                                             description: error.message || "서버에서 삭제하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
                                           });
                                         }
                                       }
                                     }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                     </Button>
                                  </div>
                               </TableCell>
                            </TableRow>
                         ))}
                      </TableBody>
                     </Table>
                   </div>
                </div>
             </div>
          )}

          {/* Teachers Management */}
          {activeTab === 'teachers' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <h3 className="text-base md:text-lg font-bold text-gray-800">선생님 목록</h3>
                   <Dialog open={isTeacherDialogOpen} onOpenChange={setIsTeacherDialogOpen}>
                      <DialogTrigger asChild>
                         <Button onClick={() => { setEditingTeacherId(null); setNewTeacherName(""); setNewTeacherUsername(""); setNewTeacherPassword(""); setNewTeacherPhone(""); setNewTeacherClassId(""); }} className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Plus className="w-4 h-4 mr-2" /> 새 선생님 등록
                         </Button>
                      </DialogTrigger>
                      <DialogContent>
                         <DialogHeader>
                            <DialogTitle>{editingTeacherId ? "선생님 수정" : "새 선생님 등록"}</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                               <Input 
                                  placeholder="예: 윤해란"
                                  value={newTeacherName}
                                  onChange={(e) => setNewTeacherName(e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                               <Input 
                                  placeholder="예: teacher1"
                                  value={newTeacherUsername}
                                  onChange={(e) => setNewTeacherUsername(e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                               <Input 
                                  type="password"
                                  placeholder="비밀번호를 입력해주세요"
                                  value={newTeacherPassword}
                                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">전화번호 (선택)</label>
                               <Input 
                                  placeholder="010-1234-5678"
                                  value={newTeacherPhone}
                                  onChange={(e) => setNewTeacherPhone(e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">담당 반</label>
                               <Select value={newTeacherClassId} onValueChange={setNewTeacherClassId}>
                                  <SelectTrigger>
                                     <SelectValue placeholder="반을 선택해주세요" />
                                  </SelectTrigger>
                                  <SelectContent>
                                     {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                  </SelectContent>
                               </Select>
                            </div>
                         </div>
                         <DialogFooter>
                            <Button onClick={handleSaveTeacher} className="bg-orange-500 hover:bg-orange-600 text-white">
                               {editingTeacherId ? "수정 완료" : "등록"}
                            </Button>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>

                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>이름</TableHead>
                         <TableHead>아이디</TableHead>
                         <TableHead>담당 반</TableHead>
                         <TableHead>전화번호</TableHead>
                         <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {teachers.map((teacher) => (
                         <TableRow key={teacher.id}>
                            <TableCell className="font-medium">{teacher.name}</TableCell>
                            <TableCell>{teacher.username}</TableCell>
                            <TableCell>
                               <Badge variant="secondary">{classes.find(c => c.id === teacher.classId)?.name}</Badge>
                            </TableCell>
                            <TableCell>{teacher.phone || '-'}</TableCell>
                            <TableCell className="text-right">
                               <Button size="icon" variant="ghost" onClick={() => handleEditTeacher(teacher)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                  <Edit className="w-4 h-4" />
                               </Button>
                               <Button size="icon" variant="ghost" onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
          )}

          {/* Nutritionist Management */}
          {activeTab === 'nutritionists' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-800">영양사 목록</h3>
                   <Dialog open={isNutritionistDialogOpen} onOpenChange={setIsNutritionistDialogOpen}>
                      <DialogTrigger asChild>
                         <Button onClick={() => { setEditingNutritionistId(null); setNewNutritionistName(""); setNewNutritionistUsername(""); setNewNutritionistPassword(""); setNewNutritionistPhone(""); }} className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Plus className="w-4 h-4 mr-2" /> 새 영양사 등록
                         </Button>
                      </DialogTrigger>
                      <DialogContent>
                         <DialogHeader>
                            <DialogTitle>{editingNutritionistId ? "영양사 수정" : "새 영양사 등록"}</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                               <Input 
                                  placeholder="예: 홍영양"
                                  value={newNutritionistName}
                                  onChange={(e) => setNewNutritionistName(e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                               <Input 
                                  placeholder="예: nutritionist"
                                  value={newNutritionistUsername}
                                  onChange={(e) => setNewNutritionistUsername(e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                               <Input 
                                  type="password"
                                  placeholder="비밀번호를 입력해주세요"
                                  value={newNutritionistPassword}
                                  onChange={(e) => setNewNutritionistPassword(e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">전화번호 (선택)</label>
                               <Input 
                                  placeholder="010-1234-5678"
                                  value={newNutritionistPhone}
                                  onChange={(e) => setNewNutritionistPhone(e.target.value)}
                               />
                            </div>
                         </div>
                         <DialogFooter>
                            <Button onClick={handleSaveNutritionist} className="bg-orange-500 hover:bg-orange-600 text-white">
                               {editingNutritionistId ? "수정 완료" : "등록"}
                            </Button>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>

                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>이름</TableHead>
                         <TableHead>아이디</TableHead>
                         <TableHead>전화번호</TableHead>
                         <TableHead>상태</TableHead>
                         <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {users.filter(u => u.role === 'nutritionist').map((nutritionist) => (
                         <TableRow key={nutritionist.id}>
                            <TableCell className="font-medium">{nutritionist.name}</TableCell>
                            <TableCell>{nutritionist.username}</TableCell>
                            <TableCell>{nutritionist.phone || '-'}</TableCell>
                            <TableCell>
                               {nutritionist.approved ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">승인됨</Badge>
                               ) : (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">대기중</Badge>
                               )}
                            </TableCell>
                            <TableCell className="text-right">
                               <Button size="icon" variant="ghost" onClick={() => handleEditNutritionist(nutritionist)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                  <Edit className="w-4 h-4" />
                               </Button>
                               <Button size="icon" variant="ghost" onClick={() => handleDeleteNutritionist(nutritionist.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
                {users.filter(u => u.role === 'nutritionist').length === 0 && (
                   <div className="text-center py-12 text-gray-400">
                      등록된 영양사가 없습니다.
                   </div>
                )}
             </div>
          )}

          {/* Board & Class Management (Shared UI for now) */}
          {(activeTab === 'board') && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-800">게시글 목록</h3>
                   <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                      <DialogTrigger asChild>
                         <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Plus className="w-4 h-4 mr-2" /> 글쓰기
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                            <DialogTitle>{editingPostId ? "게시글 수정" : "새 게시글 작성"}</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="text-sm font-medium mb-1 block">분류</label>
                                  <Select onValueChange={setNewPostType} value={newPostType}>
                                     <SelectTrigger><SelectValue /></SelectTrigger>
                                     <SelectContent>
                                        <SelectItem value="notice">공지사항</SelectItem>
                                        <SelectItem value="event">행사</SelectItem>
                                        <SelectItem value="board">알림장/게시판</SelectItem>
                                     </SelectContent>
                                  </Select>
                               </div>
                               <div>
                                  <label className="text-sm font-medium mb-1 block">대상 (반 선택)</label>
                                  <Select onValueChange={setNewPostClassId} value={newPostClassId}>
                                     <SelectTrigger><SelectValue placeholder="전체" /></SelectTrigger>
                                     <SelectContent>
                                        <SelectItem value="all">전체 공지</SelectItem>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                     </SelectContent>
                                  </Select>
                               </div>
                            </div>
                            {newPostType === "board" && newPostClassId !== "all" && (
                               <div>
                                  <label className="text-sm font-medium mb-1 block">대상 학부모 (알림장의 경우)</label>
                                  <Select onValueChange={setNewPostParentId} value={newPostParentId}>
                                     <SelectTrigger><SelectValue placeholder="전체 학부모" /></SelectTrigger>
                                     <SelectContent>
                                        <SelectItem value="all">전체 학부모</SelectItem>
                                        {users
                                          .filter(u => u.role === 'parent' && u.child?.classId === newPostClassId)
                                          .map(u => (
                                             <SelectItem key={u.id} value={u.id}>
                                                {u.name} ({u.child?.name})
                                             </SelectItem>
                                          ))}
                                     </SelectContent>
                                  </Select>
                                  <p className="text-xs text-gray-500 mt-1">특정 학부모를 선택하면 해당 학부모만 볼 수 있습니다.</p>
                               </div>
                            )}
                            <Input placeholder="제목을 입력하세요" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} />
                            <Textarea placeholder="내용을 입력하세요" className="h-32" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} />
                            
                            <div>
                               <label className="text-sm font-medium mb-1 block">이미지 URL (선택사항)</label>
                               <Input 
                                  placeholder="이미지 URL 또는 구글 드라이브 링크" 
                                  value={newPostImageUrl} 
                                  onChange={e => {
                                    const url = e.target.value;
                                    setNewPostImageUrl(url);
                                  }} 
                               />
                                  {newPostImageUrl && (
                                  <div className="mt-3">
                                     <p className="text-xs font-medium text-gray-600 mb-2">미리보기</p>
                                     <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <GoogleDriveImage 
                                           src={newPostImageUrl} 
                                           alt="미리보기" 
                                           className="w-full h-full object-contain"
                                        />
                                     </div>
                                     </div>
                                  )}
                            </div>
                         </div>
                         <DialogFooter>
                            <Button onClick={handleSavePost} className="bg-orange-500 hover:bg-orange-600 text-white">
                               {editingPostId ? "수정하기" : "등록하기"}
                            </Button>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                   <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                     <Table>
                      <TableHeader>
                         <TableRow>
                            <TableHead>분류</TableHead>
                            <TableHead>대상</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead>작성자</TableHead>
                            <TableHead>날짜</TableHead>
                            <TableHead className="text-right">관리</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {posts.map((post) => (
                            <TableRow key={post.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleEditPost(post)}>
                               <TableCell>
                                  <Badge variant="outline" className={cn(
                                     post.type === 'notice' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                                     post.type === 'event' ? 'border-pink-200 text-pink-600 bg-pink-50' :
                                     'border-orange-200 text-orange-600 bg-orange-50'
                                  )}>
                                     {post.type.toUpperCase()}
                                  </Badge>
                               </TableCell>
                               <TableCell>
                                     {post.classId ? (
                                     <Badge variant="secondary">{classes.find(c => c.id === post.classId)?.name}</Badge>
                                  ) : (
                                     <span className="text-gray-500 text-xs">전체</span>
                                  )}
                               </TableCell>
                               <TableCell className="font-medium">
                                  {post.title}
                                  {post.images && post.images.length > 0 && <Image className="w-3 h-3 inline ml-2 text-gray-400" />}
                               </TableCell>
                               <TableCell>{post.author}</TableCell>
                               <TableCell>{post.date}</TableCell>
                               <TableCell className="text-right">
                                  <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                                     <Button size="icon" variant="ghost" onClick={() => handleEditPost(post)} className="text-gray-500 hover:text-gray-800">
                                        <Edit className="w-4 h-4" />
                                     </Button>
                                     <Button size="icon" variant="ghost" onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                     </Button>
                                  </div>
                               </TableCell>
                            </TableRow>
                         ))}
                      </TableBody>
                     </Table>
                   </div>
                </div>
             </div>
          )}

          {/* Album Management */}
          {activeTab === 'album' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-800">앨범 관리</h3>
                   <Dialog open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
                      <DialogTrigger asChild>
                         <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Upload className="w-4 h-4 mr-2" /> 사진 업로드
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                            <DialogTitle>사진 업로드</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4 py-4">
                            <div>
                            <Input placeholder="제목 (예: 가을소풍)" value={newPhotoTitle} onChange={e => setNewPhotoTitle(e.target.value)} />
                            </div>
                            <div>
                               <Input 
                                  placeholder="이미지 URL 또는 구글 드라이브 링크" 
                                  value={newPhotoUrl} 
                                  onChange={e => {
                                    const url = e.target.value;
                                    setNewPhotoUrl(url);
                                    // 구글 드라이브 링크인 경우 자동 변환
                                    if (url.includes('drive.google.com')) {
                                      setPreviewImageUrl(convertGoogleDriveLink(url));
                                    } else {
                                      setPreviewImageUrl(url);
                                    }
                                  }} 
                               />
                               <p className="text-xs text-gray-400 mt-1">
                                 * 구글 드라이브: 파일 공유 → "링크가 있는 모든 사용자"로 설정 → 링크 복사
                               </p>
                            </div>
                            
                            {/* 이미지 미리보기 */}
                            {previewImageUrl && (
                               <div className="mt-4">
                                  <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
                                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                     <GoogleDriveImage 
                                        src={previewImageUrl} 
                                        alt="미리보기" 
                                        className="w-full h-full object-contain"
                                     />
                                  </div>
                               </div>
                            )}
                         </div>
                         <DialogFooter>
                            <Button onClick={handleAddPhoto} className="bg-orange-500 hover:bg-orange-600 text-white">업로드</Button>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {albumPhotos.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                         <GoogleDriveImage src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                            <p className="font-bold">{photo.title}</p>
                            <p className="text-xs mb-2">{photo.classId ? classes.find(c => c.id === photo.classId)?.name : '전체'}</p>
                            <Button size="sm" variant="destructive" onClick={async () => { 
                              if(confirm('삭제하시겠습니까?')) {
                                try {
                                  await deleteAlbumPhoto(photo.id);
                                  toast({ description: "사진이 삭제되었습니다." });
                                } catch (error: any) {
                                  toast({ 
                                    variant: "destructive", 
                                    title: "삭제 실패", 
                                    description: error.message || "서버에서 삭제하지 못했습니다." 
                                  });
                                }
                              }
                            }}>
                               <Trash2 className="w-4 h-4" /> 삭제
                            </Button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* About / History Management */}
          {activeTab === 'about' && (
             <div className="space-y-6 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                   <h3 className="text-lg font-bold text-gray-800">어린이집 소개 글</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                     <Input
                       placeholder="인사말 제목"
                       value={siteSettings.greetingTitle}
                       onChange={(e) => { updateSiteSettings({ ...siteSettings, greetingTitle: e.target.value }); }}
                       className="bg-gray-50"
                     />
                     <Input
                       placeholder="원장 사진 URL"
                       value={aboutImage}
                       onChange={(e) => setAboutImage(e.target.value)}
                       className="bg-gray-50"
                     />
                  </div>
                  <Textarea
                     value={siteSettings.greetingMessage}
                     onChange={(e) => { updateSiteSettings({ ...siteSettings, greetingMessage: e.target.value }); }}
                     className="bg-gray-50"
                     placeholder="원장 인사말을 입력하세요."
                  />
                  <Input
                    placeholder="인사말 서명 (예: 코코베베어린이집 박윤희 원장)"
                    value={aboutSignature}
                    onChange={(e) => setAboutSignature(e.target.value)}
                    className="bg-gray-50"
                  />
                   <Textarea
                      value={aboutDescription}
                      onChange={(e) => setAboutDescription(e.target.value)}
                      className="min-h-[140px] bg-gray-50"
                      placeholder="어린이집 소개 글을 입력하세요."
                   />
                   <div className="text-right">
                      <Button
                         className="bg-orange-500 hover:bg-orange-600 text-white"
                         onClick={async () => {
                            await updateSiteSettings({
                              ...siteSettings,
                              aboutDescription,
                              history: historyItems,
                              greetingImageUrl: aboutImage,
                              greetingSignature: aboutSignature,
                              philosophy: philosophyItems,
                              facilityImages: facilityItems,
                              address: locAddress,
                              phone: locPhone,
                              mapLink: locMap,
                            });
                            toast({ title: "소개 글이 저장되었습니다.", description: "변경사항이 저장되었습니다." });
                         }}
                      >
                         저장
                      </Button>
                   </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                   <h3 className="text-lg font-bold text-gray-800">연혁 관리</h3>
                   <div className="grid md:grid-cols-3 gap-3">
                      <Input placeholder="연도 (예: 2024)" value={historyYear} onChange={(e) => setHistoryYear(e.target.value)} />
                      <Input placeholder="제목" value={historyTitle} onChange={(e) => setHistoryTitle(e.target.value)} />
                      <Input placeholder="설명 (선택)" value={historyDesc} onChange={(e) => setHistoryDesc(e.target.value)} />
                   </div>
                   <Button
                      variant="outline"
                      onClick={() => {
                        if (!historyYear || !historyTitle) {
                          toast({ variant: "destructive", description: "연도와 제목을 입력하세요." });
                          return;
                        }
                        setHistoryItems([...historyItems, { year: historyYear, title: historyTitle, desc: historyDesc }]);
                        setHistoryYear(""); setHistoryTitle(""); setHistoryDesc("");
                      }}
                    >
                      추가
                    </Button>

                   <div className="space-y-3 mt-4">
                     {historyItems.length === 0 && (
                       <p className="text-sm text-gray-400">등록된 연혁이 없습니다.</p>
                     )}
                     {historyItems.map((h, idx) => (
                       <div key={`${h.year}-${idx}`} className="flex items-start justify-between bg-gray-50 border border-gray-100 p-3 rounded-lg">
                         <div>
                           <p className="font-bold text-gray-800">{h.year} · {h.title}</p>
                           {h.desc && <p className="text-sm text-gray-500">{h.desc}</p>}
                         </div>
                         <Button
                           size="icon"
                           variant="ghost"
                           className="text-red-500 hover:text-red-600 hover:bg-red-50"
                           onClick={() => {
                             setHistoryItems(historyItems.filter((_, i) => i !== idx));
                           }}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     ))}
                   </div>

                   <div className="text-right">
                      <Button
                         className="bg-orange-500 hover:bg-orange-600 text-white"
                         onClick={async () => {
                            await updateSiteSettings({
                              ...siteSettings,
                              aboutDescription,
                              history: historyItems,
                              greetingImageUrl: aboutImage,
                              greetingSignature: aboutSignature,
                              philosophy: philosophyItems,
                              facilityImages: facilityItems,
                              address: locAddress,
                              phone: locPhone,
                              mapLink: locMap,
                            });
                            toast({ title: "연혁이 저장되었습니다.", description: "변경사항이 저장되었습니다." });
                         }}
                      >
                         연혁 저장
                      </Button>
                   </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                   <h3 className="text-lg font-bold text-gray-800">교육철학 관리</h3>
                   <div className="grid md:grid-cols-2 gap-3">
                      <Input placeholder="제목" value={philTitle} onChange={(e) => setPhilTitle(e.target.value)} />
                      <Input placeholder="설명" value={philDesc} onChange={(e) => setPhilDesc(e.target.value)} />
                   </div>
                   <Button
                      variant="outline"
                      onClick={() => {
                        if (!philTitle) { toast({ variant: "destructive", description: "제목을 입력하세요." }); return; }
                        setPhilosophyItems([...philosophyItems, { title: philTitle, desc: philDesc }]);
                        setPhilTitle(""); setPhilDesc("");
                      }}
                   >
                      추가
                   </Button>
                   <div className="space-y-3 mt-4">
                     {philosophyItems.length === 0 && <p className="text-sm text-gray-400">등록된 교육철학이 없습니다.</p>}
                     {philosophyItems.map((p, idx) => (
                       <div key={`${p.title}-${idx}`} className="flex items-start justify-between bg-gray-50 border border-gray-100 p-3 rounded-lg">
                         <div>
                           <p className="font-bold text-gray-800">{p.title}</p>
                           <p className="text-sm text-gray-500">{p.desc}</p>
                         </div>
                         <Button
                           size="icon"
                           variant="ghost"
                           className="text-red-500 hover:text-red-600 hover:bg-red-50"
                           onClick={() => setPhilosophyItems(philosophyItems.filter((_, i) => i !== idx))}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     ))}
                   </div>
                   <div className="text-right">
                      <Button
                         className="bg-orange-500 hover:bg-orange-600 text-white"
                         onClick={() => {
                            updateSiteSettings({
                              ...siteSettings,
                              aboutDescription,
                              history: historyItems,
                              greetingImageUrl: aboutImage,
                              philosophy: philosophyItems,
                              facilityImages: facilityItems,
                              address: locAddress,
                              phone: locPhone,
                              mapLink: locMap,
                            });
                            toast({ title: "교육철학이 저장되었습니다.", description: "변경사항이 저장되었습니다." });
                         }}
                      >
                         교육철학 저장
                      </Button>
                   </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                   <h3 className="text-lg font-bold text-gray-800">시설 안내 사진</h3>
                   <div className="grid md:grid-cols-3 gap-3">
                      <Input placeholder="제목" value={facilityTitle} onChange={(e) => setFacilityTitle(e.target.value)} />
                      <Input placeholder="이미지 URL" value={facilityUrl} onChange={(e) => setFacilityUrl(e.target.value)} />
                      <Input placeholder="설명 (선택)" value={facilityDesc} onChange={(e) => setFacilityDesc(e.target.value)} />
                   </div>
                   <Button
                      variant="outline"
                      onClick={() => {
                        if (!facilityTitle || !facilityUrl) {
                          toast({ variant: "destructive", description: "제목과 이미지 URL을 입력하세요." });
                          return;
                        }
                        setFacilityItems([...facilityItems, { title: facilityTitle, url: facilityUrl, desc: facilityDesc }]);
                        setFacilityTitle(""); setFacilityUrl(""); setFacilityDesc("");
                      }}
                   >
                      추가
                   </Button>

                   <div className="grid md:grid-cols-2 gap-3 mt-4">
                     {facilityItems.length === 0 && (
                       <p className="text-sm text-gray-400">등록된 시설 사진이 없습니다.</p>
                     )}
                     {facilityItems.map((f, idx) => (
                       <div key={`${f.title}-${idx}`} className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex gap-3">
                         <div className="w-24 h-16 bg-white rounded border overflow-hidden">
                           {f.url ? <GoogleDriveImage src={f.url} alt={f.title} className="w-full h-full object-cover" /> : null}
                         </div>
                         <div className="flex-1">
                           <p className="font-bold text-gray-800">{f.title}</p>
                           <p className="text-sm text-gray-500">{f.desc}</p>
                         </div>
                         <Button
                           size="icon"
                           variant="ghost"
                           className="text-red-500 hover:text-red-600 hover:bg-red-50"
                           onClick={() => setFacilityItems(facilityItems.filter((_, i) => i !== idx))}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     ))}
                   </div>

                   <div className="text-right">
                      <Button
                         className="bg-orange-500 hover:bg-orange-600 text-white"
                         onClick={() => {
                            updateSiteSettings({
                              ...siteSettings,
                              aboutDescription,
                              history: historyItems,
                              greetingImageUrl: aboutImage,
                              philosophy: philosophyItems,
                              facilityImages: facilityItems,
                              address: locAddress,
                              phone: locPhone,
                              mapLink: locMap,
                            });
                            toast({ title: "시설 안내가 저장되었습니다.", description: "변경사항이 저장되었습니다." });
                         }}
                      >
                         시설 안내 저장
                      </Button>
                   </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                   <h3 className="text-lg font-bold text-gray-800">오시는 길</h3>
                   <div className="grid md:grid-cols-3 gap-3">
                      <Input placeholder="주소" value={locAddress} onChange={(e) => setLocAddress(e.target.value)} />
                      <Input placeholder="전화번호" value={locPhone} onChange={(e) => setLocPhone(e.target.value)} />
                      <Input placeholder="지도 링크" value={locMap} onChange={(e) => setLocMap(e.target.value)} />
                   </div>
                   <div className="text-right">
                      <Button
                         className="bg-orange-500 hover:bg-orange-600 text-white"
                         onClick={() => {
                            updateSiteSettings({
                              ...siteSettings,
                              aboutDescription,
                              history: historyItems,
                              greetingImageUrl: aboutImage,
                              philosophy: philosophyItems,
                              facilityImages: facilityItems,
                              address: locAddress,
                              phone: locPhone,
                              mapLink: locMap,
                            });
                            toast({ title: "오시는 길 정보가 저장되었습니다.", description: "변경사항이 저장되었습니다." });
                         }}
                      >
                         오시는 길 저장
                      </Button>
                   </div>
                </div>
             </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
             <div className="space-y-6 max-w-3xl">
                {/* Admin Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                   <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      👤 관리자 정보
                   </h2>
                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-600 mb-2">이름</label>
                         <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 font-medium border border-gray-200">
                            {currentUser?.name}
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-600 mb-2">아이디</label>
                         <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 font-medium border border-gray-200">
                            {currentUser?.username}
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-600 mb-2">역할</label>
                         <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 font-medium border border-gray-200">
                            <Badge className="bg-blue-100 text-blue-800">관리자</Badge>
                         </div>
                      </div>

                      <div>
                         <label className="block text-sm font-medium text-gray-600 mb-2">연락처 수정</label>
                         <div className="flex gap-2">
                            <Input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className="bg-gray-50" />
                            <Button onClick={() => { updateUserProfile({ phone: adminPhone }); toast({ title: '연락처 저장 완료', description: "변경사항이 저장되었습니다." }); }} className="bg-orange-500 hover:bg-orange-600 text-white">저장</Button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-2">
                   <Dialog open={isAdminProfileDialogOpen} onOpenChange={setIsAdminProfileDialogOpen}>
                      <DialogTrigger asChild>
                            <Button className="bg-white border border-gray-200 text-gray-800">정보 수정</Button>
                         </DialogTrigger>
                      <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                            <DialogTitle>관리자 정보 수정</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4">
                            <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="이름" />
                            <Input value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="아이디" />
                            <Input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} placeholder="연락처" />
                         </div>
                         <DialogFooter>
                            <Button onClick={handleSaveAdminProfile} className="bg-orange-500 hover:bg-orange-600 text-white">저장</Button>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                   <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-orange-500" /> 보안 설정
                   </h2>
                   <Dialog open={isAdminPasswordDialogOpen} onOpenChange={setIsAdminPasswordDialogOpen}>
                      <DialogTrigger asChild>
                         <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                            <Lock className="w-4 h-4" /> 비밀번호 변경
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                            <DialogTitle>비밀번호 변경</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                               <Input
                                  type="password"
                                  placeholder="새 비밀번호를 입력해주세요"
                                  value={adminPassword}
                                  onChange={(e) => setAdminPassword(e.target.value)}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                               <Input
                                  type="password"
                                  placeholder="비밀번호를 다시 입력해주세요"
                                  value={adminPasswordCheck}
                                  onChange={(e) => setAdminPasswordCheck(e.target.value)}
                               />
                            </div>
                         </div>
                         <DialogFooter>
                            <Button onClick={handleChangeAdminPassword} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                               변경하기
                            </Button>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>
             </div>
          )}
       </div>
    </div>
  );
}

