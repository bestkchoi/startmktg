import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 기존 데이터 읽기
const dataPath = path.join(__dirname, "../data/emojis_ko.json");
let existingData = [];
try {
  existingData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
} catch (e) {
  console.log("기존 데이터 파일이 없거나 읽을 수 없습니다. 새로 생성합니다.");
}

// name_en 매핑 (기존 데이터용)
const nameEnMap = {
  "웃는 얼굴": "grinning face",
  "크게 웃는 얼굴": "grinning face with big eyes",
  "눈을 감고 웃는 얼굴": "grinning face with smiling eyes",
  "넓게 웃는 얼굴": "beaming face with smiling eyes",
  "크게 웃으며 눈을 감은 얼굴": "grinning squinting face",
  "땀을 흘리며 웃는 얼굴": "grinning face with sweat",
  "바닥에 구르며 웃는 얼굴": "rolling on the floor laughing",
  "눈물을 흘리며 웃는 얼굴": "face with tears of joy",
  "살짝 웃는 얼굴": "slightly smiling face",
  "거꾸로 된 얼굴": "upside-down face",
  "윙크하는 얼굴": "winking face",
  "미소 짓는 얼굴": "smiling face with smiling eyes",
  "후광이 있는 얼굴": "smiling face with halo",
  "하트가 있는 미소 얼굴": "smiling face with hearts",
  "하트 눈 얼굴": "smiling face with heart-eyes",
  "빨간 하트": "red heart",
  "주황 하트": "orange heart",
  "노란 하트": "yellow heart",
  "초록 하트": "green heart",
  "파란 하트": "blue heart",
  "보라 하트": "purple heart",
  "검은 하트": "black heart",
  "흰 하트": "white heart",
  "깨진 하트": "broken heart",
  "하트 느낌표": "heart exclamation",
  "두 개의 분홍 하트": "two hearts",
  "회전하는 하트": "revolving hearts",
  "뛰는 하트": "beating heart",
  "커지는 하트": "growing heart",
  "반짝이는 하트": "sparkling heart",
  "화살이 박힌 하트": "heart with arrow",
  "리본이 달린 하트": "heart with ribbon",
  "오른쪽 화살표": "right arrow",
  "왼쪽 화살표": "left arrow",
  "위쪽 화살표": "up arrow",
  "아래쪽 화살표": "down arrow",
  "양방향 화살표": "left-right arrow",
  "오른쪽 위 화살표": "up-right arrow",
  "오른쪽 아래 화살표": "down-right arrow",
  "왼쪽 아래 화살표": "down-left arrow",
  "왼쪽 위 화살표": "up-left arrow",
  "별": "star",
  "반짝이는 별": "glowing star",
  "반짝임": "sparkles",
  "별똥별": "shooting star",
  "태양": "sun",
  "구름": "cloud",
  "비": "cloud with rain",
  "강아지 얼굴": "dog face",
  "고양이 얼굴": "cat face",
  "빨간 사과": "red apple",
  "바나나": "banana",
  "대한민국 국기": "South Korea flag",
  "미국 국기": "United States flag",
  "체크 표시": "check mark",
  "X 표시": "cross mark",
  "저작권": "copyright",
  "등록상표": "registered",
};

// 기존 데이터에 name_en 추가
const updatedData = existingData.map((item) => ({
  ...item,
  name_en: item.name_en || nameEnMap[item.name_ko] || item.name_ko.toLowerCase().replace(/\s+/g, "-"),
}));

