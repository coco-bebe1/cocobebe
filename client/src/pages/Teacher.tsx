import { useLocation } from "wouter";
import { useApp } from "@/lib/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Plus, Edit, Trash2, Clock, Users, FileText, LogOut, Upload, AlertCircle, Camera, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { convertGoogleDriveUrl } from "@/lib/utils";
import { GoogleDriveImage } from "@/components/ui/GoogleDriveImage";

export default function Teacher() {
  const [, setLocation] = useLocation();
  const { currentUser, classes, registeredChildren, posts, addPost, updatePost, deletePost, logout, updateClass, teachers, updateTeacher, updateUserProfile, users } = useApp();

  // 선생님의 담임반 정보
  const teacherClassId = currentUser?.classId;
  const myClassData = classes.find(c => c.id === teacherClassId);
  const classStudents = registeredChildren.filter(child => child.classId === teacherClassId);

  console.log('Teacher page - currentUser:', currentUser);
  console.log('Teacher page - teacherClassId:', teacherClassId);
  console.log('Teacher page - myClassData:', myClassData);
  console.log('Teacher page - classes:', classes);

  // 상태 관리
  const [activeTab, setActiveTab] = useState("overview");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostParentId, setNewPostParentId] = useState("all"); // 알림장의 경우 특정 학부모 선택
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  
  // 교육 계획안 상태
  const [curriclumUrl, setCurriculumUrl] = useState(myClassData?.description || "");
  const [isCurriculumEditOpen, setIsCurriculumEditOpen] = useState(false);

  // 일과표 편집 상태
  const [editingSchedule, setEditingSchedule] = useState(myClassData?.schedule || []);
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleActivity, setNewScheduleActivity] = useState("");
  const [isScheduleEditOpen, setIsScheduleEditOpen] = useState(false);

  // 활동사진 상태
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  // 선생님 프로필 상태
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [isProfilePhotoDialogOpen, setIsProfilePhotoDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editPhone, setEditPhone] = useState(currentUser?.phone || "");

  const classNotices = posts.filter(p => p.classId === teacherClassId && p.type === 'board');

  if (!currentUser || currentUser.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">선생님만 접근할 수 있습니다.</p>
          <Button onClick={() => setLocation("/")} className="bg-orange-500 hover:bg-orange-600">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!myClassData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">담임반 정보 없음</h1>
          <p className="text-gray-600 mb-6">담당하는 반의 정보를 찾을 수 없습니다.</p>
          <Button onClick={() => setLocation("/")} className="bg-orange-500 hover:bg-orange-600">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const handleAddSchedule = () => {
    if (!newScheduleTime || !newScheduleActivity) {
      toast({ variant: "destructive", description: "시간과 활동을 입력해주세요." });
      return;
    }
    setEditingSchedule([...editingSchedule, { time: newScheduleTime, activity: newScheduleActivity }]);
    setNewScheduleTime("");
    setNewScheduleActivity("");
  };

  const handleDeleteSchedule = (index: number) => {
    setEditingSchedule(editingSchedule.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = async () => {
    if (!teacherClassId) return;
    await updateClass(teacherClassId, { schedule: editingSchedule });
    setIsScheduleEditOpen(false);
    toast({ title: "일과표 저장 완료", description: "반의 일과표가 업데이트되어 저장되었습니다." });
  };

  const handleSavePost = async () => {
    if (!newPostTitle || !newPostContent) {
      toast({ variant: "destructive", description: "제목과 내용을 입력해주세요." });
      return;
    }

    const postData = {
      title: newPostTitle,
      content: newPostContent,
      type: 'board' as const,
      author: currentUser.name,
      classId: teacherClassId,
      parentId: newPostParentId !== "all" ? newPostParentId : undefined,
    };

    try {
    if (editingPostId) {
        await updatePost(editingPostId, postData);
        toast({ title: "공지사항 수정 완료", description: "변경사항이 저장되었습니다." });
    } else {
        await addPost(postData);
        toast({ title: "공지사항 작성 완료", description: "공지사항이 저장되었습니다." });
    }
    setIsPostDialogOpen(false);
    setEditingPostId(null);
    setNewPostTitle("");
    setNewPostContent("");
      setNewPostParentId("all");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "저장 실패", 
        description: error.message || "서버에 저장하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
      });
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPostId(post.id);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    setNewPostParentId(post.parentId || "all");
    setIsPostDialogOpen(true);
  };

  const handleDeletePost = async (postId: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deletePost(postId);
      toast({ description: "공지사항이 삭제되었습니다." });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "삭제 실패", 
          description: error.message || "서버에서 삭제하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
        });
      }
    }
  };

  const handleSaveCurriculum = async () => {
    if (!curriclumUrl) {
      toast({ variant: "destructive", description: "교육 계획안 내용을 입력해주세요." });
      return;
    }
    if (!teacherClassId) return;
    await updateClass(teacherClassId, { description: curriclumUrl });
    setIsCurriculumEditOpen(false);
    toast({ title: "교육 계획안 저장 완료", description: "변경사항이 저장되었습니다." });
  };

  const handleAddPhoto = async () => {
    if (!photoTitle || !photoUrl) {
      toast({ variant: "destructive", description: "제목과 이미지 URL을 입력해주세요." });
      return;
    }

    try {
      await addPost({
      title: photoTitle,
      content: `[활동사진] ${photoTitle}`,
      type: 'album',
      author: currentUser.name,
      classId: teacherClassId,
      images: [photoUrl]
    });
    setIsPhotoDialogOpen(false);
    setPhotoTitle("");
    setPhotoUrl("");
      toast({ title: "활동사진 등록 완료", description: "활동사진이 저장되었습니다." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "등록 실패", 
        description: error.message || "서버에 저장하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
      });
    }
  };

  const handleSaveProfilePhoto = async () => {
    if (!profilePhotoUrl) {
      toast({ variant: "destructive", description: "사진 URL을 입력해주세요." });
      return;
    }

    const myTeacher = teachers.find(t => t.id === currentUser?.id);
    if (myTeacher) {
      // 구글 드라이브 링크인 경우 변환
      const finalPhotoUrl = profilePhotoUrl.includes('drive.google.com')
        ? convertGoogleDriveUrl(profilePhotoUrl)
        : profilePhotoUrl;
      
      await updateTeacher(currentUser.id, { photoUrl: finalPhotoUrl });
      setIsProfilePhotoDialogOpen(false);
      setProfilePhotoUrl("");
      toast({ title: "선생님 사진이 저장되었습니다.", description: "변경사항이 저장되었습니다." });
    }
  };

  const handleDeleteProfilePhoto = async () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await updateTeacher(currentUser.id, { photoUrl: undefined });
      toast({ description: "사진이 삭제되었습니다." });
    }
  };

  const handleSaveProfileEdit = async () => {
    if (!editName) { toast({ variant: 'destructive', description: '이름을 입력해주세요.' }); return; }
    if (currentUser?.id) {
      await updateTeacher(currentUser.id, { name: editName, phone: editPhone });
      await updateUserProfile({ name: editName, phone: editPhone });
      setIsProfileEditOpen(false);
      toast({ title: '프로필이 저장되었습니다.', description: "변경사항이 저장되었습니다." });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !newPasswordCheck) {
      toast({ variant: "destructive", description: "새 비밀번호를 입력해주세요." });
      return;
    }
    if (newPassword !== newPasswordCheck) {
      toast({ variant: "destructive", description: "비밀번호가 일치하지 않습니다." });
      return;
    }
    if (newPassword.length < 4) {
      toast({ variant: "destructive", description: "비밀번호는 4자 이상이어야 합니다." });
      return;
    }

    // 선생님 정보와 사용자 프로필 모두 업데이트하여 저장 보장
    await updateTeacher(currentUser.id, { password: newPassword });
    await updateUserProfile({ password: newPassword });
    setIsPasswordDialogOpen(false);
    setNewPassword("");
    setNewPasswordCheck("");
    toast({ title: "비밀번호가 변경되었습니다.", description: "변경사항이 저장되었습니다." });
  };

  const activityPhotos = posts.filter(p => p.classId === teacherClassId && p.type === 'album');

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {myClassData.name} 담임실
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  <span className="font-bold">{currentUser.name}</span> 선생님의 교실 관리 대시보드
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-2">
                  👶 담당 학생: {classStudents.length}명
                </p>
              </div>
              <Button
                onClick={() => {
                  logout();
                  setLocation("/");
                  toast({ description: "로그아웃되었습니다." });
                }}
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <LogOut className="w-4 h-4" /> 로그아웃
              </Button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 mb-6 sticky top-20 z-40">
            <div className="flex gap-2 flex-wrap overflow-x-auto -mx-1 px-1">
              {[
                { id: 'overview', label: '📊 대시보드', icon: '📊' },
                { id: 'students', label: '👥 학생 관리', icon: '👥' },
                { id: 'schedule', label: '⏰ 일과표', icon: '⏰' },
                { id: 'curriculum', label: '📋 교육 계획안', icon: '📋' },
                { id: 'photos', label: '📸 활동사진', icon: '📸' },
                { id: 'notices', label: '📢 공지사항', icon: '📢' },
                { id: 'profile', label: '👤 프로필', icon: '👤' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 대시보드 */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl font-bold text-orange-500 mb-2">{classStudents.length}</div>
                <div className="text-gray-600">담당 학생 수</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl font-bold text-blue-500 mb-2">{classNotices.length}</div>
                <div className="text-gray-600">등록된 공지사항</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl font-bold text-green-500 mb-2">{editingSchedule.length}</div>
                <div className="text-gray-600">일과 활동 수</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl font-bold text-pink-500 mb-2">{activityPhotos.length}</div>
                <div className="text-gray-600">활동사진 수</div>
              </div>
            </div>
          )}

          {/* 학생 관리 */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                {myClassData.name} 학생 목록 ({classStudents.length}명)
              </h2>
              {classStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">등록된 학생이 없습니다.</p>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>생년월일</TableHead>
                        <TableHead>학부모 승인</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.birthDate}</TableCell>
                          <TableCell>
                            {student.parentId && student.parentId !== 'pending' ? (
                              <Badge className="bg-green-100 text-green-800">✅ 승인됨</Badge>
                            ) : (
                              <Badge variant="secondary">⏳ 대기중</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* 일과표 관리 */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">하루 일과표</h2>
                <Dialog open={isScheduleEditOpen} onOpenChange={setIsScheduleEditOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                      <Edit className="w-4 h-4" /> 편집
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>일과표 관리</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="시간 (예: 09:00)"
                          value={newScheduleTime}
                          onChange={(e) => setNewScheduleTime(e.target.value)}
                        />
                        <Input
                          placeholder="활동 내용"
                          value={newScheduleActivity}
                          onChange={(e) => setNewScheduleActivity(e.target.value)}
                        />
                        <Button onClick={handleAddSchedule} className="bg-blue-500 hover:bg-blue-600">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {editingSchedule.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-bold text-orange-600">{item.time}</div>
                              <div className="text-gray-700">{item.activity}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSchedule(idx)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveSchedule} className="bg-orange-500 hover:bg-orange-600 text-white">
                        저장
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {editingSchedule.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">아직 일과표가 없습니다. 위의 편집 버튼으로 추가해주세요.</p>
                ) : (
                  editingSchedule.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors">
                      <div className="font-bold text-orange-500 min-w-20">{item.time}</div>
                      <div className="text-gray-700 flex-1">{item.activity}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 교육 계획안 */}
          {activeTab === 'curriculum' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">📋 교육 계획안</h2>
                <Dialog open={isCurriculumEditOpen} onOpenChange={setIsCurriculumEditOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                      <Upload className="w-4 h-4" /> 업로드/수정
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>교육 계획안 업로드</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">계획안 내용 또는 파일 링크</label>
                        <Textarea
                          placeholder="교육 계획안의 내용을 입력하거나 문서 링크를 붙여넣기 해주세요.

예) https://docs.google.com/document/..."
                          value={curriclumUrl}
                          onChange={(e) => setCurriculumUrl(e.target.value)}
                          rows={8}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        💡 팁: Google Docs, OneDrive 등의 공유 링크를 입력하면 해당 문서로 직접 이동할 수 있습니다.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveCurriculum} className="bg-orange-500 hover:bg-orange-600 text-white">
                        저장
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                {curriclumUrl ? (
                  <div>
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{curriclumUrl}</p>
                    {curriclumUrl.startsWith('http') && (
                      <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
                        <a href={curriclumUrl} target="_blank" rel="noopener noreferrer">
                          📄 문서 열기
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">등록된 교육 계획안이 없습니다.</p>
                )}
              </div>
            </div>
          )}

          {/* 활동사진 */}
          {activeTab === 'photos' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">📸 활동사진</h2>
                <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                      <Plus className="w-4 h-4" /> 사진 등록
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>활동사진 등록</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="사진 제목 (예: 우리 반 공원 산책)"
                        value={photoTitle}
                        onChange={(e) => setPhotoTitle(e.target.value)}
                      />
                      <Input
                        placeholder="이미지 URL 또는 구글 드라이브 링크"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                      />
                      {photoUrl && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">미리보기:</p>
                          <div className="w-full max-w-xs h-48 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <GoogleDriveImage 
                              src={photoUrl} 
                              alt="사진 미리보기" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        💡 팁: 구글 드라이브 링크를 복사해서 붙여넣으세요. (파일이 "링크가 있는 모든 사용자"로 공유되어 있어야 합니다)
                      </p>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddPhoto} className="bg-orange-500 hover:bg-orange-600 text-white">
                        등록
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activityPhotos.length === 0 ? (
                  <p className="col-span-full text-gray-500 text-center py-8">등록된 활동사진이 없습니다.</p>
                ) : (
                  activityPhotos.map((photo) => (
                    <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {photo.images && photo.images[0] && (
                        <GoogleDriveImage src={photo.images[0]} alt={photo.title} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 mb-1">{photo.title}</h3>
                        <p className="text-xs text-gray-500 mb-3">{new Date(photo.date).toLocaleDateString('ko-KR')}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePost(photo.id)}
                          className="text-red-500 hover:bg-red-50 w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> 삭제
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 공지사항 */}
          {activeTab === 'notices' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">📢 공지사항</h2>
                <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingPostId(null);
                        setNewPostTitle("");
                        setNewPostContent("");
                        setNewPostParentId("all");
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                    >
                      <Plus className="w-4 h-4" /> 공지사항 작성
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPostId ? "공지사항 수정" : "새 공지사항 작성"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="제목"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                      />
                      <Textarea
                        placeholder="내용을 입력해주세요"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={6}
                      />
                      <div>
                        <label className="text-sm font-medium mb-1 block">대상 학부모 (선택사항)</label>
                        <Select onValueChange={setNewPostParentId} value={newPostParentId}>
                          <SelectTrigger><SelectValue placeholder="전체 학부모" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">전체 학부모</SelectItem>
                            {users
                              .filter(u => u.role === 'parent' && u.child?.classId === teacherClassId)
                              .map(u => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.name} ({u.child?.name})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">특정 학부모를 선택하면 해당 학부모만 볼 수 있습니다.</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleSavePost}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {editingPostId ? "수정 완료" : "작성"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {classNotices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">작성한 공지사항이 없습니다.</p>
                ) : (
                  classNotices.map((post) => (
                    <div
                      key={post.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{post.title}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(post.date).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPost(post)}
                            className="text-blue-500 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 프로필 */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* 선생님 정보 카드 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">👤 선생님 정보</h2>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 프로필 사진 */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center overflow-hidden border-2 border-orange-300">
                      {(() => {
                        const myTeacher = teachers.find(t => t.id === currentUser?.id);
                        if (myTeacher?.photoUrl) {
                          return <GoogleDriveImage src={myTeacher.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" />;
                        }
                        return <Camera className="w-12 h-12 text-white" />;
                      })()}
                    </div>
                    <div className="flex gap-2 w-full">
                      <Dialog open={isProfilePhotoDialogOpen} onOpenChange={setIsProfilePhotoDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2">
                            <Upload className="w-4 h-4" /> 사진 변경
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>프로필 사진 업로드</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="이미지 URL 또는 구글 드라이브 링크"
                              value={profilePhotoUrl}
                              onChange={(e) => setProfilePhotoUrl(e.target.value)}
                            />
                            {profilePhotoUrl && (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">미리보기:</p>
                                <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                  <GoogleDriveImage 
                                    src={profilePhotoUrl} 
                                    alt="프로필 사진 미리보기" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              💡 팁: 구글 드라이브 링크를 복사해서 붙여넣으세요. (파일이 "링크가 있는 모든 사용자"로 공유되어 있어야 합니다)
                            </p>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleSaveProfilePhoto} className="bg-orange-500 hover:bg-orange-600 text-white">
                              저장
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {(() => {
                        const myTeacher = teachers.find(t => t.id === currentUser?.id);
                        return myTeacher?.photoUrl && (
                          <Button
                            onClick={handleDeleteProfilePhoto}
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 정보 표시 */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">이름</label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 font-medium">{currentUser.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">아이디</label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 font-medium">{currentUser.username}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">담당 반</label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 font-medium">{myClassData.name}</div>
                    </div>
                    {(() => {
                      const myTeacher = teachers.find(t => t.id === currentUser?.id);
                      return myTeacher?.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">연락처</label>
                          <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 font-medium">{myTeacher.phone}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Dialog open={isProfileEditOpen} onOpenChange={(open) => {
                    setIsProfileEditOpen(open);
                    if (open) { setEditName(currentUser?.name || ''); setEditPhone(currentUser?.phone || ''); }
                  }}>
                      <DialogTrigger asChild>
                      <Button variant="outline" className="bg-white border border-gray-200 text-gray-800">정보 수정</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>프로필 수정</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="이름" />
                        <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="연락처" />
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSaveProfileEdit} className="bg-orange-500 hover:bg-orange-600 text-white">저장</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* 비밀번호 변경 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" /> 보안 설정
                </h2>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                      <Lock className="w-4 h-4" /> 비밀번호 변경
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>비밀번호 변경</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                        <Input
                          type="password"
                          placeholder="새 비밀번호를 입력해주세요"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                        <Input
                          type="password"
                          placeholder="비밀번호를 다시 입력해주세요"
                          value={newPasswordCheck}
                          onChange={(e) => setNewPasswordCheck(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleChangePassword} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
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

      <Footer />
    </div>
  );
}
