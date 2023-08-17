#ifndef MARKDOWNTOHTML_HPP
    #define MARKDOWNTOHTML_HPP

    #include <iostream>
    #include <fstream>
    #include <string>
    #include <filesystem>
    #include <vector>

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

            static int identifyTags(const std::string& prefix, std::string& line);
            // replace .md file extension with .html
            static std::string rename(std::string markdownFileName);
            // add html tags to line of text based on its identified type
            void convertToHTML(std::string markdown);
            // 
            std::vector<std::string> getMarkdownFiles(std::string folder);

    };

#endif // MARKDOWNTOHTML_HPP
