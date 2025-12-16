import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/lib/AppContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useLocation } from "wouter";
import { UserCircle, Save, LogOut, Baby } from "lucide-react";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { CLASSES } from "@/lib/mockData";

const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  phone: z.string().min(1, "연락처를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  childName: z.string().min(1, "자녀 이름을 입력해주세요."),
  childAge: z.string().optional(), // 자동 계산 (표시용)
  childClassId: z.string().optional(), // 자동 연동 (표시용)
});

function computeAge(birthDate?: string): string {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age.toString();
}

export default function ParentProfile() {
  const { currentUser, updateUserProfile, logout, registeredChildren } = useApp();
  const [_, setLocation] = useLocation();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      childName: "",
      childAge: "",
      childClassId: "",
    },
  });

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
      return;
    }

    const matchedChild = currentUser.child
      ? registeredChildren.find(
          (c) =>
            c.name.trim() === currentUser.child!.name.trim() &&
            (!!currentUser.child!.birthDate
              ? c.birthDate === currentUser.child!.birthDate
              : true),
        )
      : undefined;

    const derivedClassId =
      matchedChild?.classId || currentUser.child?.classId || "";
    const derivedAge =
      computeAge(currentUser.child?.birthDate) ||
      (currentUser.child?.age != null ? currentUser.child.age.toString() : "");

    form.reset({
      name: currentUser.name,
      phone: currentUser.phone || "",
      password: currentUser.password,
      childName: currentUser.child?.name || "",
      childAge: derivedAge,
      childClassId: derivedClassId,
    });
  }, [currentUser, registeredChildren, setLocation, form]);

  function onSubmit(values: z.infer<typeof profileSchema>) {
    const matchedChild = registeredChildren.find(
      (c) => c.name.trim() === values.childName.trim(),
    );

    const derivedClassId =
      matchedChild?.classId || values.childClassId || currentUser?.child?.classId;

    const derivedAge =
      computeAge(matchedChild?.birthDate) ||
      values.childAge ||
      (currentUser?.child?.age != null ? currentUser.child.age.toString() : "");

    updateUserProfile({
      name: values.name,
      phone: values.phone,
      password: values.password,
      child: {
        name: values.childName,
        age: parseInt(derivedAge || "0") || currentUser?.child?.age || 0,
        classId: derivedClassId || "",
        birthDate: matchedChild?.birthDate || currentUser?.child?.birthDate,
      },
    });
    toast({
      title: "정보 수정 완료",
      description: "회원 정보가 성공적으로 업데이트되었습니다.",
    });
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      <div className="bg-orange-50 py-12 mb-8">
         <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-display mb-4">내 정보 관리</h1>
            <p className="text-gray-600">개인정보와 자녀 정보를 관리하세요.</p>
         </div>
      </div>

      <div className="container mx-auto px-4 pb-20 max-w-2xl">
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 bg-orange-50/30 border-b border-gray-100 flex items-center gap-6">
               <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 border-4 border-white shadow-sm">
                  <UserCircle className="w-12 h-12" />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-gray-800">{currentUser.name}</h2>
                  <p className="text-gray-500 text-sm">{currentUser.role === 'admin' ? '관리자' : '학부모 회원'}</p>
                  {currentUser.child && (
                     <div className="mt-2 flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                           <Baby className="w-3 h-3" />
                           {currentUser.child.name} ({currentUser.child.age}세)
                        </span>
                        <Link href={`/classes/${currentUser.child.classId}`}>
                           <a className="text-xs text-orange-500 underline hover:text-orange-600">
                              {CLASSES.find(c => c.id === currentUser.child?.classId)?.name} 바로가기 &rarr;
                           </a>
                        </Link>
                     </div>
                  )}
               </div>
            </div>

            <div className="p-8">
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     {/* Parent Info Section */}
                     <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-l-4 border-orange-400 pl-3">학부모 정보</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                           <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>이름</FormLabel>
                                    <FormControl>
                                       <Input {...field} className="bg-gray-50" />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>연락처</FormLabel>
                                    <FormControl>
                                       <Input {...field} className="bg-gray-50" />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>
                        <FormField
                           control={form.control}
                           name="password"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>비밀번호 변경</FormLabel>
                                 <FormControl>
                                    <Input type="password" {...field} className="bg-gray-50" />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>

                     {/* Child Info Section */}
                     <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="font-bold text-gray-800 border-l-4 border-green-400 pl-3">자녀 정보</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                           <FormField
                              control={form.control}
                              name="childName"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>자녀 이름</FormLabel>
                                    <FormControl>
                                       <Input {...field} className="bg-gray-50" placeholder="예: 김코코" />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="childAge"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>자녀 나이 (자동 계산)</FormLabel>
                                    <FormControl>
                                       <Input {...field} className="bg-gray-100 text-gray-500" disabled />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>
                        <FormField
                           control={form.control}
                           name="childClassId"
                           render={({ field }) => {
                             const classLabel = CLASSES.find((c) => c.id === field.value)?.name || "자동 연동";
                             return (
                              <FormItem>
                                 <FormLabel>자녀 반 (자동 연동)</FormLabel>
                                    <FormControl>
                                   <Input
                                     value={classLabel}
                                     readOnly
                                     className="bg-gray-100 text-gray-500"
                                   />
                                    </FormControl>
                                 <FormMessage />
                              </FormItem>
                             );
                           }}
                        />
                     </div>

                     <div className="flex gap-4 pt-4">
                        <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-6">
                           <Save className="w-4 h-4 mr-2" /> 정보 저장하기
                        </Button>
                        <Button 
                           type="button" 
                           variant="outline" 
                           className="w-24 border-gray-200 text-gray-600 hover:bg-gray-50 py-6"
                           onClick={() => {
                              logout();
                              setLocation("/");
                           }}
                        >
                           <LogOut className="w-4 h-4 mr-2" /> 로그아웃
                        </Button>
                     </div>
                  </form>
               </Form>
            </div>
         </div>
      </div>

      <Footer />
    </div>
  );
}
