import Navbar from "@/components/homepage/navbar";
import Hero from "@/components/homepage/hero";
import FAQ from "@/components/homepage/faq";
import Footer from "@/components/homepage/footer";

const Page = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FAQ />
      <Footer />
    </main>
  );
};

export default Page;
