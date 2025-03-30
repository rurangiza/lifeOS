import Articles from "@/app/components/Articles/Articles";
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <div className="grid md:grid-cols-5 sm:grid-cols-1 md:gap-6">
        <div style={{maxWidth: "140px"}} className="sm:col-span-1 max-w-50 mb-8 sm:mb-8 md:mb-0 self-start p-2 rounded-sm border-2 border-[#EDEDED] -rotate-4 shadow-xl">
          <Image  width={120} height={130} src="/images/anime_photo.png" alt=""/>
          <p className="text-sm text-center font-serif italic m-0 p-0"><a target="_blank" href="https://x.com/arurangi">@twitter</a></p>
        </div>
        <div className="md:col-span-4 sm:col-span-1">
          <h2 style={{marginTop: "0px"}}>Arsène Rurangiza</h2>
          <p>
            I'm a software developer focused on building AI systems for the web. I created this blog to learn by sharing, and the topics will mostly be about Large Language Models (LLMs): how they work and how to use them.
          </p>
        </div>
      </div>
      <section className="mt-12">
        <h4>Writings</h4>
        <Articles/>
      </section>
    </>
  );
}
