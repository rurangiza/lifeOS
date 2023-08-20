// Markdown to HTML
// Date: Fri 11 Aug 2023



// TODO: 
// - add conditions to identify most common markdown elements (h, p, lists, quote)
// - add conditions to identify second most common (links)

/*

- headers
- paragraphs
- lists (ordered, unordered)
- quotes
- 

*/

#include "MarkdownToHTML.hpp"

typedef enum Tags {
    _h1, _h2, _h3, _h4, _h5, _h6,
    _p,
    _ulist, _olist,
    _quote,
    _link,
    _img
} Tags ;

int Markdown::identifyTags(const std::string& prefix, std::string& line)
{
    if (prefix == "#")
        return _h1; //std::cout << CBLUE << "Header 1\n" << CRESET;
    else if (prefix == "##")
        return _h2; // std::cout << CBLUE << "Header 2\n" << CRESET;
    else if (prefix == "###")
        return _h3; // std::cout << CBLUE << "Header 3\n" << CRESET;
    else if (prefix == "####")
        return _h4; // std::cout << CBLUE << "Header 4\n" << CRESET;
    else if (prefix == "#####")
        return _h5; // std::cout << CBLUE << "Header 5\n" << CRESET;
    else if (prefix == "######")
        return _h6; // std::cout << CBLUE << "Header 6\n" << CRESET;
    else if (prefix == "-") {
        if (line.size() >= 5 && line.substr(0, 5) == "- [ ]")
            return _olist; // std::cout << CBLUE << "to-do list\n" << CRESET;
        else
            return _ulist; // std::cout << CBLUE << "list\n" << CRESET;
    }
    else {
        return _p; // std::cout << CBLUE << "paragraph\n" << CRESET;
        // TODO: handle bold, italic, highlight, straighthrough
    }
    return 1;
}

// replace .md file extension with .html
std::string Markdown::rename(std::string md) {

    std::string     res;
    size_t          start_of_extension  = md.find(".md");
    std::string     prefix              = "../public/";
    int             prefix_size         = prefix.size() - 1;

    if (start_of_extension == std::string::npos)
        res = nullptr;
    else {
        res = md.substr(0, start_of_extension) + ".html";
        res = prefix + res.substr(prefix_size, md.size());
    }
    std::cout << CRED << res << CRESET << std::endl;
    
    return res;
}

// add html tags to line of text based on its identified type
void Markdown::convertToHTML(std::string markdownFileName) {

    std::cout << ">>> " << markdownFileName << std::endl;

    // open markdown file
    std::ifstream mdFile(markdownFileName);
    if (!mdFile.is_open()) {
        std::cerr << "Error: couldn't open the markdown file\n";
        throw std::exception();
    }

    // open HTML file
    std::ofstream htmlFile;
    std::string name = Markdown::rename(markdownFileName);
    std::cout << ">>> " << name << std::endl;
    htmlFile.open( name , std::ios::trunc ); // maybe renameToHTML

    // something
    std::string line;
    while ( std::getline( mdFile, line ) ) {

        // identify markdown element
        // -- isolate first word
        size_t pos = line.find( " " );
        if (pos == std::string::npos)
            continue ;
        std::string prefix = line.substr(0, pos);

        // -- identify
        __unused int tag_type = Markdown::identifyTags(prefix, line);
        switch (tag_type) {
            case _h1:
                // remove markdown tag
                htmlFile << "<h1>" + line + "</h1>" << std::endl;
                break ;
            case _h2:
                // remove markdown tag
                htmlFile << "<h2>" + line + "</h2>" << std::endl;
                break ;
            case _h3:
                // remove markdown tag
                htmlFile << "<h3>" + line + "</h3>" << std::endl;
                break ;
            case _h4:
                // remove markdown tag
                htmlFile << "<h4>" + line + "</h4>" << std::endl;
                break ;
            case _h5:
                // remove markdown tag
                htmlFile << "<h5>" + line + "</h5>" << std::endl;
                break ;
            case _h6:
                // remove markdown tag
                htmlFile << "<h6>" + line + "</h6>" << std::endl;
                break ;
            case _p:
                // remove markdown tag
                htmlFile << "<p>" + line + "</p>";
                break ;
            default:
                std::cout << CBLUE << "Not recognized\n" << CRESET;
                break ;
        }
    }

    mdFile.close();
    htmlFile.close();
}

std::vector<std::string> Markdown::getMarkdownFiles(std::string folder) {

    std::vector<std::string> bucket;

    for (const auto & entry : std::filesystem::directory_iterator(folder)) {
        std::string path = entry.path();
        if (path.find(".md") == path.size() - 3) // last 3 characters are .md
            bucket.push_back(path);
    }
    return bucket;
}