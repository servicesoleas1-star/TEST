import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ZUIHubStory from '../components/sections/ZUIHubStory';
import FeaturedMarquee from '../components/sections/FeaturedMarquee';
import HowTimeline from '../components/sections/HowTimeline';
import Coverage from '../components/sections/Coverage';
import PricingTeaser from '../components/sections/PricingTeaser';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ZUIHubStory />
        <FeaturedMarquee />
        <HowTimeline />
        <Coverage />
        <PricingTeaser />
      </main>
      <Footer />
    </>
  );
}

export default Home;
