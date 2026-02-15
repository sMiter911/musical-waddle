import SectionHeading from "@/components/ui/SectionHeading";
import HeroBanner from "@/components/ui/HeroBanner";
import Image from "next/image";

export default function AboutPage() {
    return (
        <main>
            <HeroBanner
                title="Our History & Mission"
                subtitle="The story of PUDEMO is the story of the Swazi people's resilience and determination for freedom."
                height="50vh"
            />

            <section className="section">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <SectionHeading
                                title="The Birth of a Movement"
                                centered={false}
                                label="Since 1983"
                            />
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                PUDEMO was founded on July 7, 1983, at the University of Swaziland. It was born out of a realization that the Tinkhundla system of governance was fundamentally undemocratic and served only the interests of the monarchy.
                            </p>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                Our founders, including the late Mario Masuku and many others, envisioned a nation where every citizen could participate in the political life of the country through a multiparty system.
                            </p>
                        </div>
                        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square relative">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 p-8 text-center">
                                [Image Placeholder: Historical Photo of Founders]
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section bg-light">
                <div className="container">
                    <SectionHeading title="Our Core Values" subtitle="The principles that guide every action we take." />
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Democracy", desc: "Sovereignty belongs to the people, not the crown." },
                            { title: "Equality", desc: "A society free from all forms of discrimination." },
                            { title: "Justice", desc: "Fair distribution of resources and wealth for all." }
                        ].map((v, i) => (
                            <div key={i} className="card p-8 text-center">
                                <h3 className="heading-sm mb-4 text-primary">{v.title}</h3>
                                <p className="text-gray-600">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <SectionHeading title="Our Leadership" subtitle="Leading with integrity and sacrifice." />
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Mock Leadership */}
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="text-center">
                                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                <h4 className="font-bold">Leader Name {i}</h4>
                                <p className="text-primary text-sm font-semibold uppercase tracking-wider">Position</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
