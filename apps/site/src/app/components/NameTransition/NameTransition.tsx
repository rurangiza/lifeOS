import { unstable_ViewTransition as ViewTransition } from "react";

interface NameTransitionProps {
  name: string;
  nickname: string,
}

export function NameTransition({ name='Arsène Rurangiza', nickname='ars' }: NameTransitionProps) {
  return (
    <ViewTransition>
      <h1 className="font-medium pt-12">
        <span className="sr-only">name</span>
        <span
          aria-hidden="true"
          className="block overflow-hidden group relative"
        >
          <span className="inline-block transition-all duration-300 ease-in-out group-hover:-translate-y-full whitespace-nowrap">
            {`${name}`.split("").map((letter, index) => (
              <span
                key={index}
                className="inline-block"
                style={{ transitionDelay: `${index * 25}ms` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </span>
          <span className="inline-block absolute left-0 top-0 transition-all duration-300 ease-in-out translate-y-full group-hover:translate-y-0">
            {`${nickname}`.split("").map((letter, index) => (
              <span
                key={index}
                className="inline-block"
                style={{ transitionDelay: `${index * 25}ms` }}
              >
                {letter}
              </span>
            ))}
          </span>
        </span>
      </h1>
    </ViewTransition>
  );
}
