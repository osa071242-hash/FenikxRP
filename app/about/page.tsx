import { getSiteTexts } from "@/lib/forum";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const texts = await getSiteTexts();
  return (
    <section className="section">
      <div className="shell" style={{ maxWidth: 720 }}>
        <div className="section-head">
          <h2>{texts.about_title || "О проекте FenixRP"}</h2>
        </div>
        <p className="post-body" style={{ color: "var(--muted)" }}>
          {texts.about_body}
        </p>
      </div>
    </section>
  );
}
