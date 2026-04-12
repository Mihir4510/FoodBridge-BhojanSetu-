import Navbar from "../components/Navbar";
import Hero from "../components/Herosection";
import HowItWorks from "../components/HowItWorks";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import { DriverCTABanner } from "../components/DriverCTABanner";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <DriverCTABanner />
      <CTA />
      <Footer />
    </>
  );
};

export default LandingPage;