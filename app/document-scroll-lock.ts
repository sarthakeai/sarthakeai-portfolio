export function lockDocumentScroll() {
  const root = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY;
  const scrollbarGap = Math.max(0, window.innerWidth - root.clientWidth);
  const previous = {
    rootOverflow: root.style.overflow,
    rootScrollBehavior: root.style.scrollBehavior,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
  };

  root.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.width = "100%";
  if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;

  return () => {
    root.style.overflow = previous.rootOverflow;
    root.style.scrollBehavior = "auto";
    body.style.overflow = previous.bodyOverflow;
    body.style.position = previous.bodyPosition;
    body.style.top = previous.bodyTop;
    body.style.width = previous.bodyWidth;
    body.style.paddingRight = previous.bodyPaddingRight;
    window.scrollTo(0, scrollY);
    root.style.scrollBehavior = previous.rootScrollBehavior;
  };
}
