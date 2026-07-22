import React from "react";
import { useTranslations } from "next-intl";
import { ComponentConfig } from "@puckeditor/core";
import { FileText, ExternalLink } from "lucide-react";
import { LessonBlockProps } from "../../types";
import { DocumentPickerField, type DocumentItem } from "../../fields";
import { useSafePuck, useLessonSSOT } from "../../helper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/default/dialog";

function DocumentPickerFieldWrapper({
  value,
  onChange,
  readOnly,
}: {
  value?: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}) {
  const puck = useSafePuck();

  const currentProps = React.useMemo(() => {
    if (!puck?.appState) return {};
    const selector = puck.appState.ui.itemSelector;
    if (!selector || typeof selector.index !== "number") return {};
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let items: any[] = [];
    if (!selector.zone || selector.zone === "default-zone" || selector.zone === "") {
      items = puck.appState.data.content || [];
    } else {
      const zones = (puck.appState.data as any).zones || {};
      items = zones[selector.zone] || puck.appState.data.content || [];
    }
    const block = items[selector.index] || items.find((b: any) => b.props?.id === (selector as any).id);
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (!block || block.type !== "ReferenceDocumentBlock") return {};
    return block.props || {};
  }, [puck?.appState]);

  const displayTitle = currentProps.altText && currentProps.altText !== "Tài liệu tham khảo hệ thống" ? currentProps.altText : undefined;

  const arr: DocumentItem[] = value
    ? [
        {
          id: value,
          title: displayTitle || `Tài liệu ID: ${value}`,
          url: currentProps.url !== "#" ? currentProps.url : undefined,
          kind: currentProps.kind,
          tags: currentProps.tags || [],
        },
      ]
    : [];

  const handleSelectDocuments = (items: DocumentItem[]) => {
    const doc = items[0];
    onChange(doc?.id || "");

    if (puck?.appState && puck.dispatch) {
      const selector = puck.appState.ui.itemSelector;
      if (selector && typeof selector.index === "number") {
        const currentData = puck.appState.data;
        const newContent = [...(currentData.content || [])];
        const currentBlock = newContent[selector.index];
        if (currentBlock && currentBlock.type === "ReferenceDocumentBlock") {
          const updatedProps = doc
            ? {
                documentId: doc.id || "",
                altText: doc.title || "",
                url: doc.url || "",
                kind: doc.kind?.toLowerCase() || "reference",
                tags: doc.tags || [],
              }
            : {
                documentId: "",
                altText: "Tài liệu tham khảo hệ thống",
                url: "#",
                kind: "reference",
                tags: [],
              };

          const updatedBlock = {
            ...currentBlock,
            props: {
              ...currentBlock.props,
              ...updatedProps,
            },
          };
          puck.dispatch({
            type: "replace",
            destinationIndex: selector.index,
            destinationZone: selector.zone || "default-zone",
            data: updatedBlock,
          });
        }
      }
    }
  };

  return (
    <DocumentPickerField
      value={arr}
      onChange={handleSelectDocuments}
      readOnly={readOnly}
      maxItems={1}
    />
  );
}

function DocumentQuickSelectSSOTButton({ readOnly }: { readOnly?: boolean }) {
  const puck = useSafePuck();
  const { documents: rootDocs } = useLessonSSOT({ defaultDocTitle: "Tài liệu" });
  const [open, setOpen] = React.useState(false);

  const handleSelectDoc = (doc: DocumentItem) => {
    if (readOnly || !puck?.appState || !puck.dispatch) return;
    const selector = puck.appState.ui.itemSelector;
    if (selector && typeof selector.index === "number") {
      const currentData = puck.appState.data;
      const newContent = [...(currentData.content || [])];
      const currentBlock = newContent[selector.index];
      if (currentBlock && currentBlock.type === "ReferenceDocumentBlock") {
        const updatedBlock = {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            documentId: doc.id || "",
            altText: doc.title || "",
            url: doc.url || "",
            kind: doc.kind?.toLowerCase() || "reference",
            tags: doc.tags || [],
            description: doc.description || "",
          },
        };
        puck.dispatch({
          type: "replace",
          destinationIndex: selector.index,
          destinationZone: selector.zone || "default-zone",
          data: updatedBlock,
        });
      }
    }
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => !readOnly && setOpen(true)}
        disabled={readOnly || rootDocs.length === 0}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span>⚡ Chọn từ danh sách Root Props ({rootDocs.length})</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Tài liệu đính kèm trong bài học</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 max-h-72 overflow-y-auto py-2">
            {rootDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">Chưa có tài liệu nào trong Root Props.</p>
            ) : (
              rootDocs.map((doc, i) => (
                <div
                  key={doc.id || i}
                  onClick={() => handleSelectDoc(doc)}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{doc.title || `Tài liệu #${i + 1}`}</p>
                    {doc.kind && <span className="text-[10px] text-muted-foreground uppercase">{doc.kind}</span>}
                  </div>
                  <span className="shrink-0 text-xs text-primary font-medium">Chọn</span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const HIDDEN_FIELD = {
  type: "custom" as const,
  render: () => <></>,
};

export const ReferenceDocumentBlock: ComponentConfig<
  LessonBlockProps["ReferenceDocumentBlock"]
> = {
  fields: {
    quickSelectFromSSOT: {
      type: "custom",
      label: "Lấy nhanh từ Root Props",
      render: ({ readOnly }: any) => <DocumentQuickSelectSSOTButton readOnly={readOnly} />,
    },
    documentId: {
      type: "custom",
      label: "Chọn tài liệu từ hệ thống",
      render: ({ value, onChange, readOnly }) => (
        <DocumentPickerFieldWrapper
          value={value}
          onChange={(val) => onChange(val)}
          readOnly={readOnly}
        />
      ),
    },
    altText: HIDDEN_FIELD,
    url: HIDDEN_FIELD,
    kind: HIDDEN_FIELD,
    description: HIDDEN_FIELD,
    tags: HIDDEN_FIELD,
  },
  defaultProps: {
    altText: "Tài liệu tham khảo hệ thống",
    url: "#",
    kind: "reference",
    description: "",
    documentId: "",
  },
  render: ({ altText, url, documentId, kind, description, tags }) => {
    const t = useTranslations("PuckEditor.Common.documentEmbed");
    const title = altText || t("defaultTitle");

    if (!documentId) {
      return (
        <div className="my-4 rounded-xl border border-dashed border-border bg-surface-container-lowest/60 p-6 text-center space-y-1.5">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-semibold text-foreground">Chưa chọn tài liệu tham khảo</p>
          <p className="text-xs text-muted-foreground">
            Vui lòng bấm chọn 1 tài liệu từ bảng cấu hình bên phải
          </p>
        </div>
      );
    }

    return (
      <div className="my-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 space-y-2">
        <a
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface/80"
        >
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate underline decoration-primary/40 underline-offset-4">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {kind && (
              <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium uppercase text-secondary">
                {kind}
              </span>
            )}
            {tags && tags.length > 0 && (
              <div className="flex items-center gap-1">
                {tags.map((tag, idx) => (
                  <span
                    key={tag.id || idx}
                    className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
            {documentId && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                {t("internalBadge")}
              </span>
            )}
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </a>
        {description && (
          <p className="text-xs text-muted-foreground px-1">{description}</p>
        )}
      </div>
    );
  },
};
