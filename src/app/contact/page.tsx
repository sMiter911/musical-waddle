import SectionHeading from "@/components/ui/SectionHeading";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <main>
            <section className="section mt-12">
                <div className="container">
                    <SectionHeading title="Get In Touch" subtitle="Have questions or want to learn more? Reach out to our team." />

                    <div className="grid lg:grid-cols-3 gap-12 mt-12">
                        <div className="lg:col-span-1 space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Main Office</h4>
                                    <p className="text-gray-600">P.O. Box 1000, Manzini<br />Eswatini</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Phone</h4>
                                    <p className="text-gray-600">+268 2505 0000</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Email</h4>
                                    <p className="text-gray-600">info@pudemo.org</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 card p-8 md:p-12">
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label" htmlFor="name">Full Name</label>
                                    <input type="text" id="name" className="form-input" placeholder="Jane Doe" required />
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="email">Email Address</label>
                                    <input type="email" id="email" className="form-input" placeholder="jane@example.com" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="form-label" htmlFor="subject">Subject</label>
                                    <input type="text" id="subject" className="form-input" placeholder="How can we help?" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="form-label" htmlFor="message">Message</label>
                                    <textarea id="message" className="form-input form-textarea" placeholder="Your message here..." required></textarea>
                                </div>
                                <div className="md:col-span-2 text-right">
                                    <button type="submit" className="btn btn-primary btn-lg w-full md:w-auto">
                                        <Send size={18} className="mr-2" />
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-[400px] w-full bg-gray-200 flex items-center justify-center text-gray-400">
                [Interactive Map Placeholder]
            </div>
        </main>
    );
}
