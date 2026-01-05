/**
 * 공유 코드 생성 유틸리티
 * 6~8자의 랜덤 문자열 생성 (영문 대소문자, 숫자)
 */

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CODE_LENGTH_MIN = 6;
const CODE_LENGTH_MAX = 8;

/**
 * 공유 코드 생성
 * @returns 6~8자의 랜덤 문자열
 */
export function generateShareCode(): string {
  // 6~8자 중 랜덤 길이 선택
  const length = Math.floor(Math.random() * (CODE_LENGTH_MAX - CODE_LENGTH_MIN + 1)) + CODE_LENGTH_MIN;
  
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    code += CHARACTERS[randomIndex];
  }
  
  return code;
}



