// Markdown to HTML
// Date: Fri 11 Aug 2023

#include <iostream>
#include <fstream>

// TODO: 
// - add conditions to identify most common markdown elements (h, p, lists, quote)
// - add conditions to identify second most common (links)

#include "MarkdownToHTML.hpp"

int main()
{
    Markdown md;

    // open mardkwon file
    std::ifstream mdfile("../pages/exemple.md");
    if (!mdfile.is_open()) {
        std::cerr << "Error: couldn't open the markdown file\n";
        return EXIT_FAILURE;
    }
    // open HTML file
    std::ifstream htmlFile()

    // read line by line
    // identify markdown type
    // add corresponding HTML tags
    // write to new file
    std::string line;
    while ( std::getline( mdfile, line ) ) {

        std::cout << line << std::endl;

        // identify markdown element
        // -- isolate first word
        size_t pos = line.find( " " );
        if (pos == std::string::npos)
            continue ; // TODO: maybe add line break
        std::string prefix = line.substr(0, pos);
        // -- identify
        __unused int tag_type = md.identifyTags(prefix, line);
        // switch (tag_type) {
        //     case 0:
        //         //
        //         break ;
        //     default:
        //         //
        //         break ;
        // }
    }
    return EXIT_SUCCESS;

        // identify elements (h1, h2, p, quote, list, ...)
        // store all elements in handy data structure
            // ex: node with type of element
        // close markdown file
    // traverse data structure
        // convert each element to its HTML version
        // save to final file
    return EXIT_SUCCESS;
}