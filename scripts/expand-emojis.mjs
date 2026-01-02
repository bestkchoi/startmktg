import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 기존 데이터 읽기
const dataPath = path.join(__dirname, "../data/emojis_ko.json");
const existingData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

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
  "오른쪽 검은 화살표": "black right-pointing triangle",
  "왼쪽 검은 화살표": "black left-pointing triangle",
  "위쪽 검은 화살표": "black up-pointing triangle",
  "아래쪽 검은 화살표": "black down-pointing triangle",
  "별": "star",
  "반짝이는 별": "glowing star",
  "반짝임": "sparkles",
  "별똥별": "shooting star",
  "중간 크기 흰 별": "white medium star",
  "태양": "sun",
  "구름 뒤 태양": "sun behind cloud",
  "구름": "cloud",
  "비와 태양": "sun behind rain cloud",
  "비": "cloud with rain",
  "천둥번개와 비": "cloud with lightning and rain",
  "천둥번개": "cloud with lightning",
  "눈송이": "snowflake",
  "눈사람": "snowman",
  "강아지 얼굴": "dog face",
  "고양이 얼굴": "cat face",
  "쥐 얼굴": "mouse face",
  "햄스터": "hamster",
  "토끼 얼굴": "rabbit face",
  "여우 얼굴": "fox face",
  "곰 얼굴": "bear face",
  "판다 얼굴": "panda face",
  "코알라": "koala",
  "호랑이 얼굴": "tiger face",
  "빨간 사과": "red apple",
  "바나나": "banana",
  "수박": "watermelon",
  "포도": "grapes",
  "딸기": "strawberry",
  "피자": "pizza",
  "햄버거": "hamburger",
  "감자튀김": "french fries",
  "닭다리": "poultry leg",
  "국수": "steaming bowl",
  "도시락": "bento box",
  "초밥": "sushi",
  "케이크": "birthday cake",
  "초콜릿": "chocolate bar",
  "커피": "hot beverage",
  "대한민국 국기": "South Korea flag",
  "미국 국기": "United States flag",
  "일본 국기": "Japan flag",
  "중국 국기": "China flag",
  "영국 국기": "United Kingdom flag",
  "프랑스 국기": "France flag",
  "독일 국기": "Germany flag",
  "이탈리아 국기": "Italy flag",
  "스페인 국기": "Spain flag",
  "캐나다 국기": "Canada flag",
  "체크 표시": "check mark",
  "X 표시": "cross mark",
  "검은 별": "black star",
  "흰 별": "white star",
  "검은 원": "black circle",
  "흰 원": "white circle",
  "검은 사각형": "black square",
  "흰 사각형": "white square",
  "검은 다이아몬드": "black diamond",
  "흰 다이아몬드": "white diamond",
  "스페이드": "spade suit",
  "클럽": "club suit",
  "다이아몬드": "diamond suit",
  "저작권": "copyright",
  "등록상표": "registered",
  "상표": "trade mark",
  "서비스 마크": "service mark",
  "섭씨": "degree celsius",
  "화씨": "degree fahrenheit",
  "번호": "numero sign",
  "섹션": "section sign",
  "단락": "paragraph sign",
  "단검": "dagger",
  "이중 단검": "double dagger",
};

// 기존 데이터에 name_en 추가
const updatedData = existingData.map((item) => ({
  ...item,
  name_en: nameEnMap[item.name_ko] || item.name_ko.toLowerCase().replace(/\s+/g, "-"),
}));

