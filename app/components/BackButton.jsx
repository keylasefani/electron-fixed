"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        padding: "6px 12px",
        background: "#e5e7eb",
        borderRadius: "6px",
        fontSize: "14px",
        border: "1px solid #d1d5db",
        cursor: "pointer",
      }}
    >
      ← Kembali
    </button>
  );
}
