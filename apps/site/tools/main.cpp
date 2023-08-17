#include "MarkdownToHTML.hpp"



int main()
{
    // Declarations
    Markdown                    md;
    std::vector<std::string>    mdFiles;
    
    // Convert Markdown to HTML 
    try {
        // list all md files in directory
        mdFiles = md.getMarkdownFiles("../pages/");
        // create their HTML equivalent
        for (std::string mdFile : mdFiles) {
            std::cout << mdFile << std::endl;
            md.convertToHTML(mdFile);
            std::cout << "------------------- finished conversion -------------------\n";
            return 0; // TODO: remove
        }
    }
    catch (...) {
        std::cout << CRED << "Error: " << CRESET
                  << "something went wrong\n";
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}