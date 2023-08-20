// Markdown To HTML
// descrption: this program takes all the markdown files in a given folder
//             and converts them to HTML files in the public folder

#include "MarkdownToHTML.hpp"

int main()
{
    Markdown                    md;
    std::vector<std::string>    mdFiles;
    
    try {
        mdFiles = md.getMarkdownFiles( "../pages/" ); // maybe no hard coded, main argv??
        for ( std::string mdFile : mdFiles )
            md.convertToHTML( mdFile );
    }
    catch (...) {
        std::cout << CRED << "Error: " << CRESET
                  << "something went wrong\n";
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}