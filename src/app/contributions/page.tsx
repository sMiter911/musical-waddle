import SectionHeading from "@/components/ui/SectionHeading";
import Link from "next/link";
import { Heart, Wallet, Shield, Users } from "lucide-react";

export default function ContributionsPage() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <SectionHeading
            title="Sustain the Struggle"
            subtitle="PUDEMO relies on the generosity of its members and supporters to continue the fight for democracy."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(1.5rem, 4vw, 2.5rem)",
              marginTop: "3rem",
            }}
          >
            <div>
              <h3
                style={{ marginBottom: "clamp(1rem, 3vw, 1.5rem)" }}
                className="heading-sm"
              >
                Why Your Contribution Matters
              </h3>
              <p
                style={{
                  marginBottom: "clamp(1rem, 3vw, 1.5rem)",
                  fontSize: "clamp(0.938rem, 2vw, 1.063rem)",
                }}
                className="text-gray-600"
              >
                Unlike the regime, we do not have access to state resources.
                Every Lilangeni donated goes directly towards:
              </p>
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(0.75rem, 2vw, 1rem)",
                }}
              >
                {[
                  {
                    icon: Megaphone,
                    text: "Civic education and grassroots mobilizing.",
                  },
                  {
                    icon: Shield,
                    text: "Legal defense for political prisoners and activists.",
                  },
                  {
                    icon: Heart,
                    text: "Supporting families of those impacted by the struggle.",
                  },
                  {
                    icon: Globe,
                    text: "International advocacy and diplomatic efforts.",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="p-1 bg-primary/10 rounded text-primary">
                      <item.icon size={20} />
                    </span>
                    <span className="text-gray-700 font-medium">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                padding: "clamp(1.5rem, 4vw, 2rem)",
                background:
                  "linear-gradient(135deg, rgba(200,16,46,0.05) 0%, rgba(255,215,0,0.05) 100%)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow)",
              }}
              className="card"
            >
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  marginBottom: "clamp(1.5rem, 4vw, 2rem)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "var(--primary)",
                    color: "#fff",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Wallet size={24} />
                </div>
                <h3 className="heading-sm">Donation Details</h3>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(1rem, 3vw, 1.5rem)",
                }}
              >
                <div
                  style={{
                    padding: "clamp(1rem, 2vw, 1.5rem)",
                    background: "#fff",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--gray-300)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--gray-400)",
                      textTransform: "uppercase",
                      fontWeight: "700",
                      letterSpacing: "0.05em",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Direct Bank Transfer
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      fontSize: "clamp(0.875rem, 1.5vw, 0.938rem)",
                    }}
                  >
                    <p>
                      <strong>Bank:</strong> FNB Eswatini
                    </p>
                    <p>
                      <strong>Account Name:</strong> PUDEMO Regional Account
                    </p>
                    <p>
                      <strong>Acc Number:</strong> 62000000000
                    </p>
                    <p>
                      <strong>Branch Code:</strong> 250000
                    </p>
                    <p>
                      <strong>Swift Code:</strong> FIRNSZM1
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    padding: "clamp(1rem, 3vw, 1.5rem)",
                    border: "2px dashed var(--gray-300)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <p
                    style={{
                      color: "var(--gray-500)",
                      fontStyle: "italic",
                      margin: 0,
                    }}
                  >
                    Online Payment Gateway Integration Pending
                  </p>
                  <button
                    disabled
                    style={{
                      marginTop: "0.5rem",
                      opacity: 0.5,
                      cursor: "not-allowed",
                      padding:
                        "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)",
                    }}
                    className="btn btn-primary"
                  >
                    Donate via Card (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <SectionHeading
              title="Become a Volunteer"
              subtitle="Your time and skills are just as valuable as financial support."
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "clamp(1.5rem, 4vw, 2rem)",
                marginTop: "clamp(2rem, 6vw, 3rem)",
              }}
            >
              {[
                {
                  title: "Skill Sharing",
                  icon: Shield,
                  desc: "Legal practitioners, doctors, and professionals lending their expertise.",
                },
                {
                  title: "Mobilizing",
                  icon: Megaphone,
                  desc: "Organizing in local communities and building branch structures.",
                },
                {
                  title: "Digital Advocacy",
                  icon: Globe,
                  desc: "Spreading our message online and managing social awareness.",
                },
              ].map((v, i) => (
                <div
                  key={i}
                  style={{
                    padding: "clamp(1.5rem, 4vw, 2rem)",
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, var(--dark) 0%, var(--dark-muted) 100%)",
                    color: "#fff",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  className="card transition-all hover:shadow-lg"
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "clamp(1rem, 3vw, 1.5rem)",
                    }}
                  >
                    <v.icon size={32} />
                  </div>
                  <h4
                    style={{ marginBottom: "clamp(0.75rem, 2vw, 1rem)" }}
                    className="heading-sm"
                  >
                    {v.title}
                  </h4>
                  <p
                    style={{
                      color: "var(--gray-400)",
                      fontSize: "clamp(0.875rem, 1.5vw, 0.938rem)",
                    }}
                  >
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "clamp(1.5rem, 4vw, 2rem)",
              }}
            >
              <Link href="/contact" className="btn btn-secondary btn-lg">
                Apply to Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Helper imports for lucide icons that weren't in the main import
import { Megaphone, Globe } from "lucide-react";
