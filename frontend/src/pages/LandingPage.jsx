import Navbar from "../components/Navbar";
import Hero from "../components/Herosection";
import HowItWorks from "../components/HowItWorks";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      
      <CTA />
      <Footer />
    </>
  );
};

export default LandingPage;