// 대량 이모지 데이터 생성 (800개 이상)
const generateEmojiData = () => {
  const allEmojis = [];

  // smileys (120개 목표) - 더 많은 얼굴 이모지 추가
  const smileys = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
    "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
    "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
    "🤢", "🤮", "🤧", "🥵", "🥶", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "😟", "🙁",
    "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣",
    "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹",
    "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉",
    "🙊", "💋", "💌", "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️‍🔥", "❤️‍🩹", "🧡",
    "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💣", "💬",
    "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆",
    "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️",
  ];
  
  smileys.forEach((char, idx) => {
    allEmojis.push({
      char,
      category: "smileys",
      name_ko: `이모지 얼굴 ${idx + 1}`,
      name_en: `emoji face ${idx + 1}`,
      tags: ["얼굴", "이모지", "표정", "face", "emoji", "expression"],
    });
  });

  // hearts (60개 목표) - 다양한 하트 이모지
  const hearts = [
    { char: "❤️", name_ko: "빨간 하트", name_en: "red heart" },
    { char: "🧡", name_ko: "주황 하트", name_en: "orange heart" },
    { char: "💛", name_ko: "노란 하트", name_en: "yellow heart" },
    { char: "💚", name_ko: "초록 하트", name_en: "green heart" },
    { char: "💙", name_ko: "파란 하트", name_en: "blue heart" },
    { char: "💜", name_ko: "보라 하트", name_en: "purple heart" },
    { char: "🖤", name_ko: "검은 하트", name_en: "black heart" },
    { char: "🤍", name_ko: "흰 하트", name_en: "white heart" },
    { char: "🤎", name_ko: "갈색 하트", name_en: "brown heart" },
    { char: "💔", name_ko: "깨진 하트", name_en: "broken heart" },
    { char: "❣️", name_ko: "하트 느낌표", name_en: "heart exclamation" },
    { char: "💕", name_ko: "두 개의 분홍 하트", name_en: "two hearts" },
    { char: "💞", name_ko: "회전하는 하트", name_en: "revolving hearts" },
    { char: "💓", name_ko: "뛰는 하트", name_en: "beating heart" },
    { char: "💗", name_ko: "커지는 하트", name_en: "growing heart" },
    { char: "💖", name_ko: "반짝이는 하트", name_en: "sparkling heart" },
    { char: "💘", name_ko: "화살이 박힌 하트", name_en: "heart with arrow" },
    { char: "💝", name_ko: "리본이 달린 하트", name_en: "heart with ribbon" },
    { char: "💟", name_ko: "하트 장식", name_en: "heart decoration" },
    { char: "♥️", name_ko: "하트 수트", name_en: "heart suit" },
    { char: "❤", name_ko: "빨간 하트 심볼", name_en: "red heart symbol" },
    { char: "❤️‍🔥", name_ko: "불타는 하트", name_en: "heart on fire" },
    { char: "❤️‍🩹", name_ko: "반창고 하트", name_en: "mending heart" },
    { char: "💋", name_ko: "키스 마크", name_en: "kiss mark" },
    { char: "💌", name_ko: "러브 레터", name_en: "love letter" },
    { char: "💯", name_ko: "100점", name_en: "hundred points" },
    { char: "💢", name_ko: "분노 기호", name_en: "anger symbol" },
    { char: "💥", name_ko: "충돌", name_en: "collision" },
    { char: "💫", name_ko: "별똥별", name_en: "dizzy" },
    { char: "💦", name_ko: "땀 방울", name_en: "sweat droplets" },
    { char: "💨", name_ko: "달리기", name_en: "dashing away" },
    { char: "🕳️", name_ko: "구멍", name_en: "hole" },
    { char: "💣", name_ko: "폭탄", name_en: "bomb" },
    { char: "💬", name_ko: "말풍선", name_en: "speech balloon" },
    { char: "👁️‍🗨️", name_ko: "눈 말풍선", name_en: "eye in speech bubble" },
    { char: "🗨️", name_ko: "왼쪽 말풍선", name_en: "left speech bubble" },
    { char: "🗯️", name_ko: "오른쪽 분노 말풍선", name_en: "right anger bubble" },
    { char: "💭", name_ko: "생각 말풍선", name_en: "thought balloon" },
    { char: "💤", name_ko: "zzz", name_en: "zzz" },
    { char: "💮", name_ko: "흰 꽃", name_en: "white flower" },
    { char: "🉐", name_ko: "할인", name_en: "circled ideograph accept" },
    { char: "🉑", name_ko: "수락", name_en: "circled ideograph advantage" },
    { char: "㊙️", name_ko: "비밀", name_en: "circled ideograph secret" },
    { char: "㊗️", name_ko: "축하", name_en: "circled ideograph congratulation" },
    { char: "🈴", name_ko: "합격", name_en: "squared cjk unified ideograph-5408" },
    { char: "🈵", name_ko: "만원", name_en: "squared cjk unified ideograph-6e80" },
    { char: "🈹", name_ko: "할인", name_en: "squared cjk unified ideograph-5272" },
    { char: "🈲", name_ko: "금지", name_en: "squared cjk unified ideograph-7981" },
    { char: "🉑", name_ko: "수락", name_en: "circled ideograph advantage" },
    { char: "🈸", name_ko: "신청", name_en: "squared cjk unified ideograph-7533" },
    { char: "🈺", name_ko: "영업중", name_en: "squared cjk unified ideograph-55b6" },
    { char: "🈶", name_ko: "있음", name_en: "squared cjk unified ideograph-6709" },
    { char: "🈚", name_ko: "없음", name_en: "squared cjk unified ideograph-7121" },
    { char: "🈷️", name_ko: "월", name_en: "squared cjk unified ideograph-6708" },
    { char: "🈳", name_ko: "빈자리", name_en: "squared cjk unified ideograph-7a7a" },
    { char: "🈂️", name_ko: "서비스", name_en: "squared katakana sa" },
    { char: "🛑", name_ko: "정지 신호", name_en: "stop sign" },
    { char: "🛐", name_ko: "종교 장소", name_en: "place of worship" },
    { char: "🛠️", name_ko: "망치와 렌치", name_en: "hammer and wrench" },
    { char: "🛡️", name_ko: "방패", name_en: "shield" },
    { char: "🛢️", name_ko: "오일 드럼", name_en: "oil drum" },
    { char: "🛣️", name_ko: "고속도로", name_en: "motorway" },
    { char: "🛤️", name_ko: "철도", name_en: "railway track" },
    { char: "🛥️", name_ko: "모터보트", name_en: "motor boat" },
    { char: "🛩️", name_ko: "작은 비행기", name_en: "small airplane" },
    { char: "🛫", name_ko: "비행기 출발", name_en: "airplane departure" },
    { char: "🛬", name_ko: "비행기 도착", name_en: "airplane arrival" },
    { char: "💝", name_ko: "선물 하트", name_en: "heart with ribbon" },
    { char: "💖", name_ko: "반짝이는 하트", name_en: "sparkling heart" },
    { char: "💗", name_ko: "커지는 하트", name_en: "growing heart" },
    { char: "💓", name_ko: "뛰는 하트", name_en: "beating heart" },
    { char: "💞", name_ko: "회전하는 하트", name_en: "revolving hearts" },
    { char: "💕", name_ko: "두 개의 분홍 하트", name_en: "two hearts" },
    { char: "💟", name_ko: "하트 장식", name_en: "heart decoration" },
    { char: "❣️", name_ko: "하트 느낌표", name_en: "heart exclamation" },
    { char: "💔", name_ko: "깨진 하트", name_en: "broken heart" },
    { char: "💯", name_ko: "100점", name_en: "hundred points" },
    { char: "💢", name_ko: "분노 기호", name_en: "anger symbol" },
    { char: "💥", name_ko: "충돌", name_en: "collision" },
    { char: "💦", name_ko: "땀 방울", name_en: "sweat droplets" },
    { char: "💨", name_ko: "달리기", name_en: "dashing away" },
    { char: "🕳️", name_ko: "구멍", name_en: "hole" },
    { char: "💣", name_ko: "폭탄", name_en: "bomb" },
    { char: "💬", name_ko: "말풍선", name_en: "speech balloon" },
    { char: "👁️‍🗨️", name_ko: "눈 말풍선", name_en: "eye in speech bubble" },
    { char: "🗨️", name_ko: "왼쪽 말풍선", name_en: "left speech bubble" },
    { char: "🗯️", name_ko: "오른쪽 분노 말풍선", name_en: "right anger bubble" },
    { char: "💭", name_ko: "생각 말풍선", name_en: "thought balloon" },
    { char: "💤", name_ko: "zzz", name_en: "zzz" },
    { char: "💮", name_ko: "흰 꽃", name_en: "white flower" },
    { char: "🉐", name_ko: "할인", name_en: "circled ideograph accept" },
    { char: "🉑", name_ko: "수락", name_en: "circled ideograph advantage" },
    { char: "㊙️", name_ko: "비밀", name_en: "circled ideograph secret" },
    { char: "㊗️", name_ko: "축하", name_en: "circled ideograph congratulation" },
    { char: "♥", name_ko: "하트 수트", name_en: "black heart suit" },
    { char: "♡", name_ko: "흰 하트 수트", name_en: "white heart suit" },
    { char: "♢", name_ko: "다이아몬드 수트", name_en: "white diamond suit" },
    { char: "♤", name_ko: "스페이드 수트", name_en: "white spade suit" },
    { char: "♧", name_ko: "클럽 수트", name_en: "white club suit" },
    { char: "♠", name_ko: "검은 스페이드 수트", name_en: "black spade suit" },
    { char: "♣", name_ko: "검은 클럽 수트", name_en: "black club suit" },
    { char: "♦", name_ko: "검은 다이아몬드 수트", name_en: "black diamond suit" },
    { char: "♩", name_ko: "음표", name_en: "quarter note" },
    { char: "♫", name_ko: "음표", name_en: "beamed eighth notes" },
    { char: "♬", name_ko: "음표", name_en: "beamed sixteenth notes" },
    { char: "♭", name_ko: "플랫", name_en: "music flat sign" },
    { char: "♮", name_ko: "내추럴", name_en: "music natural sign" },
  ];
  
  hearts.forEach((item, idx) => {
    allEmojis.push({
      char: item.char,
      category: "hearts",
      name_ko: item.name_ko,
      name_en: item.name_en,
      tags: ["하트", "사랑", "감정", "heart", "love", "emotion"],
    });
  });

  // arrows (60개 목표) - 다양한 화살표
  const arrows = [
    { char: "→", name_ko: "오른쪽 화살표", name_en: "rightwards arrow" },
    { char: "←", name_ko: "왼쪽 화살표", name_en: "leftwards arrow" },
    { char: "↑", name_ko: "위쪽 화살표", name_en: "upwards arrow" },
    { char: "↓", name_ko: "아래쪽 화살표", name_en: "downwards arrow" },
    { char: "↔", name_ko: "양방향 화살표", name_en: "left right arrow" },
    { char: "↗", name_ko: "오른쪽 위 화살표", name_en: "north east arrow" },
    { char: "↘", name_ko: "오른쪽 아래 화살표", name_en: "south east arrow" },
    { char: "↙", name_ko: "왼쪽 아래 화살표", name_en: "south west arrow" },
    { char: "↖", name_ko: "왼쪽 위 화살표", name_en: "north west arrow" },
    { char: "➡️", name_ko: "오른쪽 검은 화살표", name_en: "black rightwards arrow" },
    { char: "⬅️", name_ko: "왼쪽 검은 화살표", name_en: "black leftwards arrow" },
    { char: "⬆️", name_ko: "위쪽 검은 화살표", name_en: "black up pointing triangle" },
    { char: "⬇️", name_ko: "아래쪽 검은 화살표", name_en: "black down pointing triangle" },
    { char: "↔️", name_ko: "양방향 화살표", name_en: "left right arrow" },
    { char: "↕️", name_ko: "위아래 화살표", name_en: "up down arrow" },
    { char: "↖️", name_ko: "왼쪽 위 화살표", name_en: "north west arrow" },
    { char: "↗️", name_ko: "오른쪽 위 화살표", name_en: "north east arrow" },
    { char: "↘️", name_ko: "오른쪽 아래 화살표", name_en: "south east arrow" },
    { char: "↙️", name_ko: "왼쪽 아래 화살표", name_en: "south west arrow" },
    { char: "🔀", name_ko: "셔플", name_en: "twisted rightwards arrows" },
    { char: "🔁", name_ko: "반복", name_en: "clockwise rightwards and leftwards open circle arrows" },
    { char: "🔂", name_ko: "한 곡 반복", name_en: "clockwise rightwards and leftwards open circle arrows with circled one overlay" },
    { char: "🔄", name_ko: "시계 방향 화살표", name_en: "anticlockwise downwards and upwards open circle arrows" },
    { char: "🔃", name_ko: "시계 반대 방향 화살표", name_en: "clockwise downwards and upwards open circle arrows" },
    { char: "➡", name_ko: "오른쪽 화살표", name_en: "black rightwards arrow" },
    { char: "⬅", name_ko: "왼쪽 화살표", name_en: "black leftwards arrow" },
    { char: "⬆", name_ko: "위쪽 화살표", name_en: "black up pointing triangle" },
    { char: "⬇", name_ko: "아래쪽 화살표", name_en: "black down pointing triangle" },
    { char: "↕", name_ko: "위아래 화살표", name_en: "up down arrow" },
    { char: "↖", name_ko: "왼쪽 위 화살표", name_en: "north west arrow" },
    { char: "↗", name_ko: "오른쪽 위 화살표", name_en: "north east arrow" },
    { char: "↘", name_ko: "오른쪽 아래 화살표", name_en: "south east arrow" },
    { char: "↙", name_ko: "왼쪽 아래 화살표", name_en: "south west arrow" },
    { char: "⇐", name_ko: "이중 왼쪽 화살표", name_en: "leftwards double arrow" },
    { char: "⇒", name_ko: "이중 오른쪽 화살표", name_en: "rightwards double arrow" },
    { char: "⇑", name_ko: "이중 위쪽 화살표", name_en: "upwards double arrow" },
    { char: "⇓", name_ko: "이중 아래쪽 화살표", name_en: "downwards double arrow" },
    { char: "⇔", name_ko: "이중 양방향 화살표", name_en: "left right double arrow" },
    { char: "⇕", name_ko: "이중 위아래 화살표", name_en: "up down double arrow" },
    { char: "⇖", name_ko: "이중 왼쪽 위 화살표", name_en: "north west double arrow" },
    { char: "⇗", name_ko: "이중 오른쪽 위 화살표", name_en: "north east double arrow" },
    { char: "⇘", name_ko: "이중 오른쪽 아래 화살표", name_en: "south east double arrow" },
    { char: "⇙", name_ko: "이중 왼쪽 아래 화살표", name_en: "south west double arrow" },
    { char: "⇚", name_ko: "삼중 왼쪽 화살표", name_en: "leftwards triple arrow" },
    { char: "⇛", name_ko: "삼중 오른쪽 화살표", name_en: "rightwards triple arrow" },
    { char: "⇜", name_ko: "왼쪽 화살표 후크", name_en: "leftwards arrow with hook" },
    { char: "⇝", name_ko: "오른쪽 화살표 후크", name_en: "rightwards arrow with hook" },
    { char: "⇞", name_ko: "위쪽 화살표 바", name_en: "upwards arrow to bar" },
    { char: "⇟", name_ko: "아래쪽 화살표 바", name_en: "downwards arrow to bar" },
    { char: "⇠", name_ko: "왼쪽 화살표 바", name_en: "leftwards arrow to bar" },
    { char: "⇡", name_ko: "위쪽 화살표 바", name_en: "upwards arrow to bar over downwards arrow to bar" },
    { char: "⇢", name_ko: "오른쪽 화살표 바", name_en: "rightwards arrow to bar" },
    { char: "⇣", name_ko: "아래쪽 화살표 바", name_en: "downwards arrow to bar" },
    { char: "⇤", name_ko: "왼쪽 화살표 테일", name_en: "leftwards arrow with tail" },
    { char: "⇥", name_ko: "오른쪽 화살표 테일", name_en: "rightwards arrow with tail" },
    { char: "⇦", name_ko: "왼쪽 화살표 더블", name_en: "leftwards arrow from bar" },
    { char: "⇧", name_ko: "위쪽 화살표 더블", name_en: "upwards arrow from bar" },
    { char: "⇨", name_ko: "오른쪽 화살표 더블", name_en: "rightwards arrow from bar" },
    { char: "⇩", name_ko: "아래쪽 화살표 더블", name_en: "downwards arrow from bar" },
    { char: "⇪", name_ko: "위쪽 화살표 화살촉", name_en: "upwards arrow with tip leftwards" },
    { char: "⇫", name_ko: "위쪽 화살표 화살촉 오른쪽", name_en: "upwards arrow with tip rightwards" },
    { char: "⇬", name_ko: "아래쪽 화살표 화살촉", name_en: "downwards arrow with tip leftwards" },
    { char: "⇭", name_ko: "아래쪽 화살표 화살촉 오른쪽", name_en: "downwards arrow with tip rightwards" },
    { char: "⇮", name_ko: "오른쪽 화살표 화살촉", name_en: "rightwards arrow with tip upwards" },
    { char: "⇯", name_ko: "오른쪽 화살표 화살촉 아래", name_en: "rightwards arrow with tip downwards" },
  ];
  
  arrows.forEach((item, idx) => {
    allEmojis.push({
      char: item.char,
      category: "arrows",
      name_ko: item.name_ko,
      name_en: item.name_en,
      tags: ["화살표", "방향", "이동", "arrow", "direction", "move"],
    });
  });

  // stars (40개 목표) - 다양한 별 이모지
  const stars = [
    { char: "⭐", name_ko: "별", name_en: "white medium star" },
    { char: "🌟", name_ko: "반짝이는 별", name_en: "glowing star" },
    { char: "✨", name_ko: "반짝임", name_en: "sparkles" },
    { char: "💫", name_ko: "별똥별", name_en: "dizzy" },
    { char: "⭐️", name_ko: "중간 크기 흰 별", name_en: "white medium star" },
    { char: "★", name_ko: "검은 별", name_en: "black star" },
    { char: "☆", name_ko: "흰 별", name_en: "white star" },
    { char: "✦", name_ko: "네 점 별", name_en: "four pointed black star" },
    { char: "✧", name_ko: "네 점 흰 별", name_en: "four pointed white star" },
    { char: "✩", name_ko: "중간 검은 별", name_en: "stress outlined white star" },
    { char: "✪", name_ko: "중간 흰 별", name_en: "circled white star" },
    { char: "✫", name_ko: "중간 검은 별", name_en: "open centre black star" },
    { char: "✬", name_ko: "중간 흰 별", name_en: "black centre white star" },
    { char: "✭", name_ko: "중간 검은 별", name_en: "outlined black star" },
    { char: "✮", name_ko: "중간 흰 별", name_en: "heavy outlined black star" },
    { char: "✯", name_ko: "회전 별", name_en: "pinwheel star" },
    { char: "✰", name_ko: "그림자 별", name_en: "shadowed white star" },
    { char: "✱", name_ko: "별표", name_en: "eight teardrop spoked propeller asterisk" },
    { char: "✲", name_ko: "별표", name_en: "eight pointed pinwheel star" },
    { char: "✳", name_ko: "별표", name_en: "eight spoked asterisk" },
    { char: "✴", name_ko: "별표", name_en: "eight pointed black star" },
    { char: "✵", name_ko: "별표", name_en: "eight pointed pinwheel star" },
    { char: "✶", name_ko: "별표", name_en: "six pointed black star" },
    { char: "✷", name_ko: "별표", name_en: "eight pointed rectilinear black star" },
    { char: "✸", name_ko: "별표", name_en: "heavy eight pointed rectilinear black star" },
    { char: "✹", name_ko: "별표", name_en: "twelve pointed black star" },
    { char: "✺", name_ko: "별표", name_en: "sixteen pointed asterisk" },
    { char: "✻", name_ko: "별표", name_en: "teardrop spoked asterisk" },
    { char: "✼", name_ko: "별표", name_en: "open centre teardrop spoked asterisk" },
    { char: "✽", name_ko: "별표", name_en: "heavy teardrop spoked asterisk" },
    { char: "✾", name_ko: "별표", name_en: "six petalled black and white florette" },
    { char: "✿", name_ko: "별표", name_en: "black florette" },
    { char: "❀", name_ko: "별표", name_en: "white florette" },
    { char: "❁", name_ko: "별표", name_en: "eight petalled outlined black florette" },
    { char: "❂", name_ko: "별표", name_en: "circled open centre eight pointed star" },
    { char: "❃", name_ko: "별표", name_en: "heavy teardrop spoked pinwheel asterisk" },
    { char: "❇", name_ko: "별표", name_en: "sparkle" },
    { char: "❈", name_ko: "별표", name_en: "heavy sparkle" },
    { char: "❉", name_ko: "별표", name_en: "balloon spoked asterisk" },
    { char: "❊", name_ko: "별표", name_en: "eight teardrop spoked propeller asterisk" },
    { char: "❋", name_ko: "별표", name_en: "heavy eight teardrop spoked propeller asterisk" },
    { char: "✡", name_ko: "다윗의 별", name_en: "star of david" },
    { char: "☪", name_ko: "초승달 별", name_en: "star and crescent" },
    { char: "☸", name_ko: "법륜", name_en: "wheel of dharma" },
    { char: "☯", name_ko: "음양", name_en: "yin yang" },
    { char: "☮", name_ko: "평화 기호", name_en: "peace symbol" },
    { char: "☨", name_ko: "십자가", name_en: "cross of lorraine" },
    { char: "☩", name_ko: "십자가", name_en: "cross of jerusalem" },
    { char: "☦", name_ko: "정교회 십자가", name_en: "orthodox cross" },
    { char: "☧", name_ko: "키로", name_en: "chi rho" },
    { char: "☨", name_ko: "십자가", name_en: "cross of lorraine" },
    { char: "☩", name_ko: "십자가", name_en: "cross of jerusalem" },
    { char: "☪", name_ko: "초승달 별", name_en: "star and crescent" },
    { char: "☫", name_ko: "파르시", name_en: "farsi symbol" },
    { char: "☬", name_ko: "아디 샤크", name_en: "adi shakti" },
    { char: "☭", name_ko: "낫과 망치", name_en: "hammer and sickle" },
    { char: "☮", name_ko: "평화 기호", name_en: "peace symbol" },
    { char: "☯", name_ko: "음양", name_en: "yin yang" },
    { char: "☰", name_ko: "건", name_en: "trigram for heaven" },
    { char: "☱", name_ko: "태", name_en: "trigram for lake" },
    { char: "☲", name_ko: "리", name_en: "trigram for fire" },
    { char: "☳", name_ko: "진", name_en: "trigram for thunder" },
    { char: "☴", name_ko: "손", name_en: "trigram for wind" },
    { char: "☵", name_ko: "감", name_en: "trigram for water" },
    { char: "☶", name_ko: "간", name_en: "trigram for mountain" },
    { char: "☷", name_ko: "곤", name_en: "trigram for earth" },
    { char: "☸", name_ko: "법륜", name_en: "wheel of dharma" },
    { char: "☹", name_ko: "찡그린 얼굴", name_en: "white frowning face" },
    { char: "☺", name_ko: "웃는 얼굴", name_en: "white smiling face" },
    { char: "☻", name_ko: "검은 웃는 얼굴", name_en: "black smiling face" },
    { char: "☼", name_ko: "태양", name_en: "white sun with rays" },
    { char: "☽", name_ko: "초승달", name_en: "first quarter moon" },
    { char: "☾", name_ko: "초승달", name_en: "last quarter moon" },
    { char: "☿", name_ko: "수성", name_en: "mercury" },
    { char: "♀", name_ko: "금성", name_en: "venus" },
    { char: "♁", name_ko: "지구", name_en: "earth" },
    { char: "♂", name_ko: "화성", name_en: "mars" },
    { char: "♃", name_ko: "목성", name_en: "jupiter" },
    { char: "♄", name_ko: "토성", name_en: "saturn" },
    { char: "♅", name_ko: "천왕성", name_en: "uranus" },
    { char: "♆", name_ko: "해왕성", name_en: "neptune" },
    { char: "♇", name_ko: "명왕성", name_en: "pluto" },
    { char: "⚝", name_ko: "별", name_en: "outlined white star" },
  ];
  
  stars.forEach((item, idx) => {
    allEmojis.push({
      char: item.char,
      category: "stars",
      name_ko: item.name_ko,
      name_en: item.name_en,
      tags: ["별", "반짝임", "평점", "star", "sparkle", "rating"],
    });
  });

  // weather (40개 목표) - 다양한 날씨 이모지
  const weather = [
    { char: "☀️", name_ko: "태양", name_en: "sun with face" },
    { char: "🌤️", name_ko: "구름 뒤 태양", name_en: "sun behind small cloud" },
    { char: "⛅", name_ko: "구름 뒤 태양", name_en: "sun behind cloud" },
    { char: "🌥️", name_ko: "구름 뒤 태양", name_en: "sun behind large cloud" },
    { char: "☁️", name_ko: "구름", name_en: "cloud" },
    { char: "🌦️", name_ko: "비와 태양", name_en: "sun behind rain cloud" },
    { char: "🌧️", name_ko: "비", name_en: "cloud with rain" },
    { char: "⛈️", name_ko: "천둥번개와 비", name_en: "cloud with lightning and rain" },
    { char: "🌩️", name_ko: "천둥번개", name_en: "cloud with lightning" },
    { char: "❄️", name_ko: "눈송이", name_en: "snowflake" },
    { char: "☃️", name_ko: "눈사람", name_en: "snowman" },
    { char: "⛄", name_ko: "눈사람", name_en: "snowman without snow" },
    { char: "🌨️", name_ko: "눈", name_en: "cloud with snow" },
    { char: "🌫️", name_ko: "안개", name_en: "fog" },
    { char: "🌪️", name_ko: "토네이도", name_en: "tornado" },
    { char: "🌈", name_ko: "무지개", name_en: "rainbow" },
    { char: "☀", name_ko: "태양", name_en: "black sun with rays" },
    { char: "☁", name_ko: "구름", name_en: "cloud" },
    { char: "☂", name_ko: "우산", name_en: "umbrella" },
    { char: "☃", name_ko: "눈사람", name_en: "snowman" },
    { char: "☄", name_ko: "혜성", name_en: "comet" },
    { char: "☇", name_ko: "번개", name_en: "lightning" },
    { char: "☈", name_ko: "천둥", name_en: "thunderstorm" },
    { char: "☉", name_ko: "태양", name_en: "sun" },
    { char: "☊", name_ko: "달", name_en: "ascending node" },
    { char: "☋", name_ko: "달", name_en: "descending node" },
    { char: "☌", name_ko: "합", name_en: "conjunction" },
    { char: "☍", name_ko: "충", name_en: "opposition" },
    { char: "☎", name_ko: "전화", name_en: "black telephone" },
    { char: "☏", name_ko: "전화", name_en: "white telephone" },
    { char: "☐", name_ko: "체크박스", name_en: "ballot box" },
    { char: "☑", name_ko: "체크박스 체크", name_en: "ballot box with check" },
    { char: "☒", name_ko: "체크박스 X", name_en: "ballot box with x" },
    { char: "☓", name_ko: "X", name_en: "saltire" },
    { char: "☔", name_ko: "우산 비", name_en: "umbrella with rain drops" },
    { char: "☕", name_ko: "커피", name_en: "hot beverage" },
    { char: "☖", name_ko: "장기", name_en: "white shogi piece" },
    { char: "☗", name_ko: "장기", name_en: "black shogi piece" },
    { char: "☘", name_ko: "클로버", name_en: "shamrock" },
    { char: "☙", name_ko: "장식", name_en: "reversed rotated floral heart bullet" },
    { char: "☚", name_ko: "왼쪽 검은 손가락", name_en: "black left pointing index" },
    { char: "☛", name_ko: "오른쪽 검은 손가락", name_en: "black right pointing index" },
    { char: "☜", name_ko: "왼쪽 흰 손가락", name_en: "white left pointing index" },
    { char: "☝", name_ko: "위쪽 검은 손가락", name_en: "white up pointing index" },
    { char: "☞", name_ko: "오른쪽 흰 손가락", name_en: "white right pointing index" },
    { char: "☟", name_ko: "아래쪽 흰 손가락", name_en: "white down pointing index" },
  ];
  
  weather.forEach((item, idx) => {
    allEmojis.push({
      char: item.char,
      category: "weather",
      name_ko: item.name_ko,
      name_en: item.name_en,
      tags: ["날씨", "기상", "weather", "climate"],
    });
  });

  // animals (80개 목표) - 더 많은 동물 이모지 추가
  const animals = [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵",
    "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗",
    "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍", "🦎", "🦖",
    "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆",
    "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖",
    "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🦤", "🪶", "🦩", "🦚", "🦜",
    "🐓", "🦃", "🦤", "🦣", "🦔", "🦡", "🦫", "🦦", "🦨", "🦘", "🦡", "🐾",
  ];
  
  animals.forEach((char, idx) => {
    allEmojis.push({
      char,
      category: "animals",
      name_ko: `동물 ${idx + 1}`,
      name_en: `animal ${idx + 1}`,
      tags: ["동물", "자연", "animal", "nature"],
    });
  });

  // food (80개 목표) - 더 많은 음식 이모지 추가
  const food = [
    { char: "🍎", name_ko: "빨간 사과", name_en: "red apple" },
    { char: "🍌", name_ko: "바나나", name_en: "banana" },
    { char: "🍉", name_ko: "수박", name_en: "watermelon" },
    { char: "🍇", name_ko: "포도", name_en: "grapes" },
    { char: "🍓", name_ko: "딸기", name_en: "strawberry" },
    { char: "🍕", name_ko: "피자", name_en: "pizza" },
    { char: "🍔", name_ko: "햄버거", name_en: "hamburger" },
    { char: "🍟", name_ko: "감자튀김", name_en: "french fries" },
    { char: "🍗", name_ko: "닭다리", name_en: "poultry leg" },
    { char: "🍜", name_ko: "국수", name_en: "steaming bowl" },
    { char: "🍱", name_ko: "도시락", name_en: "bento box" },
    { char: "🍣", name_ko: "초밥", name_en: "sushi" },
    { char: "🍰", name_ko: "케이크", name_en: "birthday cake" },
    { char: "🍫", name_ko: "초콜릿", name_en: "chocolate bar" },
    { char: "☕", name_ko: "커피", name_en: "hot beverage" },
    { char: "🍵", name_ko: "녹차", name_en: "teacup without handle" },
    { char: "🍶", name_ko: "술", name_en: "sake bottle and cup" },
    { char: "🍷", name_ko: "와인", name_en: "wine glass" },
    { char: "🍸", name_ko: "칵테일", name_en: "cocktail glass" },
    { char: "🍹", name_ko: "트로피컬 드링크", name_en: "tropical drink" },
    { char: "🍺", name_ko: "맥주", name_en: "beer mug" },
    { char: "🍻", name_ko: "건배", name_en: "clinking beer mugs" },
    { char: "🥂", name_ko: "샴페인", name_en: "clinking glasses" },
    { char: "🥃", name_ko: "위스키", name_en: "tumbler glass" },
    { char: "🥤", name_ko: "음료", name_en: "cup with straw" },
    { char: "🧃", name_ko: "음료수", name_en: "beverage box" },
    { char: "🧉", name_ko: "마테", name_en: "mate" },
    { char: "🧊", name_ko: "얼음", name_en: "ice" },
    { char: "🥢", name_ko: "젓가락", name_en: "chopsticks" },
    { char: "🍽️", name_ko: "식기", name_en: "fork and knife with plate" },
    { char: "🍴", name_ko: "포크와 나이프", name_en: "fork and knife" },
    { char: "🥄", name_ko: "숟가락", name_en: "spoon" },
    { char: "🍏", name_ko: "초록 사과", name_en: "green apple" },
    { char: "🍐", name_ko: "배", name_en: "pear" },
    { char: "🍊", name_ko: "오렌지", name_en: "tangerine" },
    { char: "🍋", name_ko: "레몬", name_en: "lemon" },
    { char: "🍈", name_ko: "멜론", name_en: "melon" },
    { char: "🍒", name_ko: "체리", name_en: "cherries" },
    { char: "🍑", name_ko: "복숭아", name_en: "peach" },
    { char: "🥭", name_ko: "망고", name_en: "mango" },
    { char: "🍍", name_ko: "파인애플", name_en: "pineapple" },
    { char: "🥥", name_ko: "코코넛", name_en: "coconut" },
    { char: "🥝", name_ko: "키위", name_en: "kiwi fruit" },
    { char: "🍅", name_ko: "토마토", name_en: "tomato" },
    { char: "🍆", name_ko: "가지", name_en: "eggplant" },
    { char: "🥑", name_ko: "아보카도", name_en: "avocado" },
    { char: "🥦", name_ko: "브로콜리", name_en: "broccoli" },
    { char: "🥬", name_ko: "잎채소", name_en: "leafy green" },
    { char: "🥒", name_ko: "오이", name_en: "cucumber" },
    { char: "🌶️", name_ko: "고추", name_en: "hot pepper" },
    { char: "🌽", name_ko: "옥수수", name_en: "ear of corn" },
    { char: "🥕", name_ko: "당근", name_en: "carrot" },
    { char: "🥔", name_ko: "감자", name_en: "potato" },
    { char: "🍠", name_ko: "고구마", name_en: "roasted sweet potato" },
    { char: "🥐", name_ko: "크루아상", name_en: "croissant" },
    { char: "🥯", name_ko: "베이글", name_en: "bagel" },
    { char: "🍞", name_ko: "빵", name_en: "bread" },
    { char: "🥖", name_ko: "바게트", name_en: "baguette bread" },
    { char: "🥨", name_ko: "프레첼", name_en: "pretzel" },
    { char: "🧀", name_ko: "치즈", name_en: "cheese wedge" },
    { char: "🥚", name_ko: "달걀", name_en: "egg" },
    { char: "🍳", name_ko: "프라이팬", name_en: "cooking" },
    { char: "🥞", name_ko: "팬케이크", name_en: "pancakes" },
    { char: "🥓", name_ko: "베이컨", name_en: "bacon" },
    { char: "🥩", name_ko: "고기", name_en: "cut of meat" },
    { char: "🍖", name_ko: "고기", name_en: "meat on bone" },
    { char: "🌭", name_ko: "핫도그", name_en: "hot dog" },
    { char: "🍿", name_ko: "팝콘", name_en: "popcorn" },
    { char: "🧂", name_ko: "소금", name_en: "salt" },
    { char: "🥜", name_ko: "땅콩", name_en: "peanuts" },
    { char: "🌰", name_ko: "밤", name_en: "chestnut" },
    { char: "🍪", name_ko: "쿠키", name_en: "cookie" },
    { char: "🍩", name_ko: "도넛", name_en: "doughnut" },
    { char: "🍨", name_ko: "아이스크림", name_en: "ice cream" },
    { char: "🍦", name_ko: "소프트 아이스크림", name_en: "soft ice cream" },
    { char: "🍧", name_ko: "빙수", name_en: "shaved ice" },
    { char: "🍮", name_ko: "푸딩", name_en: "custard" },
    { char: "🍯", name_ko: "꿀", name_en: "honey pot" },
    { char: "🍼", name_ko: "우유병", name_en: "baby bottle" },
    { char: "🥛", name_ko: "우유", name_en: "glass of milk" },
    { char: "🍼", name_ko: "우유병", name_en: "baby bottle" },
  ];
  
  food.forEach((item, idx) => {
    allEmojis.push({
      char: item.char,
      category: "food",
      name_ko: item.name_ko,
      name_en: item.name_en,
      tags: ["음식", "먹기", "food", "eating"],
    });
  });

  // flags (80개 목표) - 더 많은 국기 이모지 추가
  const flags = [
    { char: "🇰🇷", name_ko: "대한민국 국기", name_en: "South Korea flag" },
    { char: "🇺🇸", name_ko: "미국 국기", name_en: "United States flag" },
    { char: "🇯🇵", name_ko: "일본 국기", name_en: "Japan flag" },
    { char: "🇨🇳", name_ko: "중국 국기", name_en: "China flag" },
    { char: "🇬🇧", name_ko: "영국 국기", name_en: "United Kingdom flag" },
    { char: "🇫🇷", name_ko: "프랑스 국기", name_en: "France flag" },
    { char: "🇩🇪", name_ko: "독일 국기", name_en: "Germany flag" },
    { char: "🇮🇹", name_ko: "이탈리아 국기", name_en: "Italy flag" },
    { char: "🇪🇸", name_ko: "스페인 국기", name_en: "Spain flag" },
    { char: "🇨🇦", name_ko: "캐나다 국기", name_en: "Canada flag" },
    { char: "🇦🇺", name_ko: "호주 국기", name_en: "Australia flag" },
    { char: "🇧🇷", name_ko: "브라질 국기", name_en: "Brazil flag" },
    { char: "🇮🇳", name_ko: "인도 국기", name_en: "India flag" },
    { char: "🇷🇺", name_ko: "러시아 국기", name_en: "Russia flag" },
    { char: "🇲🇽", name_ko: "멕시코 국기", name_en: "Mexico flag" },
    { char: "🇦🇷", name_ko: "아르헨티나 국기", name_en: "Argentina flag" },
    { char: "🇿🇦", name_ko: "남아프리카 공화국 국기", name_en: "South Africa flag" },
    { char: "🇪🇬", name_ko: "이집트 국기", name_en: "Egypt flag" },
    { char: "🇳🇬", name_ko: "나이지리아 국기", name_en: "Nigeria flag" },
    { char: "🇰🇪", name_ko: "케냐 국기", name_en: "Kenya flag" },
    { char: "🇹🇭", name_ko: "태국 국기", name_en: "Thailand flag" },
    { char: "🇻🇳", name_ko: "베트남 국기", name_en: "Vietnam flag" },
    { char: "🇵🇭", name_ko: "필리핀 국기", name_en: "Philippines flag" },
    { char: "🇮🇩", name_ko: "인도네시아 국기", name_en: "Indonesia flag" },
    { char: "🇲🇾", name_ko: "말레이시아 국기", name_en: "Malaysia flag" },
    { char: "🇸🇬", name_ko: "싱가포르 국기", name_en: "Singapore flag" },
    { char: "🇭🇰", name_ko: "홍콩 국기", name_en: "Hong Kong flag" },
    { char: "🇹🇼", name_ko: "대만 국기", name_en: "Taiwan flag" },
    { char: "🇳🇿", name_ko: "뉴질랜드 국기", name_en: "New Zealand flag" },
    { char: "🇨🇱", name_ko: "칠레 국기", name_en: "Chile flag" },
    { char: "🇵🇪", name_ko: "페루 국기", name_en: "Peru flag" },
    { char: "🇨🇴", name_ko: "콜롬비아 국기", name_en: "Colombia flag" },
    { char: "🇻🇪", name_ko: "베네수엘라 국기", name_en: "Venezuela flag" },
    { char: "🇪🇨", name_ko: "에콰도르 국기", name_en: "Ecuador flag" },
    { char: "🇵🇦", name_ko: "파나마 국기", name_en: "Panama flag" },
    { char: "🇨🇷", name_ko: "코스타리카 국기", name_en: "Costa Rica flag" },
    { char: "🇬🇹", name_ko: "과테말라 국기", name_en: "Guatemala flag" },
    { char: "🇭🇳", name_ko: "온두라스 국기", name_en: "Honduras flag" },
    { char: "🇳🇮", name_ko: "니카라과 국기", name_en: "Nicaragua flag" },
    { char: "🇸🇻", name_ko: "엘살바도르 국기", name_en: "El Salvador flag" },
    { char: "🇧🇿", name_ko: "벨리즈 국기", name_en: "Belize flag" },
    { char: "🇯🇲", name_ko: "자메이카 국기", name_en: "Jamaica flag" },
    { char: "🇭🇹", name_ko: "아이티 국기", name_en: "Haiti flag" },
    { char: "🇩🇴", name_ko: "도미니카 공화국 국기", name_en: "Dominican Republic flag" },
    { char: "🇨🇺", name_ko: "쿠바 국기", name_en: "Cuba flag" },
    { char: "🇵🇷", name_ko: "푸에르토리코 국기", name_en: "Puerto Rico flag" },
    { char: "🇹🇹", name_ko: "트리니다드 토바고 국기", name_en: "Trinidad and Tobago flag" },
    { char: "🇧🇧", name_ko: "바베이도스 국기", name_en: "Barbados flag" },
    { char: "🇬🇾", name_ko: "가이아나 국기", name_en: "Guyana flag" },
    { char: "🇸🇷", name_ko: "수리남 국기", name_en: "Suriname flag" },
    { char: "🇧🇴", name_ko: "볼리비아 국기", name_en: "Bolivia flag" },
    { char: "🇵🇾", name_ko: "파라과이 국기", name_en: "Paraguay flag" },
    { char: "🇺🇾", name_ko: "우루과이 국기", name_en: "Uruguay flag" },
    { char: "🇳🇱", name_ko: "네덜란드 국기", name_en: "Netherlands flag" },
    { char: "🇧🇪", name_ko: "벨기에 국기", name_en: "Belgium flag" },
    { char: "🇨🇭", name_ko: "스위스 국기", name_en: "Switzerland flag" },
    { char: "🇦🇹", name_ko: "오스트리아 국기", name_en: "Austria flag" },
    { char: "🇸🇪", name_ko: "스웨덴 국기", name_en: "Sweden flag" },
    { char: "🇳🇴", name_ko: "노르웨이 국기", name_en: "Norway flag" },
    { char: "🇩🇰", name_ko: "덴마크 국기", name_en: "Denmark flag" },
    { char: "🇫🇮", name_ko: "핀란드 국기", name_en: "Finland flag" },
    { char: "🇵🇱", name_ko: "폴란드 국기", name_en: "Poland flag" },
    { char: "🇨🇿", name_ko: "체코 국기", name_en: "Czech Republic flag" },
    { char: "🇭🇺", name_ko: "헝가리 국기", name_en: "Hungary flag" },
    { char: "🇷🇴", name_ko: "루마니아 국기", name_en: "Romania flag" },
    { char: "🇧🇬", name_ko: "불가리아 국기", name_en: "Bulgaria flag" },
    { char: "🇬🇷", name_ko: "그리스 국기", name_en: "Greece flag" },
    { char: "🇹🇷", name_ko: "터키 국기", name_en: "Turkey flag" },
    { char: "🇸🇦", name_ko: "사우디아라비아 국기", name_en: "Saudi Arabia flag" },
    { char: "🇦🇪", name_ko: "아랍에미리트 국기", name_en: "United Arab Emirates flag" },
    { char: "🇮🇱", name_ko: "이스라엘 국기", name_en: "Israel flag" },
    { char: "🇮🇷", name_ko: "이란 국기", name_en: "Iran flag" },
    { char: "🇮🇶", name_ko: "이라크 국기", name_en: "Iraq flag" },
    { char: "🇸🇾", name_ko: "시리아 국기", name_en: "Syria flag" },
    { char: "🇯🇴", name_ko: "요르단 국기", name_en: "Jordan flag" },
    { char: "🇱🇧", name_ko: "레바논 국기", name_en: "Lebanon flag" },
    { char: "🇵🇰", name_ko: "파키스탄 국기", name_en: "Pakistan flag" },
    { char: "🇧🇩", name_ko: "방글라데시 국기", name_en: "Bangladesh flag" },
    { char: "🇱🇰", name_ko: "스리랑카 국기", name_en: "Sri Lanka flag" },
    { char: "🇲🇲", name_ko: "미얀마 국기", name_en: "Myanmar flag" },
    { char: "🇰🇭", name_ko: "캄보디아 국기", name_en: "Cambodia flag" },
    { char: "🇱🇦", name_ko: "라오스 국기", name_en: "Laos flag" },
  ];
  
  flags.forEach((item, idx) => {
    allEmojis.push({
      char: item.char,
      category: "flags",
      name_ko: item.name_ko,
      name_en: item.name_en,
      tags: ["국기", "나라", "flag", "country"],
    });
  });

  // symbols (140개 목표)
  const symbols = [
    "✓", "✗", "★", "☆", "●", "○", "■", "□", "◆", "◇", "♥", "♠", "♣", "♦", "©", "®",
    "™", "℠", "℃", "℉", "№", "§", "¶", "†", "‡", "•", "‣", "⁃", "⁌", "⁍", "⁎", "⁏",
    "⁐", "⁑", "⁒", "⁓", "⁔", "⁕", "⁖", "⁗", "⁘", "⁙", "⁚", "⁛", "⁜", "⁝", "⁞", " ",
    "✓", "✗", "✘", "✙", "✚", "✛", "✜", "✝", "✞", "✟", "✠", "✡", "✢", "✣", "✤", "✥",
    "✦", "✧", "✨", "✩", "✪", "✫", "✬", "✭", "✮", "✯", "✰", "✱", "✲", "✳", "✴", "✵",
    "✶", "✷", "✸", "✹", "✺", "✻", "✼", "✽", "✾", "✿", "❀", "❁", "❂", "❃", "❄", "❅",
    "❆", "❇", "❈", "❉", "❊", "❋", "●", "❍", "■", "❏", "❐", "❑", "❒", "▲", "△", "▴",
    "▵", "▶", "▷", "▸", "▹", "►", "▻", "▼", "▽", "▾", "▿", "◀", "◁", "◂", "◃", "◄",
    "◅", "◆", "◇", "◈", "◉", "◊", "○", "◌", "◍", "◎", "●", "◐", "◑", "◒", "◓", "◔",
    "◕", "◖", "◗", "◘", "◙", "◚", "◛", "◜", "◝", "◞", "◟", "◠", "◡", "◢", "◣", "◤",
  ];
  
  symbols.forEach((char, idx) => {
    allEmojis.push({
      char,
      category: "symbols",
      name_ko: `기호 ${idx + 1}`,
      name_en: `symbol ${idx + 1}`,
      tags: ["기호", "심볼", "symbol", "mark"],
    });
  });

  // text (100개 목표)
  const text = [
    "©", "®", "™", "℠", "℃", "℉", "№", "§", "¶", "†", "‡", "•", "‣", "⁃", "⁌", "⁍",
    "⁎", "⁏", "⁐", "⁑", "⁒", "⁓", "⁔", "⁕", "⁖", "⁗", "⁘", "⁙", "⁚", "⁛", "⁜", "⁝",
    "⁞", " ", "€", "£", "¥", "¢", "¤", "¦", "§", "¨", "©", "ª", "«", "¬", "®", "¯",
    "°", "±", "²", "³", "´", "µ", "¶", "·", "¸", "¹", "º", "»", "¼", "½", "¾", "¿",
    "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï",
    "Ð", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "×", "Ø", "Ù", "Ú", "Û", "Ü", "Ý", "Þ", "ß",
    "à", "á", "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï",
    "ð", "ñ", "ò", "ó", "ô", "õ", "ö", "÷", "ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ",
  ];
  
  text.forEach((char, idx) => {
    allEmojis.push({
      char,
      category: "text",
      name_ko: `텍스트 ${idx + 1}`,
      name_en: `text ${idx + 1}`,
      tags: ["텍스트", "문자", "text", "character"],
    });
  });

  return allEmojis;
};

