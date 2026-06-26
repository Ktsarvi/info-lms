import Navbar from '@/components/homepage/navbar'
import Hero from '@/components/homepage/hero'
import Pricing from '@/components/homepage/pricing'
import Footer from '@/components/homepage/footer'

const Page = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Pricing />
      <Footer />
    </main>
  )
}

export default Page