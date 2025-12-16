import { useLocation } from "wouter";
import { useApp } from "@/lib/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Plus, Edit, Trash2, LogOut, Upload, AlertCircle, Calendar, FileText, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { convertGoogleDriveUrl } from "@/lib/utils";
import { GoogleDriveImage } from "@/components/ui/GoogleDriveImage";

export default function Nutritionist() {
  const [, setLocation] = useLocation();
  const { currentUser, posts, addPost, updatePost, deletePost, logout, updateUserProfile, users } = useApp();

  // 상태 관리
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [menuImageUrl, setMenuImageUrl] = useState("");
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

  // 식단표 목록 (menu 타입만)
  const menuPosts = posts
    .filter((p) => p.type === "menu")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!currentUser || currentUser.role !== 'nutritionist') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">영양사만 접근할 수 있습니다.</p>
          <Button onClick={() => setLocation("/")} className="bg-orange-500 hover:bg-orange-600">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveMenu = async () => {
    if (!newPostTitle) {
      toast({ variant: "destructive", description: "제목을 입력해주세요." });
      return;
    }
    if (!menuImageUrl) {
      toast({ variant: "destructive", description: "식단표 이미지를 업로드해주세요." });
      return;
    }

    // 구글 드라이브 링크인 경우 변환
    const finalImageUrl = menuImageUrl.includes('drive.google.com')
      ? convertGoogleDriveUrl(menuImageUrl)
      : menuImageUrl;

    const postData = {
      title: newPostTitle,
      content: newPostContent || "식단표를 확인해주세요.",
      type: 'menu' as const,
      author: currentUser.name,
      images: [finalImageUrl],
    };

    try {
      if (editingPostId) {
        await updatePost(editingPostId, postData);
        toast({ title: "식단표 수정 완료" });
      } else {
        await addPost(postData);
        toast({ title: "식단표 등록 완료", description: "알림마당에 식단표가 게시되었습니다." });
      }
      setIsMenuDialogOpen(false);
      setEditingPostId(null);
      setNewPostTitle("");
      setNewPostContent("");
      setMenuImageUrl("");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "저장 실패", 
        description: error.message || "서버에 저장하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
      });
    }
  };

  const handleEditMenu = (post: any) => {
    setEditingPostId(post.id);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    setMenuImageUrl(post.images?.[0] || "");
    setIsMenuDialogOpen(true);
  };

  const handleDeleteMenu = async (postId: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deletePost(postId);
        toast({ description: "식단표가 삭제되었습니다." });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "삭제 실패", 
          description: error.message || "서버에서 삭제하지 못했습니다. 서버가 실행 중인지 확인해주세요." 
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2 md:gap-3">
                  <UtensilsCrossed className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                  영양사 대시보드
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  <span className="font-bold">{currentUser.name}</span> 선생님의 식단표 관리
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-2">
                  📋 등록된 식단표: {menuPosts.length}개
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

          {/* 탭 네비게이션 - 식단표 관리 탭은 숨김, 대시보드만 표시 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 mb-6 sticky top-20 z-40">
            <div className="flex gap-2 flex-wrap overflow-x-auto -mx-1 px-1">
              <button
                className="px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors whitespace-nowrap bg-orange-500 text-white"
              >
                📊 대시보드
              </button>
            </div>
          </div>

          {/* 대시보드 탭 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 식단표 등록 강조 카드 */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <UtensilsCrossed className="w-6 h-6" />
                      빠른 식단표 등록
                    </h2>
                    <p className="text-orange-50 mb-4">새로운 식단표를 빠르게 등록하세요.</p>
                    <Button 
                      onClick={() => setActiveTab('menus')}
                      className="bg-white text-orange-600 hover:bg-orange-50 gap-2 font-bold"
                      size="lg"
                    >
                      <Plus className="w-5 h-5" /> 식단표 관리로 이동
                    </Button>
                  </div>
                </div>
              </div>

              {/* 통계 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">등록된 식단표</p>
                      <p className="text-3xl font-bold text-gray-800">{menuPosts.length}개</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">이번 달 식단표</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {menuPosts.filter(p => {
                          const postDate = new Date(p.date);
                          const now = new Date();
                          return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
                        }).length}개
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">최근 업로드</p>
                      <p className="text-sm font-bold text-gray-800">
                        {menuPosts.length > 0 ? menuPosts[0].date : "없음"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 최근 식단표 미리보기 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">최근 식단표</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('menus')}
                    className="text-sm"
                  >
                    전체 관리 →
                  </Button>
                </div>

                {menuPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuPosts.slice(0, 6).map((menu) => (
                      <div
                        key={menu.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setActiveTab('menus')}
                      >
                        {menu.images && menu.images[0] && (
                          <GoogleDriveImage
                            src={menu.images[0]}
                            alt={menu.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{menu.title}</h3>
                          <p className="text-xs text-gray-500">{menu.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">등록된 식단표가 없습니다</p>
                    <p className="text-sm mb-4">식단표 관리 탭에서 첫 식단표를 등록해보세요.</p>
                    <Button 
                      onClick={() => setActiveTab('menus')}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      식단표 등록하러 가기
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 식단표 관리 탭 */}
          {activeTab === 'menus' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">식단표 관리</h2>
                <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
                      <Plus className="w-4 h-4" /> 식단표 등록
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPostId ? "식단표 수정" : "식단표 등록"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">제목 *</label>
                        <Input
                          placeholder="예: 12월 식단표"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">설명 (선택)</label>
                        <Textarea
                          placeholder="식단표에 대한 설명을 입력하세요"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">식단표 이미지 URL *</label>
                        <Input
                          placeholder="이미지 URL 또는 구글 드라이브 링크를 입력하세요"
                          value={menuImageUrl}
                          onChange={(e) => setMenuImageUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          구글 드라이브 링크도 자동으로 변환됩니다.
                        </p>
                        {menuImageUrl && (
                          <div className="mt-3">
                            <GoogleDriveImage
                              src={menuImageUrl}
                              alt="식단표 미리보기"
                              className="max-w-full h-auto rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsMenuDialogOpen(false);
                        setEditingPostId(null);
                        setNewPostTitle("");
                        setNewPostContent("");
                        setMenuImageUrl("");
                      }}>
                        취소
                      </Button>
                      <Button onClick={handleSaveMenu} className="bg-orange-500 hover:bg-orange-600">
                        {editingPostId ? "수정" : "등록"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {menuPosts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">번호</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead className="w-32">미리보기</TableHead>
                        <TableHead className="w-32 text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuPosts.map((menu, idx) => (
                        <TableRow key={menu.id}>
                          <TableCell className="text-center">{menuPosts.length - idx}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-800">{menu.title}</p>
                              {menu.content && (
                                <p className="text-sm text-gray-500 mt-1">{menu.content}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{menu.date}</TableCell>
                          <TableCell>
                            {menu.images && menu.images[0] && (
                              <GoogleDriveImage
                                src={menu.images[0]}
                                alt={menu.title}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMenu(menu)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMenu(menu.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  등록된 식단표가 없습니다. 식단표를 등록해주세요.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

