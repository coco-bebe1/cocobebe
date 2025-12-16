import { Calendar, Clock, Users, Star, Heart, Sun, Music, BookOpen } from "lucide-react";

export const CLASSES = [
  {
    id: "faith1",
    name: "사랑1반",
    age: "만 0세",
    teacher: "안혜경 선생님",
    color: "bg-yellow-100 text-yellow-800",
    icon: Star,
    description: "오감을 통해 세상을 탐색하고 안정적인 애착을 형성합니다.",
    schedule: [
      { time: "09:00", activity: "등원 및 자유놀이" },
      { time: "09:30", activity: "오전 간식" },
      { time: "10:00", activity: "활동 놀이" },
      { time: "10:30", activity: "오전 간식" },
      { time: "11:30", activity: "점심 식사" },
      { time: "13:00", activity: "휴식 및 독서" },
      { time: "15:00", activity: "오후 간식" },
      { time: "16:00", activity: "자유 놀이" },
      { time: "16:00", activity: "하원 지도" },
    ]
  },
  {
    id: "faith2",
    name: "사랑2반",
    age: "만 0세",
    teacher: "이사랑 선생님",
    color: "bg-orange-100 text-orange-800",
    icon: Sun,
    description: "신체 움직임이 활발해지고 또래와의 상호작용을 시작합니다.",
    schedule: [
      { time: "09:00", activity: "등원 및 자유놀이" },
      { time: "09:30", activity: "오전 간식" },
      { time: "10:00", activity: "활동 놀이" },
      { time: "10:30", activity: "오전 간식" },
      { time: "11:30", activity: "점심 식사" },
      { time: "13:00", activity: "휴식 및 독서" },
      { time: "15:00", activity: "오후 간식" },
      { time: "16:00", activity: "자유 놀이" },
      { time: "16:00", activity: "하원 지도" },
    ]
  },
  {
    id: "love",
    name: "믿음1반",
    age: "만 1세",
    teacher: "윤해란 선생님",
    color: "bg-pink-100 text-pink-800",
    icon: Heart,
    description: "기본생활습관을 형성하고 다양한 표현활동을 즐깁니다.",
    schedule: [
      { time: "09:00", activity: "등원 및 자유놀이" },
      { time: "09:30", activity: "오전 간식" },
      { time: "10:00", activity: "활동 놀이" },
      { time: "10:30", activity: "오전 간식" },
      { time: "11:30", activity: "점심 식사" },
      { time: "13:00", activity: "휴식 및 독서" },
      { time: "15:00", activity: "오후 간식" },
      { time: "16:00", activity: "자유 놀이" },
      { time: "16:00", activity: "하원 지도" },
    ]
  },
  {
    id: "hope1",
    name: "믿음1반",
    age: "만 1세",
    teacher: "최희망 선생님",
    color: "bg-blue-100 text-blue-800",
    icon: Music,
    description: "상상력과 창의력을 키우며 협동하는 즐거움을 배웁니다.",
    schedule: [
      { time: "09:00", activity: "등원 및 자유놀이" },
      { time: "09:30", activity: "오전 간식" },
      { time: "10:00", activity: "활동 놀이" },
      { time: "10:30", activity: "오전 간식" },
      { time: "11:30", activity: "점심 식사" },
      { time: "13:00", activity: "휴식 및 독서" },
      { time: "15:00", activity: "오후 간식" },
      { time: "16:00", activity: "자유 놀이" },
      { time: "16:00", activity: "하원 지도" },
    ]
  },
  {
    id: "hope2",
    name: "소망반",
    age: "만 2세",
    teacher: "정하늘 선생님",
    color: "bg-green-100 text-green-800",
    icon: BookOpen,
    description: "교육과 리더십 함양에 집중합니다.",
    schedule: [
      { time: "09:00", activity: "등원 및 자유놀이" },
      { time: "09:30", activity: "오전 간식" },
      { time: "10:00", activity: "활동 놀이" },
      { time: "10:30", activity: "오전 간식" },
      { time: "11:30", activity: "점심 식사" },
      { time: "13:00", activity: "휴식 및 독서" },
      { time: "15:00", activity: "오후 간식" },
      { time: "16:00", activity: "자유 놀이" },
      { time: "16:00", activity: "하원 지도" },
    ]
  }
];

export const NOTICES = [
  { id: 1, title: "[공지] 12월 겨울방학 안내", date: "2025-12-01", author: "원장님", type: "notice" },
  { id: 2, title: "[행사] 크리스마스 산타 잔치", date: "2025-11-28", author: "관리자", type: "event" },
  { id: 3, title: "[식단] 12월 식단표 안내", date: "2025-11-25", author: "영양사", type: "notice" },
];

export const ALBUM_IMAGES = [
  { id: 1, url: "https://drive.google.com/file/d/1l8KEaPsrDbcIkio6WqmP-t59YqxL-F9e/view?usp=sharing", title: "가을 소풍" },
  { id: 2, url: "https://drive.google.com/file/d/1CoRrmMxWQdbcxo6zP5ZjFxgTWo3-bxcm/view?usp=sharing", title: "방문 간호사" },
  { id: 3, url: "https://drive.google.com/file/d/1p0Ex5B6RiobnXpHNj4z-NV_7YNxwDrI8/view?usp=sharing", title: "수업" },
  { id: 4, url: "https://images.unsplash.com/photo-1596968132113-a6a22bf42ea6?auto=format&fit=crop&q=80", title: "미술 시간" },
];

export const EVENTS = [
  { month: "3월", title: "입학식 및 오리엔테이션" },
  { month: "4월", title: "봄 소풍" },
  { month: "5월", title: "어린이날 행사 / 부모 참여 수업" },
  { month: "6월", title: "시장 놀이" },
  { month: "7월", title: "여름 물놀이 캠프" },
  { month: "8월", title: "여름 방학" },
  { month: "9월", title: "민속의 날 행사" },
  { month: "10월", title: "가을 운동회" },
  { month: "11월", title: "작은 음악회" },
  { month: "12월", title: "산타 잔치 / 겨울 방학" },
  { month: "1월", title: "새해 맞이 행사" },
  { month: "2월", title: "졸업식 및 수료식" },
];
