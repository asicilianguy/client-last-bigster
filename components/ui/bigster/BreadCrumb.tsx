import { useRouter } from "next/navigation";
import { useState } from "react";

interface BreadcrumbProps {
  name: string;
  path: string;
}

const Breadcrumb = ({ name, path }: BreadcrumbProps) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-[10px] py-[15px] px-[20px] bg-bigster-background text-bigster-text  ">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-[10px] border-none font-bold text-xl underline decoration-skip-ink-none"
      >
        <svg
          viewBox="0 0 16 16"
          fill="#6c4e06"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
        >
          <path d="M3.825 9H16V7H3.825L9.425 1.4L8 0L0 8L8 16L9.425 14.6L3.825 9Z" />
        </svg>
        {name}
      </button>
    </div>
  );
};

export default Breadcrumb;
