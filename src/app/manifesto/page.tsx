import SectionHeading from "@/components/ui/SectionHeading";
import HeroBanner from "@/components/ui/HeroBanner";

const manifestoSections = [
  {
    title: "1. Democratic Governance",
    content:
      "The establishment of a constitutional multiparty democratic system. Power must reside in the hands of the people through periodic, free, and fair elections under a universal franchise.",
  },
  {
    title: "2. Human Rights and Freedoms",
    content:
      "Full respect for the Universal Declaration of Human Rights. This includes freedom of assembly, speech, association, and the press without fear of harassment or detention.",
  },
  {
    title: "3. Economic Justice",
    content:
      "Restructuring the economy to serve the many, not the few. This includes land reform, fair wages, and the protection of workers' rights through independent trade unions.",
  },
  {
    title: "4. Social Policy",
    content:
      "Universal access to quality healthcare and education as a right, not a privilege. Special focus on empowering women, youth, and the marginalized.",
  },
  {
    title: "5. Rule of Law",
    content:
      "An independent judiciary and the separation of powers. No one, including the King, should be above the law.",
  },
];

export default function ManifestoPage() {
  return (
    <main>
      <HeroBanner
        title="Our Manifesto"
        subtitle="A vision for a democratic, prosperous, and just Eswatini."
        height="40vh"
      />

      <section className="section">
        <div className="container max-w-4xl">
          <SectionHeading
            title="The People's Charter"
            subtitle="Our roadmap for the total transformation of our society."
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(1.5rem, 4vw, 2.5rem)",
              marginTop: "3rem",
            }}
          >
            {manifestoSections.map((section, i) => (
              <div
                key={i}
                style={{
                  borderLeft: "4px solid var(--primary)",
                  paddingLeft: "clamp(1.25rem, 4vw, 2rem)",
                  paddingTop: "clamp(1rem, 3vw, 1.5rem)",
                  paddingBottom: "clamp(1rem, 3vw, 1.5rem)",
                  background: "#fff",
                  borderRadius: "var(--radius-lg)",
                  padding: "clamp(1.25rem, 4vw, 2rem)",
                  boxShadow: "var(--shadow)",
                }}
                className="card transition-all hover:shadow-md"
              >
                <h3
                  style={{
                    marginBottom: "clamp(0.75rem, 2vw, 1rem)",
                    color: "var(--primary)",
                  }}
                  className="heading-sm"
                >
                  {section.title}
                </h3>
                <p
                  style={{
                    color: "var(--gray-600)",
                    fontSize: "clamp(0.938rem, 2vw, 1.063rem)",
                    lineHeight: "1.7",
                  }}
                >
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "clamp(2rem, 6vw, 3rem)",
              padding: "clamp(1.5rem, 5vw, 3rem)",
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
              color: "#fff",
              borderRadius: "var(--radius-xl)",
              textAlign: "center",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                marginBottom: "1.5rem",
                width: "48px",
                height: "48px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "9999px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7a2 2 0 11-4 0 2 2 0 014 0z"></path>
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z"
                ></path>
              </svg>
            </div>
            <h3 className="heading-md" style={{ marginBottom: "0.75rem" }}>
              Download Full Manifesto
            </h3>
            <p
              style={{
                marginBottom: "2rem",
                opacity: 0.9,
                fontSize: "clamp(0.938rem, 2vw, 1.063rem)",
              }}
            >
              Read our comprehensive policy document in PDF format.
            </p>
            <button
              className="btn btn-secondary btn-lg"
              style={{ display: "inline-flex", gap: "0.5rem" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