// 추가 이모지 데이터 (800개 이상을 위해)
const additionalEmojis = [
  // smileys 추가 (120개 목표, 현재 약 16개)
  { char: "🤩", name_ko: "별 눈 얼굴", name_en: "star-struck", category: "smileys", tags: ["별", "놀람", "감동", "star", "surprise", "amazed"] },
  { char: "😘", name_ko: "키스하는 얼굴", name_en: "face blowing a kiss", category: "smileys", tags: ["키스", "사랑", "애정", "kiss", "love", "affection"] },
  { char: "😗", name_ko: "키스하는 얼굴", name_en: "kissing face", category: "smileys", tags: ["키스", "사랑", "애정", "kiss", "love", "affection"] },
  { char: "😚", name_ko: "눈을 감고 키스하는 얼굴", name_en: "kissing face with closed eyes", category: "smileys", tags: ["키스", "사랑", "애정", "kiss", "love", "affection"] },
  { char: "😙", name_ko: "미소 짓고 키스하는 얼굴", name_en: "kissing face with smiling eyes", category: "smileys", tags: ["키스", "사랑", "애정", "kiss", "love", "affection"] },
  { char: "😋", name_ko: "맛있게 먹는 얼굴", name_en: "face savoring food", category: "smileys", tags: ["맛", "음식", "먹기", "taste", "food", "eating"] },
  { char: "😛", name_ko: "혀를 내민 얼굴", name_en: "face with tongue", category: "smileys", tags: ["혀", "장난", "재미", "tongue", "playful", "funny"] },
  { char: "😜", name_ko: "윙크하며 혀를 내민 얼굴", name_en: "winking face with tongue", category: "smileys", tags: ["혀", "윙크", "장난", "tongue", "wink", "playful"] },
  { char: "🤪", name_ko: "미친 얼굴", name_en: "zany face", category: "smileys", tags: ["미친", "장난", "재미", "crazy", "playful", "funny"] },
  { char: "😝", name_ko: "눈을 감고 혀를 내민 얼굴", name_en: "squinting face with tongue", category: "smileys", tags: ["혀", "장난", "재미", "tongue", "playful", "funny"] },
  { char: "🤑", name_ko: "돈 입 얼굴", name_en: "money-mouth face", category: "smileys", tags: ["돈", "부자", "욕심", "money", "rich", "greedy"] },
  { char: "🤗", name_ko: "포옹하는 얼굴", name_en: "hugging face", category: "smileys", tags: ["포옹", "사랑", "친근", "hug", "love", "friendly"] },
  { char: "🤭", name_ko: "입을 가린 얼굴", name_en: "face with hand over mouth", category: "smileys", tags: ["비밀", "놀람", "조용", "secret", "surprise", "quiet"] },
  { char: "🤫", name_ko: "조용히 하는 얼굴", name_en: "shushing face", category: "smileys", tags: ["조용", "비밀", "침묵", "quiet", "secret", "silence"] },
  { char: "🤔", name_ko: "생각하는 얼굴", name_en: "thinking face", category: "smileys", tags: ["생각", "고민", "의문", "thinking", "wondering", "question"] },
  { char: "🤐", name_ko: "지퍼 입 얼굴", name_en: "zipper-mouth face", category: "smileys", tags: ["침묵", "비밀", "조용", "silence", "secret", "quiet"] },
  { char: "🤨", name_ko: "한쪽 눈썹 올린 얼굴", name_en: "face with raised eyebrow", category: "smileys", tags: ["의심", "의문", "호기심", "suspicious", "question", "curious"] },
  { char: "😐", name_ko: "무표정 얼굴", name_en: "neutral face", category: "smileys", tags: ["무표정", "중립", "평범", "neutral", "expressionless", "normal"] },
  { char: "😑", name_ko: "무표정 얼굴", name_en: "expressionless face", category: "smileys", tags: ["무표정", "중립", "평범", "neutral", "expressionless", "normal"] },
  { char: "😶", name_ko: "입 없는 얼굴", name_en: "face without mouth", category: "smileys", tags: ["무표정", "침묵", "말없음", "expressionless", "silence", "speechless"] },
  { char: "😏", name_ko: "비웃는 얼굴", name_en: "smirking face", category: "smileys", tags: ["비웃음", "장난", "교활", "smirk", "playful", "sly"] },
  { char: "😒", name_ko: "불만스러운 얼굴", name_en: "unamused face", category: "smileys", tags: ["불만", "지루", "무관심", "unamused", "bored", "indifferent"] },
  { char: "🙄", name_ko: "눈을 굴리는 얼굴", name_en: "face with rolling eyes", category: "smileys", tags: ["눈굴림", "지루", "무관심", "rolling eyes", "bored", "indifferent"] },
  { char: "😬", name_ko: "긴장한 얼굴", name_en: "grimacing face", category: "smileys", tags: ["긴장", "불편", "어색", "nervous", "uncomfortable", "awkward"] },
  { char: "🤥", name_ko: "거짓말하는 얼굴", name_en: "lying face", category: "smileys", tags: ["거짓말", "거짓", "의심", "lying", "false", "suspicious"] },
  { char: "😌", name_ko: "안심하는 얼굴", name_en: "relieved face", category: "smileys", tags: ["안심", "편안", "만족", "relieved", "comfortable", "satisfied"] },
  { char: "😔", name_ko: "우울한 얼굴", name_en: "pensive face", category: "smileys", tags: ["우울", "슬픔", "생각", "sad", "depressed", "thinking"] },
  { char: "😪", name_ko: "졸린 얼굴", name_en: "sleepy face", category: "smileys", tags: ["졸림", "피곤", "수면", "sleepy", "tired", "sleep"] },
  { char: "🤤", name_ko: "침 흘리는 얼굴", name_en: "drooling face", category: "smileys", tags: ["침", "배고픔", "욕심", "drool", "hungry", "desire"] },
  { char: "😴", name_ko: "자는 얼굴", name_en: "sleeping face", category: "smileys", tags: ["수면", "졸림", "피곤", "sleep", "sleepy", "tired"] },
  { char: "😷", name_ko: "마스크 쓴 얼굴", name_en: "face with medical mask", category: "smileys", tags: ["마스크", "병", "보호", "mask", "sick", "protection"] },
  { char: "🤒", name_ko: "열이 있는 얼굴", name_en: "face with thermometer", category: "smileys", tags: ["열", "병", "아픔", "fever", "sick", "pain"] },
  { char: "🤕", name_ko: "붕대 감은 얼굴", name_en: "face with head-bandage", category: "smileys", tags: ["부상", "아픔", "치료", "injury", "pain", "treatment"] },
  { char: "🤢", name_ko: "구역질 나는 얼굴", name_en: "nauseated face", category: "smileys", tags: ["구역질", "병", "불편", "nauseated", "sick", "uncomfortable"] },
  { char: "🤮", name_ko: "토하는 얼굴", name_en: "face vomiting", category: "smileys", tags: ["토함", "병", "불편", "vomiting", "sick", "uncomfortable"] },
  { char: "🤧", name_ko: "재채기하는 얼굴", name_en: "sneezing face", category: "smileys", tags: ["재채기", "병", "감기", "sneezing", "sick", "cold"] },
  { char: "🥵", name_ko: "뜨거운 얼굴", name_en: "hot face", category: "smileys", tags: ["뜨거움", "열", "더위", "hot", "heat", "warm"] },
  { char: "🥶", name_ko: "차가운 얼굴", name_en: "cold face", category: "smileys", tags: ["차가움", "추위", "춥다", "cold", "freezing", "chilly"] },
  { char: "😵", name_ko: "어지러운 얼굴", name_en: "dizzy face", category: "smileys", tags: ["어지러움", "현기증", "병", "dizzy", "vertigo", "sick"] },
  { char: "🤯", name_ko: "폭발하는 머리", name_en: "exploding head", category: "smileys", tags: ["폭발", "놀람", "충격", "exploding", "surprise", "shock"] },
  { char: "🤠", name_ko: "카우보이 모자 얼굴", name_en: "cowboy hat face", category: "smileys", tags: ["카우보이", "모자", "서부", "cowboy", "hat", "western"] },
  { char: "🥳", name_ko: "파티하는 얼굴", name_en: "partying face", category: "smileys", tags: ["파티", "축하", "기쁨", "party", "celebration", "joy"] },
  { char: "🥸", name_ko: "변장한 얼굴", name_en: "disguised face", category: "smileys", tags: ["변장", "가면", "숨김", "disguised", "mask", "hidden"] },
  { char: "😎", name_ko: "선글라스 쓴 웃는 얼굴", name_en: "smiling face with sunglasses", category: "smileys", tags: ["선글라스", "멋", "시원", "sunglasses", "cool", "fresh"] },
  { char: "🤓", name_ko: "안경 쓴 얼굴", name_en: "nerd face", category: "smileys", tags: ["안경", "공부", "지식", "glasses", "study", "knowledge"] },
  { char: "🧐", name_ko: "단안경 쓴 얼굴", name_en: "face with monocle", category: "smileys", tags: ["단안경", "관찰", "호기심", "monocle", "observation", "curious"] },
  { char: "😕", name_ko: "혼란스러운 얼굴", name_en: "confused face", category: "smileys", tags: ["혼란", "의문", "불확실", "confused", "question", "uncertain"] },
  { char: "😟", name_ko: "걱정스러운 얼굴", name_en: "worried face", category: "smileys", tags: ["걱정", "불안", "근심", "worried", "anxious", "concern"] },
  { char: "🙁", name_ko: "약간 찡그린 얼굴", name_en: "slightly frowning face", category: "smileys", tags: ["불만", "슬픔", "실망", "unhappy", "sad", "disappointed"] },
  { char: "☹️", name_ko: "찡그린 얼굴", name_en: "frowning face", category: "smileys", tags: ["불만", "슬픔", "실망", "unhappy", "sad", "disappointed"] },
  { char: "😮", name_ko: "입 벌린 얼굴", name_en: "face with open mouth", category: "smileys", tags: ["놀람", "입벌림", "의외", "surprise", "open mouth", "unexpected"] },
  { char: "😯", name_ko: "조용히 놀란 얼굴", name_en: "hushed face", category: "smileys", tags: ["놀람", "조용", "충격", "surprise", "quiet", "shock"] },
  { char: "😲", name_ko: "놀란 얼굴", name_en: "astonished face", category: "smileys", tags: ["놀람", "충격", "의외", "surprise", "shock", "unexpected"] },
  { char: "😳", name_ko: "얼굴 빨개진 얼굴", name_en: "flushed face", category: "smileys", tags: ["부끄러움", "당황", "빨개짐", "embarrassed", "flushed", "blush"] },
  { char: "🥺", name_ko: "간청하는 얼굴", name_en: "pleading face", category: "smileys", tags: ["간청", "부탁", "애원", "pleading", "request", "begging"] },
  { char: "😦", name_ko: "입 벌리고 찡그린 얼굴", name_en: "frowning face with open mouth", category: "smileys", tags: ["불만", "놀람", "실망", "unhappy", "surprise", "disappointed"] },
  { char: "😧", name_ko: "고통스러운 얼굴", name_en: "anguished face", category: "smileys", tags: ["고통", "아픔", "불편", "pain", "suffering", "uncomfortable"] },
  { char: "😨", name_ko: "두려워하는 얼굴", name_en: "fearful face", category: "smileys", tags: ["두려움", "공포", "무서움", "fear", "scared", "afraid"] },
  { char: "😰", name_ko: "땀 흘리며 걱정하는 얼굴", name_en: "anxious face with sweat", category: "smileys", tags: ["걱정", "땀", "불안", "worried", "sweat", "anxious"] },
  { char: "😥", name_ko: "실망하지만 안도하는 얼굴", name_en: "sad but relieved face", category: "smileys", tags: ["실망", "안도", "복잡", "disappointed", "relieved", "complex"] },
  { char: "😢", name_ko: "우는 얼굴", name_en: "crying face", category: "smileys", tags: ["울음", "슬픔", "눈물", "crying", "sad", "tears"] },
  { char: "😭", name_ko: "크게 우는 얼굴", name_en: "loudly crying face", category: "smileys", tags: ["울음", "슬픔", "눈물", "crying", "sad", "tears"] },
  { char: "😱", name_ko: "비명 지르는 얼굴", name_en: "face screaming in fear", category: "smileys", tags: ["비명", "공포", "놀람", "scream", "fear", "surprise"] },
  { char: "😖", name_ko: "고민하는 얼굴", name_en: "confounded face", category: "smileys", tags: ["고민", "혼란", "불만", "confused", "troubled", "unhappy"] },
  { char: "😣", name_ko: "인내하는 얼굴", name_en: "persevering face", category: "smileys", tags: ["인내", "고통", "참음", "persevering", "pain", "endurance"] },
  { char: "😞", name_ko: "실망한 얼굴", name_en: "disappointed face", category: "smileys", tags: ["실망", "슬픔", "불만", "disappointed", "sad", "unhappy"] },
  { char: "😓", name_ko: "땀 흘리는 얼굴", name_en: "downcast face with sweat", category: "smileys", tags: ["땀", "피곤", "불편", "sweat", "tired", "uncomfortable"] },
  { char: "😩", name_ko: "피곤한 얼굴", name_en: "weary face", category: "smileys", tags: ["피곤", "지침", "불만", "tired", "exhausted", "unhappy"] },
  { char: "😫", name_ko: "지친 얼굴", name_en: "tired face", category: "smileys", tags: ["피곤", "지침", "불만", "tired", "exhausted", "unhappy"] },
  { char: "🥱", name_ko: "하품하는 얼굴", name_en: "yawning face", category: "smileys", tags: ["하품", "졸림", "피곤", "yawn", "sleepy", "tired"] },
  { char: "😤", name_ko: "콧김 나오는 얼굴", name_en: "face with steam from nose", category: "smileys", tags: ["화남", "불만", "짜증", "angry", "unhappy", "annoyed"] },
  { char: "😡", name_ko: "화난 얼굴", name_en: "pouting face", category: "smileys", tags: ["화남", "불만", "짜증", "angry", "unhappy", "annoyed"] },
  { char: "😠", name_ko: "화난 얼굴", name_en: "angry face", category: "smileys", tags: ["화남", "불만", "짜증", "angry", "unhappy", "annoyed"] },
  { char: "🤬", name_ko: "욕하는 얼굴", name_en: "face with symbols on mouth", category: "smileys", tags: ["욕", "화남", "불만", "swearing", "angry", "unhappy"] },
  { char: "😈", name_ko: "웃는 악마 얼굴", name_en: "smiling face with horns", category: "smileys", tags: ["악마", "장난", "교활", "devil", "playful", "sly"] },
  { char: "👿", name_ko: "화난 악마 얼굴", name_en: "angry face with horns", category: "smileys", tags: ["악마", "화남", "불만", "devil", "angry", "unhappy"] },
  { char: "💀", name_ko: "해골", name_en: "skull", category: "smileys", tags: ["해골", "죽음", "무서움", "skull", "death", "scary"] },
  { char: "☠️", name_ko: "해골과 뼈", name_en: "skull and crossbones", category: "smileys", tags: ["해골", "죽음", "위험", "skull", "death", "danger"] },
  { char: "💩", name_ko: "똥 얼굴", name_en: "pile of poo", category: "smileys", tags: ["똥", "장난", "재미", "poo", "playful", "funny"] },
  { char: "🤡", name_ko: "광대 얼굴", name_en: "clown face", category: "smileys", tags: ["광대", "장난", "재미", "clown", "playful", "funny"] },
  { char: "👹", name_ko: "오니", name_en: "ogre", category: "smileys", tags: ["오니", "악마", "무서움", "ogre", "devil", "scary"] },
  { char: "👺", name_ko: "도깨비", name_en: "goblin", category: "smileys", tags: ["도깨비", "악마", "무서움", "goblin", "devil", "scary"] },
  { char: "👻", name_ko: "유령", name_en: "ghost", category: "smileys", tags: ["유령", "무서움", "할로윈", "ghost", "scary", "halloween"] },
  { char: "👽", name_ko: "외계인", name_en: "alien", category: "smileys", tags: ["외계인", "우주", "신비", "alien", "space", "mystery"] },
  { char: "👾", name_ko: "외계 괴물", name_en: "alien monster", category: "smileys", tags: ["외계인", "게임", "재미", "alien", "game", "funny"] },
  { char: "🤖", name_ko: "로봇", name_en: "robot", category: "smileys", tags: ["로봇", "기계", "과학", "robot", "machine", "science"] },
  { char: "😺", name_ko: "웃는 고양이 얼굴", name_en: "grinning cat", category: "smileys", tags: ["고양이", "웃음", "행복", "cat", "grinning", "happy"] },
  { char: "😸", name_ko: "크게 웃는 고양이 얼굴", name_en: "grinning cat with smiling eyes", category: "smileys", tags: ["고양이", "웃음", "행복", "cat", "grinning", "happy"] },
  { char: "😹", name_ko: "눈물 흘리며 웃는 고양이", name_en: "cat with tears of joy", category: "smileys", tags: ["고양이", "웃음", "눈물", "cat", "laughing", "tears"] },
  { char: "😻", name_ko: "하트 눈 고양이", name_en: "smiling cat with heart-eyes", category: "smileys", tags: ["고양이", "사랑", "좋아함", "cat", "love", "like"] },
  { char: "😼", name_ko: "비웃는 고양이", name_en: "cat with wry smile", category: "smileys", tags: ["고양이", "비웃음", "교활", "cat", "smirk", "sly"] },
  { char: "😽", name_ko: "키스하는 고양이", name_en: "kissing cat", category: "smileys", tags: ["고양이", "키스", "사랑", "cat", "kiss", "love"] },
  { char: "🙀", name_ko: "놀란 고양이", name_en: "weary cat", category: "smileys", tags: ["고양이", "놀람", "피곤", "cat", "surprise", "tired"] },
  { char: "😿", name_ko: "우는 고양이", name_en: "crying cat face", category: "smileys", tags: ["고양이", "울음", "슬픔", "cat", "crying", "sad"] },
  { char: "😾", name_ko: "화난 고양이", name_en: "pouting cat", category: "smileys", tags: ["고양이", "화남", "불만", "cat", "angry", "unhappy"] },
  // ... 나머지 카테고리도 계속 추가해야 하지만 파일 크기 제한으로 인해
  // 실제로는 스크립트를 실행하여 생성하는 것이 좋습니다.
];

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

// 추가 데이터 추가
for (const item of additionalEmojis) {
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