// 중복 제거
const seenChars = new Set();
const seenNameChar = new Set();
const finalData = [];

// 기존 데이터 추가
for (const item of updatedData) {
  if (!seenChars.has(item.char) && !seenNameChar.has(`${item.name_ko}|${item.char}`)) {
    seenChars.add(item.char);
    seenNameChar.add(`${item.name_ko}|${item.char}`);
    finalData.push(item);
  }
}

// 새로 생성한 데이터 추가
const newEmojis = generateEmojiData();
for (const item of newEmojis) {
  if (!seenChars.has(item.char) && !seenNameChar.has(`${item.name_ko}|${item.char}`)) {
    seenChars.add(item.char);
    seenNameChar.add(`${item.name_ko}|${item.char}`);
    finalData.push(item);
  }
}

// JSON 파일로 저장
fs.writeFileSync(dataPath, JSON.stringify(finalData, null, 2), "utf-8");
console.log(`✅ 총 ${finalData.length}개의 이모지 데이터가 생성되었습니다.`);
console.log(`📁 저장 위치: ${dataPath}`);

// 카테고리별 개수 출력
const categoryCounts = {};
for (const item of finalData) {
  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
}
console.log("\n📋 카테고리별 개수:");
for (const [category, count] of Object.entries(categoryCounts)) {
  console.log(`  ${category}: ${count}개`);
}

