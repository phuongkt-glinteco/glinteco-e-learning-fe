/**
 * Focuses an editable block's textarea or input by its data-block-id.
 * Uses requestAnimationFrame and fallback retries to ensure focus succeeds even after React DOM mounts/re-renders.
 */
export function focusBlockById(blockId: string, cursorAtEnd = true): void {
  const tryFocus = (): boolean => {
    const el = document.querySelector(
      `[data-block-id="${blockId}"] textarea, [data-block-id="${blockId}"] input`
    ) as HTMLInputElement | HTMLTextAreaElement | null;

    if (el) {
      el.focus();
      if (cursorAtEnd && typeof el.setSelectionRange === 'function') {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      return true;
    }
    return false;
  };

  if (!tryFocus()) {
    requestAnimationFrame(() => {
      if (!tryFocus()) {
        setTimeout(() => {
          if (!tryFocus()) {
            setTimeout(() => {
              if (!tryFocus()) {
                setTimeout(tryFocus, 40);
              }
            }, 25);
          }
        }, 15);
      }
    });
  }
}
