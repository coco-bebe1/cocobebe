import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Lock, UserPlus, Calendar } from "lucide-react";
import logoImage from "@assets/generated_images/cute_minimal_bear_logo.png";
import { useApp } from "@/lib/AppContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(4, "아이디는 4자 이상이어야 합니다.")
    .regex(/^[a-zA-Z0-9]+$/, "아이디는 영문과 숫자만 입력 가능합니다."),
  password: z.string().min(4, "비밀번호는 4자 이상이어야 합니다."),
  name: z.string().min(2, "이름을 입력해주세요."),
  phone: z.string().min(10, "올바른 연락처를 입력해주세요."),
  childName: z.string().min(1, "자녀 이름을 입력해주세요."),
  childBirthDate: z.string().min(1, "자녀 생년월일을 입력해주세요."),
});

export default function Login() {
  const { login, registerUser, matchChildWithParent, updateRegisteredChild, currentUser } = useApp();
  const [_, setLocation] = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", name: "", phone: "", childName: "", childBirthDate: "" },
  });

  function onLogin(values: z.infer<typeof loginSchema>) {
    const success = login(values.username, values.password);
    
    if (success) {
      // login 함수가 성공하면 currentUser가 설정되므로, 
      // 약간의 지연 후 localStorage에서 최신 사용자 정보를 가져옴
      setTimeout(() => {
      const userStore = localStorage.getItem('currentUser');
      const user = userStore ? JSON.parse(userStore) : null;
      
      if (user?.role === 'admin') {
         setLocation("/admin");
      } else if (user?.role === 'teacher') {
         toast({ title: "로그인 성공", description: "환영합니다, 선생님!" });
         setLocation("/teacher");
        } else if (user?.role === 'nutritionist') {
           toast({ title: "로그인 성공", description: "환영합니다, 영양사 선생님!" });
           setLocation("/nutritionist");
      } else {
         toast({ title: "로그인 성공", description: "환영합니다!" });
         if (user?.child?.classId) setLocation(`/classes/${user.child.classId}`);
         else setLocation("/");
      }
      }, 50);
    } else {
      toast({ variant: "destructive", title: "로그인 실패", description: "아이디/비번을 확인하거나 승인 대기중입니다." });
    }
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    const matchedChild = matchChildWithParent(values.childName, values.childBirthDate);
    
    if (!matchedChild) {
      toast({ 
        variant: "destructive", 
        title: "매칭 실패", 
        description: "입력한 자녀 정보가 등록된 아이와 일치하지 않습니다. 어린이집에 문의해주세요." 
      });
      return;
    }

    const birthYear = new Date(values.childBirthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    await registerUser({
      username: values.username,
      password: values.password,
      name: values.name,
      role: 'parent',
      phone: values.phone,
      child: {
        name: values.childName,
        age: age,
        classId: matchedChild.classId,
        birthDate: values.childBirthDate
      }
    });

    toast({ title: "가입 신청 완료", description: "자녀와 자동 연동되었습니다." });
    setIsRegistering(false);
    registerForm.reset();
  }

  return (
    <div className="min-h-screen bg-orange-50/50 font-sans flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 py-12">
         <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 md:p-12 border border-white">
            <div className="text-center mb-8">
               <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <img src={logoImage} alt="Logo" className="w-full h-full object-cover rounded-full" />
               </div>
               <h1 className="text-2xl font-bold text-gray-800 font-display">
                  {isRegistering ? "회원가입 신청" : "환영합니다!"}
               </h1>
               <p className="text-gray-500 mt-2 text-sm">
                  {isRegistering ? "학부모님 정보를 입력해주세요" : "학부모님 및 교직원 로그인"}
               </p>
            </div>

            {isRegistering ? (
               <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">학부모 성함</label>
                       <input
                         id="parent-name"
                         type="text"
                         autoComplete="off"
                         inputMode="text"
                         placeholder="이름을 입력하세요"
                         className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
                         {...registerForm.register("name")}
                       />
                       {registerForm.formState.errors.name && (
                         <p className="text-[0.8rem] font-medium text-destructive">
                           {registerForm.formState.errors.name.message}
                         </p>
                        )}
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                           control={registerForm.control}
                           name="username"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>아이디</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    autoComplete="username"
                                    inputMode="text"
                                    placeholder="아이디"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="bg-gray-50"
                                  />
                                </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={registerForm.control}
                           name="password"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>비밀번호</FormLabel>
                                 <FormControl><Input type="password" {...field} className="bg-gray-50" /></FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>
                     <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>연락처</FormLabel>
                                 <FormControl>
                                   <Input
                                     type="tel"
                                     autoComplete="tel"
                                     inputMode="tel"
                                     placeholder="010-0000-0000"
                                     {...field}
                                     value={field.value ?? ""}
                                     onChange={(e) => field.onChange(e.target.value)}
                                     className="bg-gray-50"
                                   />
                                 </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-orange-600 mb-3">자녀 정보 입력</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <FormField
                              control={registerForm.control}
                              name="childName"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>자녀 이름</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        autoComplete="name"
                                        inputMode="text"
                                        placeholder="자녀 이름"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="bg-gray-50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={registerForm.control}
                              name="childBirthDate"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>생년월일</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      {...field}
                                      value={field.value ?? ""}
                                      onChange={(e) => field.onChange(e.target.value)}
                                      className="bg-gray-50"
                                    />
                                  </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">* 어린이집에 등록된 자녀 정보와 일치해야 합니다.</p>
                     </div>
                     <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold mt-4">가입 신청하기</Button>
                     <Button type="button" variant="ghost" onClick={() => setIsRegistering(false)} className="w-full text-gray-500">취소</Button>
                  </form>
               </Form>
            ) : (
               <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                     <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel className="sr-only">아이디</FormLabel>
                              <FormControl>
                                 <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input placeholder="아이디" className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200" {...field} />
                                 </div>
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel className="sr-only">비밀번호</FormLabel>
                              <FormControl>
                                 <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input type="password" placeholder="비밀번호" className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200" {...field} />
                                 </div>
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <Button type="submit" className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg">로그인</Button>
                  </form>
               </Form>
            )}

            {!isRegistering && (
               <div className="mt-6 flex items-center justify-center">
                  <button onClick={() => setIsRegistering(true)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 font-medium transition-colors">
                     <UserPlus className="w-4 h-4" />
                     학부모 회원가입 신청
                  </button>
               </div>
            )}
            
         </div>
      </div>

      <Footer />
    </div>
  );
}
