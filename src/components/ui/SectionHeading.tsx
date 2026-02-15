interface SectionHeadingProps {
    label?: string;
    title: string;
    subtitle?: string;
    centered?: boolean;
    light?: boolean;
}

export default function SectionHeading({
    label,
    title,
    subtitle,
    centered = true,
    light = false,
}: SectionHeadingProps) {
    return (
        <div style={{ textAlign: centered ? "center" : "left" }} className="mb-8 md:mb-12">
            {label && (
                <span
                    style={{
                        display: "inline-block",
                        fontSize: "0.813rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: light ? "var(--secondary)" : "var(--primary)",
                        marginBottom: "0.5rem",
                    }}
                >
                    {label}
                </span>
            )}
            <h2
                className="heading-lg"
                style={{
                    color: light ? "#fff" : "var(--dark)",
                    marginBottom: subtitle ? "1rem" : 0,
                }}
            >
                {title}
            </h2>
            {subtitle && (
                <p
                    style={{
                        fontSize: "clamp(1rem, 2vw, 1.063rem)",
                        lineHeight: 1.7,
                        color: light ? "rgba(255,255,255,0.7)" : "var(--gray-500)",
                        maxWidth: centered ? 600 : "none",
                        margin: centered ? "0 auto" : 0,
                    }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
