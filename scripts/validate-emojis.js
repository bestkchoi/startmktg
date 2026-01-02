const fs = require("fs");
const path = require("path");

const MIN_TOTAL = 800;
const MIN_CATEGORIES = {
  smileys: 120,
  hearts: 60,
  symbols: 140,
  arrows: 60,
  stars: 40,
  weather: 40,
  animals: 80,
  food: 80,
  flags: 80,
  text: 100,
};

const dataPath = path.join(__dirname, "../data/emojis_ko.json");

function validateEmojis() {
  console.log("🔍 이모지 데이터 검증 시작...\n");

  // 파일 존재 확인
  if (!fs.existsSync(dataPath)) {
    console.error("❌ 오류: 데이터 파일을 찾을 수 없습니다:", dataPath);
    process.exit(1);
  }

  // 데이터 읽기
  let data;
  try {
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    data = JSON.parse(fileContent);
  } catch (error) {
    console.error("❌ 오류: 데이터 파일을 읽을 수 없습니다:", error);
    process.exit(1);
  }

  // 1. 총 개수 검증
  const totalCount = data.length;
  console.log(`📊 총 아이템 수: ${totalCount}개`);
  if (totalCount < MIN_TOTAL) {
    console.error(
      `❌ 실패: 총 아이템 수가 ${MIN_TOTAL}개 미만입니다. (현재: ${totalCount}개)`
    );
    process.exit(1);
  }
  console.log(`✅ 총 개수 검증 통과 (최소 ${MIN_TOTAL}개 이상)\n`);

  // 2. 중복 검증 및 제거
  const charMap = new Map();
  const nameCharMap = new Map();
  const duplicates = [];

  for (const item of data) {
    // char 중복 검사
    if (charMap.has(item.char)) {
      duplicates.push(`char 중복: "${item.char}"`);
      continue;
    }
    charMap.set(item.char, item);

    // name_ko + char 조합 중복 검사
    const key = `${item.name_ko}|${item.char}`;
    if (nameCharMap.has(key)) {
      duplicates.push(`name_ko+char 중복: "${item.name_ko}" + "${item.char}"`);
      continue;
    }
    nameCharMap.set(key, item);
  }

  if (duplicates.length > 0) {
    console.error("❌ 중복 발견:");
    duplicates.forEach((dup) => console.error(`  - ${dup}`));
    console.error(
      "\n⚠️  경고: 중복 항목이 발견되었습니다. 데이터를 정리해주세요."
    );
    process.exit(1);
  }
  console.log(`✅ 중복 검증 통과\n`);

  // 3. 카테고리별 개수 검증
  const categoryCounts = {};
  for (const item of data) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  }

  console.log("📋 카테고리별 개수:");
  let allCategoriesValid = true;
  for (const [category, minCount] of Object.entries(MIN_CATEGORIES)) {
    const actualCount = categoryCounts[category] || 0;
    const status = actualCount >= minCount ? "✅" : "❌";
    console.log(
      `  ${status} ${category}: ${actualCount}개 (최소: ${minCount}개)`
    );
    if (actualCount < minCount) {
      allCategoriesValid = false;
    }
  }

  if (!allCategoriesValid) {
    console.error("\n❌ 실패: 일부 카테고리가 최소 개수를 만족하지 않습니다.");
    process.exit(1);
  }

  // 4. 데이터 구조 검증
  console.log("\n🔍 데이터 구조 검증...");
  let structureValid = true;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (
      !item.char ||
      !item.category ||
      !item.name_ko ||
      !item.name_en ||
      !Array.isArray(item.tags)
    ) {
      console.error(`❌ 인덱스 ${i}: 필수 필드가 누락되었습니다.`, item);
      structureValid = false;
    }
  }

  if (!structureValid) {
    console.error("\n❌ 실패: 데이터 구조가 올바르지 않습니다.");
    process.exit(1);
  }
  console.log("✅ 데이터 구조 검증 통과\n");

  // 최종 결과
  console.log("=".repeat(50));
  console.log("✅ 모든 검증 통과!");
  console.log(`📊 총 ${totalCount}개의 이모지 데이터가 준비되었습니다.`);
  console.log("=".repeat(50));
}

validateEmojis();

