export function SiteFooter() {
  return (
    <footer className="px-4 pb-8 pt-4">
      <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-1.5 text-center text-sm">
        <span>Made with</span>
        <span aria-hidden="true" className="text-accent">
          ♥
        </span>
        <span>by the bluesix team at</span>
        <a
          href="https://bluesix.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground decoration-accent/50 underline underline-offset-4 transition hover:text-accent"
          data-testid="footer-link"
        >
          bluesix.dev
        </a>
      </p>
    </footer>
  );
}
