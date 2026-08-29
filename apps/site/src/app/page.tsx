import Articles from "@/app/components/Articles/Articles";
import Image from 'next/image'

export default function Home() {
  return (
    <>
        <div className="md:col-span-4 sm:col-span-1">
          <h2 style={{marginTop: "0px"}}>Arsène Rurangiza</h2>
          <p>
            I work as a software engineer at DPG Media. I like to build tools that help you learn and connect ideas.
          </p>
        </div>
      <section className="mt-12">
        <h4>Writings</h4>
        <Articles/>
      </section>
    </>
  );
}
