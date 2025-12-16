import { MapPin, Phone, Clock, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-orange-50 pt-12 pb-6 border-t border-orange-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold text-orange-600 mb-4">코코베베어린이집</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              아이들이 날마다 행복해지는 곳,<br />
              따뜻한 사랑으로 아이들의 꿈을 키워갑니다.
            </p>
            <div className="flex gap-4">
               {/* Social Icons placeholder */}
               <div className="w-8 h-8 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-400 hover:bg-orange-100 cursor-pointer transition-colors">f</div>
               <div className="w-8 h-8 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-400 hover:bg-orange-100 cursor-pointer transition-colors">i</div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4">오시는 길 & 연락처</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                <span>서울 강서구 양천로75길 57<br/>현대1차아파트 104동 102호</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>02-2659-7977</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>info@cocobebe.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4">운영 시간</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="font-medium text-gray-800">평일:</span> 07:30 ~ 19:30
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="font-medium text-gray-800">야간연장:</span> 19:30 ~ 21:30
              </li>
              
              <li className="text-orange-600 text-xs mt-2">
                * 토요일, 공휴일, 일요일은 휴원입니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-200/50 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Coco Bebe Daycare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
