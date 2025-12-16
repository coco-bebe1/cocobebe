import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, UserCircle } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/generated_images/cute_minimal_bear_logo.png";
import { useApp } from "@/lib/AppContext";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useApp();

  const navItems = [
    { name: "어린이집 소개", path: "/about" },
    { name: "반 소개", path: "/classes" },
    { name: "공지사항", path: "/notices" },
    { name: "앨범", path: "/album" },
  ];

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-orange-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 group cursor-pointer"
        >
            <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center border-2 border-orange-200 group-hover:border-orange-300 transition-colors">
               <img src={logoImage} alt="Coco Bebe Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-xl text-orange-600 group-hover:text-orange-500 transition-colors">
              코코베베<span className="text-gray-600 text-lg font-sans font-medium ml-1">어린이집</span>
            </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-500 flex items-center gap-1",
                location === item.path || location.startsWith(item.path + "/") 
                  ? "text-orange-600 font-bold" 
                  : "text-gray-600"
              )}
            >
              {item.name}
            </Link>
          ))}
          
          {currentUser ? (
             <div className="flex items-center gap-2">
                <Link 
                  href={
                    currentUser.role === 'admin' ? "/admin" : 
                    currentUser.role === 'teacher' ? "/teacher" : 
                    currentUser.role === 'nutritionist' ? "/nutritionist" : 
                    "/profile"
                  }
                  className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-orange-100 transition-colors border border-orange-100"
                >
                  <UserCircle className="w-4 h-4" />
                  {currentUser.role === 'nutritionist' ? `${currentUser.name} 선생님` : `${currentUser.name}님`}
                </Link>
             </div>
          ) : (
             <Link 
               href="/login"
               className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
             >
               <UserCircle className="w-4 h-4" />
               학부모 로그인
             </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-orange-100 shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className="text-base font-medium text-gray-700 p-2 hover:bg-orange-50 rounded-lg block"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2">
             {currentUser ? (
                <Link 
                  href={
                    currentUser.role === 'admin' ? "/admin" : 
                    currentUser.role === 'teacher' ? "/teacher" : 
                    currentUser.role === 'nutritionist' ? "/nutritionist" : 
                    "/profile"
                  }
                  className="text-base font-bold text-orange-600 p-2 hover:bg-orange-50 rounded-lg flex items-center gap-2" 
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircle className="w-5 h-5" />
                  {currentUser.role === 'nutritionist' ? `${currentUser.name} 선생님` : `${currentUser.name}님`}
                  {currentUser.role !== 'admin' && currentUser.role !== 'teacher' && currentUser.role !== 'nutritionist' && ' (마이페이지)'}
                </Link>
             ) : (
                <Link 
                  href="/login"
                  className="text-base font-bold text-gray-700 p-2 hover:bg-orange-50 rounded-lg flex items-center gap-2" 
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircle className="w-5 h-5" />
                  로그인
                </Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}
