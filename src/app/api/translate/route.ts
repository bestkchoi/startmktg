import { NextRequest, NextResponse } from "next/server";

/**
 * ChatGPT를 사용하여 한글 캠페인명을 영어로 번역하는 API
 * 1개의 후보만 반환합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { koreanText, maxLength } = await request.json();

    if (!koreanText || typeof koreanText !== "string") {
      return NextResponse.json(
        { ok: false, message: "한글 텍스트가 필요합니다." },
        { status: 400 }
      );
    }

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, message: "OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // ChatGPT API 호출
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 또는 "gpt-3.5-turbo" (더 저렴)
        messages: [
          {
            role: "system",
            content: `You are a translation assistant. Translate Korean campaign names to English.
Rules:
1. Translate the Korean text to natural English
2. Use lowercase letters only
3. Use spaces between words
4. Keep it concise and suitable for a campaign name
5. Return ONLY the translated text, nothing else
6. ${maxLength ? `Maximum length: ${maxLength} characters` : ""}

Examples:
- "블랙프라이데이" -> "black friday"
- "여름세일" -> "summer sale"
- "신년 프로모션" -> "new year promotion"`,
          },
          {
            role: "user",
            content: `Translate this Korean campaign name to English: "${koreanText}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        {
          ok: false,
          message: "번역 API 호출에 실패했습니다.",
          error: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      return NextResponse.json(
        { ok: false, message: "번역 결과를 받을 수 없습니다." },
        { status: 500 }
      );
    }

    // 정규화: 소문자, 공백 제거, 특수문자 제거
    let normalized = translatedText
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    // 최대 길이 제한 적용
    if (maxLength && normalized.length > maxLength) {
      normalized = normalized.substring(0, maxLength);
    }

    if (normalized.length === 0) {
      return NextResponse.json(
        { ok: false, message: "유효한 번역 결과가 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        translated: translatedText,
        normalized: normalized,
      },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "번역 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}




