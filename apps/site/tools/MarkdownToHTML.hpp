#ifndef MARKDOWNTOHTML_HPP
    #define MARKDOWNTOHTML_HPP

    #include <iostream>

    #define CBLACK      "\033[0;30m"
    #define CGRAY       "\033[90m"
    #define CRED        "\033[0;31m"
    #define CGREEN      "\033[0;32m"
    #define CBLUE       "\033[0;94m"
    #define CYELLOW     "\033[0;33m"
    #define CMAGENTA    "\033[0;35m"
    #define CRESET      "\033[0m"
    #define CBOLD       "\x1b[1m"

    class Markdown {
        public:
            Markdown() {}
            ~Markdown() {}

            int identifyTags(const std::string& prefix, std::string& line) const {
                if (prefix == "#")
                    std::cout << CBLUE << "Header 1\n" << CRESET;
                else if (prefix == "##")
                    std::cout << CBLUE << "Header 2\n" << CRESET;
                else if (prefix == "###")
                    std::cout << CBLUE << "Header 3\n" << CRESET;
                else if (prefix == "####")
                    std::cout << CBLUE << "Header 4\n" << CRESET;
                else if (prefix == "#####")
                    std::cout << CBLUE << "Header 5\n" << CRESET;
                else if (prefix == "######")
                    std::cout << CBLUE << "Header 6\n" << CRESET;
                else if (prefix == "-") {
                    if (line.size() >= 5 && line.substr(0, 5) == "- [ ]")
                        std::cout << CBLUE << "to-do list\n" << CRESET;
                    else
                        std::cout << CBLUE << "list\n" << CRESET;
                }
                else {
                    std::cout << CBLUE << "paragraph\n" << CRESET;
                    // TODO: handle bold, italic, highlight, straighthrough
                }
                return 1;
            }

            // replace .md file extension with .html
            std::string rename();

            // add html tags to line of text based on its identified type
            void toHTML(std::string markdown);
};

#endif // MARKDOWNTOHTML_HPP
