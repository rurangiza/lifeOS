NAME	=	mdtoHTML
FILE	=	markdownToHTML.cpp main.cpp

COMPILER	=	c++ -std=c++17
FLAGS		=	-Wall -Werror -Wextra

all:
	$(COMPILER) $(FLAGS) -o $(NAME) $(FILE)

run:
	./$(NAME)
clean:
	rm -f $(NAME)

fclean: clean

re:	clean all

.PHONY: all clean fclean re