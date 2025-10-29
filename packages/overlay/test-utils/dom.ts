export type TextMatcher = string | RegExp;

const matchesText = (text: string | null | undefined, matcher: TextMatcher) => {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  return typeof matcher === 'string' ? trimmed === matcher : matcher.test(trimmed);
};

export const findByText = (
  root: Node,
  matcher: TextMatcher
): HTMLElement | null => {
  if (!root) return null;

  if (root instanceof HTMLElement && matchesText(root.textContent, matcher)) {
    return root;
  }

  const filter: NodeFilter = {
    acceptNode(node) {
      if (!(node instanceof HTMLElement)) {
        return NodeFilter.FILTER_SKIP;
      }
      return matchesText(node.textContent, matcher)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  };

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    filter
  );

  let current = walker.nextNode();
  while (current) {
    if (current instanceof HTMLElement) {
      return current;
    }
    current = walker.nextNode();
  }

  return null;
};
