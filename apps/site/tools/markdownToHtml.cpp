// Markdown to HTML
// Date: Fri 11 Aug 2023

#include <iostream>
#include <fstream>

int main()
{
    // open and read mardkwon file
    std::ifstream mdfile("../pages/exemple.md");
    if (!mdfile.is_open()) {
        std::cerr << "Error: couldn't open the markdown file\n";
        return EXIT_FAILURE;
    }

    std::string line;
    while ( std::getline( mdfile, line ) ) {

        std::cout << line << std::endl;

        // identify markdown element
        // -- isolate first word
        size_t pos = line.find( " " );
        if (pos == std::string::npos) // no space found
            continue ;
        // -- identify
        if (line.substr(0, pos) == "#")
            std::cout << "----- it's a header 1\n";

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