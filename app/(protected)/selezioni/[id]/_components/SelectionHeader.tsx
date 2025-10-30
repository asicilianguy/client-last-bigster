"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Breadcrumb from "@/components/ui/bigster/BreadCrumb";
import { SelectionDetail } from "@/types/selection";

interface SelectionHeaderProps {
  selection: SelectionDetail;
}

export function SelectionHeader({ selection }: SelectionHeaderProps) {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Selezioni", href: "/selezioni" },
    { label: selection.titolo, href: `/selezioni/${selection.id}` },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bigster-text tracking-tight">
            {selection.titolo}
          </h1>
          <p className="text-sm text-bigster-text-muted mt-1">
            ID Selezione: #{selection.id}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text"
        >
          <Link href="/selezioni">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle selezioni
          </Link>
        </Button>
      </div>
    </div>
  );
}
