import Link from "next/link";
import HeroBanner from "@/components/ui/HeroBanner";
import SectionHeading from "@/components/ui/SectionHeading";
import { Users, Scale, Heart, Shield, Megaphone, Globe } from "lucide-react";

const features = [
  {
    icon: Scale,
    title: "Democracy & Justice",
    description:
      "We fight for a multiparty democratic system where every citizen has an equal voice in the governance of Eswatini.",
  },
  {
    icon: Shield,
    title: "Human Rights",
    description:
      "Protecting fundamental freedoms — freedom of speech, assembly, and association for all Swazis.",
  },
  {
    icon: Users,
    title: "People's Power",
    description:
      "Empowering communities through grassroots organizing and civic education across all branches.",
  },
  {
    icon: Heart,
    title: "Social Welfare",
    description:
      "Advocating for accessible healthcare, quality education, and economic opportunity for every citizen.",
  },
  {
    icon: Megaphone,
    title: "Free Press",
    description:
      "Supporting independent media and the right of all citizens to access information freely.",
  },
  {
    icon: Globe,
    title: "International Solidarity",
    description:
      "Building alliances with democratic movements worldwide to strengthen our cause for liberation.",
  },
];

const stats = [
  { number: "40+", label: "Years of Struggle" },
  { number: "56", label: "Branches Nationwide" },
  { number: "8", label: "Regional Structures" },
  { number: "1000s", label: "Active Members" },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <HeroBanner
        title="Power to the People"
        subtitle="For over 40 years, PUDEMO has been the voice of the Swazi people in the fight for multiparty democracy, justice, and human rights."
        primaryCta={{ label: "Join the Movement", href: "/contributions" }}
        secondaryCta={{ label: "Read Our Manifesto", href: "/manifesto" }}
      />

      {/* ── What We Stand For ── */}
      <section className="section">
        <div className="container">
          <SectionHeading
            label="Our Pillars"
            title="What We Stand For"
            subtitle="PUDEMO is guided by principles of democracy, equality, and justice. These pillars define our struggle and our vision for Eswatini."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(1.25rem, 4vw, 2rem)",
            }}
          >
            {features.map((feature, i) => (
              <div key={i} className="card">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius)",
                    background: "var(--light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  <feature.icon size={24} style={{ color: "var(--primary)" }} />
                </div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: "var(--dark)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.938rem",
                    lineHeight: 1.7,
                    color: "var(--gray-500)",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Counter ── */}
      <section
        className="section-dark"
        style={{ padding: "clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 1.5rem)" }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "clamp(1.5rem, 4vw, 3rem)",
              textAlign: "center",
            }}
          >
            {stats.map((stat, i) => (
              <div key={i}>
                <div
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                    fontWeight: 800,
                    color: "var(--secondary)",
                    lineHeight: 1,
                    marginBottom: "0.5rem",
                  }}
                >
                  {stat.number}
                </div>
                <div
                  style={{
                    fontSize: "0.938rem",
                    fontWeight: 500,
                    color: "var(--gray-400)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Mission ── */}
      <section className="section" style={{ background: "var(--light)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(1.5rem, 4vw, 2.5rem)",
              alignItems: "center",
            }}
          >
            <div>
              <SectionHeading
                label="Our Mission"
                title="A Free and Democratic Eswatini"
                subtitle=""
                centered={false}
              />
              <p
                style={{
                  fontSize: "1.063rem",
                  lineHeight: 1.8,
                  color: "var(--gray-600)",
                  marginBottom: "1.5rem",
                }}
              >
                The People&apos;s United Democratic Movement (PUDEMO) was
                founded in 1983 as a response to the oppressive monarchical rule
                in Eswatini. Our mission is to establish a multiparty democratic
                system where power belongs to the people.
              </p>
              <p
                style={{
                  fontSize: "1.063rem",
                  lineHeight: 1.8,
                  color: "var(--gray-600)",
                  marginBottom: "2rem",
                }}
              >
                We believe in the inherent dignity and rights of every Swazi
                citizen. Through peaceful resistance, civic education, and
                international solidarity, we continue to fight for the day when
                Eswatini is truly free.
              </p>
              <Link href="/about" className="btn btn-primary">
                Learn Our History
              </Link>
            </div>
            <div
              style={{
                background: "var(--dark)",
                borderRadius: "var(--radius-xl)",
                padding: "clamp(1.5rem, 5vw, 3rem)",
                color: "#fff",
              }}
            >
              <blockquote>
                <p
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    marginBottom: "1.5rem",
                  }}
                >
                  &ldquo;No force on earth can stop a people determined to be
                  free. Our struggle is just, our cause is righteous, and
                  victory is certain.&rdquo;
                </p>
                <footer
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      width: 4,
                      height: 40,
                      background: "var(--primary)",
                      borderRadius: 2,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.938rem" }}>
                      Mario Masuku
                    </div>
                    <div
                      style={{
                        fontSize: "0.813rem",
                        color: "var(--gray-400)",
                      }}
                    >
                      Former President of PUDEMO
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
          padding: "clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 1.5rem)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div className="container">
          <h2 className="heading-lg" style={{ marginBottom: "1rem" }}>
            Join the Movement
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              opacity: 0.9,
              maxWidth: 600,
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            Whether you donate, volunteer, or simply spread the word — every
            action brings us closer to a free Eswatini.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Link
              href="/contributions"
              className="btn btn-secondary btn-lg"
              style={{ display: "inline-flex", width: "auto", flex: "none" }}
            >
              Contribute Now
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline btn-lg"
              style={{ display: "inline-flex", width: "auto", flex: "none" }}
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
