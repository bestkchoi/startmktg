import { redirect } from "next/navigation";

export default function RootPage() {
  // middleware가 작동하지 않을 경우를 대비한 fallback
  redirect("/en");
}

