export function SiteFooter() {
  return (
    <footer className="px-4 pb-8 pt-4 text-center">
      <a
        href="https://www.perplexity.ai/computer"
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:text-foreground text-sm transition"
        data-testid="footer-attribution-link"
      >
        Created with Perplexity Computer
      </a>
    </footer>
  );
}
