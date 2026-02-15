import Link from "next/link";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  overlay?: boolean;
  height?: string;
}

export default function HeroBanner({
  title,
  subtitle,
  backgroundImage = "/images/mario_header.jpeg",
  primaryCta,
  secondaryCta,
  overlay = true,
  height = "85vh",
}: HeroBannerProps) {
  return (
    <section
      style={{
        position: "relative",
        minHeight: height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(200,16,46,0.6) 100%)",
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 800,
          padding: "clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 1.5rem)",
          color: "#fff",
        }}
        className="animate-fade-in-up"
      >
        <h1
          className="heading-xl"
          style={{
            marginBottom: "1.25rem",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: "clamp(1.063rem, 2vw, 1.25rem)",
              lineHeight: 1.7,
              opacity: 0.9,
              maxWidth: 600,
              margin: "0 auto 2rem",
            }}
          >
            {subtitle}
          </p>
        )}

        {(primaryCta || secondaryCta) && (
          <div
            style={{
              display: "flex",
              gap: "clamp(0.75rem, 2vw, 1.5rem)",
              justifyContent: "center",
              flexDirection: "column",
              flexWrap: "wrap",
            }}
            className="sm:flex-row"
          >
            {primaryCta && (
              <Link href={primaryCta.href} className="btn btn-primary btn-lg">
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link href={secondaryCta.href} className="btn btn-outline btn-lg">
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
