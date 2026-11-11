export function Footer({ copy }: { copy: string }) {
  return (
    <footer className="site-footer">
      <div className="shell">{copy}</div>
    </footer>
  );
}
