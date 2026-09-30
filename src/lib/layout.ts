// Keep this query aligned with the compact/spacious variants in index.css.
// Spatial desktop layouts need both a wide viewport and enough vertical room.
export const COMPACT_VIEWPORT_QUERY = '(max-width: 1279px), (max-height: 639px)';

// Let overflowing content consume a wheel gesture before carousel navigation.
export function canScrollWithin(target: EventTarget | null, boundary: Element, deltaY: number): boolean {
  if (!deltaY || !(target instanceof Element)) return false;
  let element: Element | null = target;
  while (element) {
    const overflow = getComputedStyle(element).overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && element.scrollHeight > element.clientHeight + 1) {
      const canScroll = deltaY > 0
        ? element.scrollTop + element.clientHeight < element.scrollHeight - 1
        : element.scrollTop > 1;
      if (canScroll) return true;
    }
    if (element === boundary) break;
    element = element.parentElement;
  }
  return false;
}
