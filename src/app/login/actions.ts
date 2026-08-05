"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSessionCookie } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = formData.get("password");
  const from = formData.get("from");
  const redirectTo = typeof from === "string" && from.startsWith("/") ? from : "/dashboard";

  if (typeof password !== "string" || !checkPassword(password)) {
    redirect(`/login?error=1&from=${encodeURIComponent(redirectTo)}`);
  }

  await createSessionCookie();
  redirect(redirectTo);
}
