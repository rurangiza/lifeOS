export default function Footer() {
  const links = [
    { name: "Twitter", url: "https://x.com/arurangi" },
    { name: "Linkedin", url: "https://www.linkedin.com/in/arsenerurangiza/" },
    { name: "Github", url: "https://github.com/rurangiza" },
  ];

  return (
    <footer className="mt-6 text-center">
      <div className="flex justify-center space-x-4 tracking-tight">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors duration-200"
          >
            {link.name}
          </a>
        ))}
      </div>
    </footer>
  );
}
