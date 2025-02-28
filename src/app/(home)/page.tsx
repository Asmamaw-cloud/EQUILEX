import FAQ from "./components/faq"
import HeroSection from "./components/heroSection"




const LandingPage = () => {
  return (
    <div className="h-full flex flex-col w-full">
        <HeroSection/>
        <FAQ/>
    </div>
  )
}

export default LandingPage