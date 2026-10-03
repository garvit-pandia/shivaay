"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import {
  directDownloads,
  supportingDownloads,
  notificationDownloads,
  type DownloadFile,
} from "@/lib/resources";

type GroupKey = "supporting" | "notifications";

function FileCard({ file }: { file: DownloadFile }) {
  return (
    <a
      href={file.file}
      download
      className="flex h-full items-center justify-between gap-3 p-4 min-h-[84px] bg-white border border-border rounded-2xl text-ink font-medium text-sm text-left hover:bg-teal hover:border-teal hover:text-white transition-colors"
    >
      <span>{file.label}</span>
      <Icon icon={Download} size={16} className="shrink-0" aria-hidden={true} />
    </a>
  );
}

function GroupCard({
  title,
  files,
  open,
  onToggle,
}: {
  title: string;
  files: DownloadFile[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-full w-full items-center justify-between gap-3 p-4 min-h-[84px] bg-white border border-border rounded-2xl text-ink font-medium text-sm text-left hover:bg-teal hover:border-teal hover:text-white transition-colors cursor-pointer"
      >
        <span>{title}</span>
        <Icon
          icon={ChevronDown}
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden={true}
        />
      </button>
      {open && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden bg-white border border-border rounded-2xl shadow-[0_12px_40px_rgba(30,27,24,0.12)] py-1.5 list-none m-0 p-0">
          {files.map((file) => (
            <li key={file.file}>
              <a
                href={file.file}
                download
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-ink hover:bg-teal hover:text-white transition-colors"
              >
                <span>{file.label}</span>
                <Icon icon={Download} size={14} className="shrink-0" aria-hidden={true} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DownloadGrid() {
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openGroup) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroup]);

  return (
    <section className="pb-20 bg-white" aria-label="Downloadable documents">
      <div ref={rootRef} className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {directDownloads.map((file) => (
            <div key={file.file} className="reveal">
              <FileCard file={file} />
            </div>
          ))}
          <div className="reveal">
            <GroupCard
              title="Supporting Documents"
              files={supportingDownloads}
              open={openGroup === "supporting"}
              onToggle={() =>
                setOpenGroup(openGroup === "supporting" ? null : "supporting")
              }
            />
          </div>
          <div className="reveal">
            <GroupCard
              title="Latest/Notification"
              files={notificationDownloads}
              open={openGroup === "notifications"}
              onToggle={() =>
                setOpenGroup(openGroup === "notifications" ? null : "notifications")
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
